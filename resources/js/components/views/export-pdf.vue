<script>
// routes/export-pdf.js
// Express route — drop-in replacement for Next.js /api/export-pdf
// Install: npm install jspdf jspdf-autotable axios

import express from 'express'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Design System Constants ──────────────────────────────────────────────────
const NAVY      = [15, 23, 42]
const NAVY_800  = [30, 41, 59]
const BLUE_700  = [29, 78, 216]
const BLUE_600  = [37, 99, 235]
const BLUE_500  = [59, 130, 246]
const BLUE_100  = [219, 234, 254]
const SLATE_50  = [248, 250, 252]
const SLATE_700 = [51, 65, 85]
const WHITE     = [255, 255, 255]
const GREEN     = [16, 185, 129]
const GREEN_DARK= [5, 150, 105]
const AMBER     = [245, 158, 11]
const RED       = [239, 68, 68]
const GRAY_200  = [226, 232, 240]
const GRAY_300  = [203, 213, 225]
const CYAN      = [6, 182, 212]
const CYAN_DARK = [8, 145, 178]

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 12

// ── Helper: parse MongoDB date format ────────────────────────────────────────
function parseMongoDate(dateVal) {
  if (!dateVal) return new Date()
  if (dateVal instanceof Date) return dateVal
  if (typeof dateVal === 'string') return new Date(dateVal)
  if (dateVal.$date) {
    const inner = dateVal.$date
    if (inner.$numberLong) return new Date(parseInt(inner.$numberLong))
    if (typeof inner === 'string') return new Date(inner)
    if (typeof inner === 'number') return new Date(inner)
  }
  return new Date()
}

// ── Helper: Draw rounded rect ────────────────────────────────────────────────
function drawRoundedRect(doc, x, y, w, h, r, options = {}) {
  if (options.fill) doc.setFillColor(...options.fill)
  if (options.stroke) {
    doc.setDrawColor(...options.stroke)
    doc.setLineWidth(options.lineWidth || 0.3)
  }
  const style = options.fill && options.stroke ? 'FD' : options.fill ? 'F' : 'S'
  doc.roundedRect(x, y, w, h, r, r, style)
}

// ── Helper: Draw circle ──────────────────────────────────────────────────────
function drawCircle(doc, x, y, r, color, opacity) {
  if (opacity !== undefined) {
    try {
      doc.saveGraphicsState?.()
      const gs = doc.GState ? new doc.GState({ opacity }) : null
      if (gs) doc.setGState(gs)
    } catch {}
  }
  doc.setFillColor(...color)
  doc.circle(x, y, r, 'F')
  if (opacity !== undefined) {
    try { doc.restoreGraphicsState?.() } catch {}
  }
}

// ── Helper: Draw KPI card ────────────────────────────────────────────────────
function drawKpiCard(doc, x, y, w, h, label, value, accent, icon) {
  drawRoundedRect(doc, x, y, w, h, 2, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
  doc.setFillColor(...accent)
  doc.rect(x, y, w, 1.5, 'F')
  drawCircle(doc, x + w / 2, y + 6, 4, accent)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text(icon, x + w / 2, y + 7.2, { align: 'center' })
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...NAVY)
  doc.text(value, x + w / 2, y + 17, { align: 'center' })
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...SLATE_700)
  doc.text(label.toUpperCase(), x + w / 2, y + 22, { align: 'center' })
}

// ── Helper: Draw stat row ────────────────────────────────────────────────────
function drawStatRow(doc, x, y, w, h, label, value, accent, icon) {
  drawRoundedRect(doc, x, y, w, h, 2, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
  doc.setFillColor(...accent)
  doc.rect(x, y + 2, 1.2, h - 4, 'F')
  drawCircle(doc, x + 8, y + h / 2, 3.5, accent)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(icon, x + 8, y + h / 2 + 1.2, { align: 'center' })
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...SLATE_700)
  doc.text(label.toUpperCase(), x + 15, y + h / 2 - 2)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...NAVY)
  doc.text(value, x + 15, y + h / 2 + 4)
}

// ── Helper: Draw horizontal bar ──────────────────────────────────────────────
function drawHorizontalBar(doc, x, y, maxW, h, value, maxValue, color, label, showValue) {
  const barW = maxValue > 0 ? (value / maxValue) * maxW : 0
  doc.setFillColor(...SLATE_50)
  doc.roundedRect(x, y, maxW, h, 1.5, 1.5, 'F')
  if (barW > 0) {
    doc.setFillColor(...color)
    doc.roundedRect(x, y, Math.max(barW, 3), h, 1.5, 1.5, 'F')
  }
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY)
  doc.text(label, x - 2, y + h / 2 + 1, { align: 'right' })
  if (showValue) {
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...NAVY)
    doc.text(value.toString(), x + maxW + 3, y + h / 2 + 1)
  }
}

// ── Cover Page ───────────────────────────────────────────────────────────────
function drawCoverPage(doc, logoBase64, employee, from, to, type) {
  const panelW = PAGE_W * 0.55
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, panelW, PAGE_H, 'F')
  doc.setFillColor(...BLUE_600)
  doc.rect(panelW - 3, 0, 6, PAGE_H, 'F')

  drawCircle(doc, panelW - 20, 30, 25, NAVY_800, 0.3)
  drawCircle(doc, 15, PAGE_H - 40, 18, NAVY_800, 0.25)
  drawCircle(doc, 8, 20, 3, CYAN, 0.3)
  drawCircle(doc, 25, 35, 1.5, BLUE_500, 0.4)
  drawCircle(doc, PAGE_W - 15, 25, 20, BLUE_100, 0.4)
  drawCircle(doc, PAGE_W - 35, PAGE_H - 50, 15, BLUE_100, 0.3)

  if (logoBase64) {
    try { doc.addImage(logoBase64, 'PNG', 15, 15, 40, 16) } catch {}
  }

  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(38)
  doc.setTextColor(255, 255, 255)
  doc.text('ACTIVITY', 15, 95)
  doc.text('REPORT', 15, 110)

  doc.setFillColor(...CYAN)
  doc.rect(15, 116, 40, 1.5, 'F')
  doc.setFillColor(...BLUE_500)
  doc.rect(56, 116, 12, 1.5, 'F')

  doc.setFont('Helvetica', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY_300)
  doc.text('Performance & Progress Tracking', 15, 125)

  const cardX = panelW + 12
  const cardY = 75
  const cardW = PAGE_W - panelW - 22
  const cardH = 80
  drawRoundedRect(doc, cardX, cardY, cardW, cardH, 3, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.4 })
  doc.setFillColor(...BLUE_600)
  doc.rect(cardX, cardY + 6, 1.5, cardH - 12, 'F')

  const items = [
    { label: 'EMPLOYEE', value: employee },
    { label: 'DATE RANGE', value: `${from}  -  ${to}` },
    { label: 'REPORT TYPE', value: type.toUpperCase() },
  ]
  items.forEach((item, i) => {
    const iy = cardY + 14 + i * 22
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...BLUE_600)
    doc.text(item.label, cardX + 8, iy)
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...NAVY_800)
    doc.text(item.value, cardX + 8, iy + 7, { maxWidth: cardW - 15 })
  })

  doc.setFillColor(...BLUE_600)
  doc.rect(0, PAGE_H - 5, PAGE_W, 5, 'F')
  doc.setFillColor(...CYAN)
  doc.rect(0, PAGE_H - 6, PAGE_W, 1, 'F')

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text(`Generated: ${today}`, PAGE_W / 2, PAGE_H - 1.5, { align: 'center' })
}

// ── Section Divider ──────────────────────────────────────────────────────────
function drawSectionDivider(doc, title, subtitle) {
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  drawCircle(doc, PAGE_W - 30, 40, 45, NAVY_800, 0.3)
  drawCircle(doc, 20, PAGE_H - 60, 30, NAVY_800, 0.25)
  drawCircle(doc, 30, 50, 2, CYAN, 0.3)
  drawCircle(doc, PAGE_W - 40, PAGE_H - 80, 1.5, BLUE_500, 0.35)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(255, 255, 255)
  doc.text(title, PAGE_W / 2, PAGE_H / 2 - 10, { align: 'center' })
  doc.setFillColor(...CYAN)
  doc.rect(PAGE_W / 2 - 25, PAGE_H / 2, 50, 1.2, 'F')
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(...GRAY_300)
  doc.text(subtitle, PAGE_W / 2, PAGE_H / 2 + 12, { align: 'center' })
  doc.setFillColor(...BLUE_600)
  doc.rect(0, PAGE_H - 3, PAGE_W, 3, 'F')
}

// ── Page Header + Footer ─────────────────────────────────────────────────────
function drawPageHeader(doc, heading, pageNum) {
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_W, 18, 'F')
  doc.setFillColor(...BLUE_500)
  doc.rect(0, 18, PAGE_W, 1.2, 'F')
  doc.setFillColor(...CYAN)
  doc.rect(0, 19.2, PAGE_W, 0.6, 'F')
  drawCircle(doc, PAGE_W - 12, 5, 10, BLUE_700, 0.35)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(255, 255, 255)
  doc.text(heading, MARGIN, 12)
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY_300)
  doc.text('www.innovaturelabs.com', PAGE_W - MARGIN, 12, { align: 'right' })
  doc.setFillColor(...NAVY)
  doc.rect(0, PAGE_H - 5, PAGE_W, 5, 'F')
  doc.setFillColor(...BLUE_500)
  doc.rect(0, PAGE_H - 5.8, PAGE_W, 0.8, 'F')
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY_300)
  doc.text(pageNum.toString().padStart(2, '0'), PAGE_W - MARGIN, PAGE_H - 1.5, { align: 'right' })
  doc.setFont('Helvetica', 'italic')
  doc.setFontSize(6)
  doc.text('CONFIDENTIAL', MARGIN, PAGE_H - 1.5)
}

// ── Dashboard Page ───────────────────────────────────────────────────────────
function drawDashboardPage(doc, total, completed, pending, blockers, pageNum) {
  doc.setFillColor(...SLATE_50)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  drawPageHeader(doc, 'Dashboard Overview', pageNum)

  const cards = [
    { label: 'Total Tasks',  value: total.toString(),     color: BLUE_600, icon: '#' },
    { label: 'Completed',    value: completed.toString(), color: GREEN,    icon: '✓' },
    { label: 'Pending',      value: pending.toString(),   color: AMBER,    icon: '⏳' },
    { label: 'Blockers',     value: blockers.toString(),  color: RED,      icon: '⚠' },
  ]

  const cardW = 40, cardH = 28, gap = 6
  const totalW = cards.length * cardW + (cards.length - 1) * gap
  const startX = (PAGE_W - totalW) / 2

  cards.forEach((card, i) => {
    drawKpiCard(doc, startX + i * (cardW + gap), 28, cardW, cardH, card.label, card.value, card.color, card.icon)
  })

  const chartY = 64
  const chartX = MARGIN + 5
  const chartW = PAGE_W - 2 * MARGIN - 10

  drawRoundedRect(doc, MARGIN, chartY - 4, PAGE_W - 2 * MARGIN, 65, 3, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text('Task Breakdown', MARGIN + 6, chartY + 4)

  const barData = [
    { label: 'Completed', value: completed, color: GREEN },
    { label: 'Pending',   value: pending,   color: AMBER },
    { label: 'Blockers',  value: blockers,  color: RED   },
  ]
  const maxVal = Math.max(completed, pending, blockers, 1)
  const barStartX = chartX + 30
  const barMaxW = chartW - 42

  barData.forEach((bar, i) => {
    drawHorizontalBar(doc, barStartX, chartY + 14 + i * 14, barMaxW, 6, bar.value, maxVal, bar.color, bar.label, true)
  })

  // Stacked progress bar
  const stackY = chartY + 56
  const stackW = PAGE_W - 2 * MARGIN - 20
  const stackX = MARGIN + 10

  doc.setFillColor(...SLATE_50)
  doc.roundedRect(stackX, stackY, stackW, 5, 2, 2, 'F')

  const totalVal = completed + pending + blockers || 1
  let currentX = stackX
  ;[{ val: completed, color: GREEN }, { val: pending, color: AMBER }, { val: blockers, color: RED }].forEach(seg => {
    const segW = (seg.val / totalVal) * stackW
    if (segW > 0) {
      doc.setFillColor(...seg.color)
      doc.roundedRect(currentX, stackY, Math.max(segW, 2), 5, 2, 2, 'F')
      currentX += segW
    }
  })

  // Summary stats
  const summaryY = 138
  drawRoundedRect(doc, MARGIN, summaryY - 4, PAGE_W - 2 * MARGIN, 80, 3, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text('Summary Statistics', MARGIN + 6, summaryY + 4)

  const statData = [
    { label: 'Total Tasks',      value: total.toString(),     accent: BLUE_600,   icon: '#' },
    { label: 'Completed Tasks',  value: completed.toString(), accent: GREEN_DARK, icon: '✓' },
    { label: 'Pending Tasks',    value: pending.toString(),   accent: AMBER,      icon: '⏳' },
    { label: 'Blockers Found',   value: blockers.toString(),  accent: RED,        icon: '⚠' },
  ]
  statData.forEach((stat, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    drawStatRow(doc, MARGIN + 6 + col * 90, summaryY + 10 + row * 30, 82, 22, stat.label, stat.value, stat.accent, stat.icon)
  })
}

// ── Key Insights Page ────────────────────────────────────────────────────────
function drawInsightsPage(doc, totalHours, avgDuration, completionRate, blockerRate, total, completed, blockers, leaderboard, employee, from, to, pageNum) {
  doc.setFillColor(...SLATE_50)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  drawPageHeader(doc, 'Key Insights', pageNum)

  const insights = [
    { icon: '✓', label: 'Completion Rate', value: `${completionRate}%`, color: GREEN,     desc: `${completed} of ${total} tasks completed` },
    { icon: '★', label: 'Most Active',     value: leaderboard[0]?.name || 'N/A',          color: BLUE_600,  desc: leaderboard[0] ? `${leaderboard[0].count} tasks` : '' },
    { icon: '⚠', label: 'Blocker Rate',   value: `${blockerRate}%`,    color: RED,        desc: `${blockers} blockers across ${total} tasks` },
    { icon: '⏱', label: 'Avg Duration',   value: `${avgDuration} min`, color: CYAN_DARK,  desc: `${totalHours} total minutes logged` },
  ]

  const insCardW = 82, insCardH = 45, insGapX = 10, insGapY = 10
  const insStartX = (PAGE_W - 2 * insCardW - insGapX) / 2
  const insStartY = 30

  insights.forEach((ins, i) => {
    const row = Math.floor(i / 2)
    const col = i % 2
    const ix = insStartX + col * (insCardW + insGapX)
    const iy = insStartY + row * (insCardH + insGapY)

    drawRoundedRect(doc, ix, iy, insCardW, insCardH, 2.5, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
    doc.setFillColor(...ins.color)
    doc.rect(ix, iy, insCardW, 1.5, 'F')
    drawCircle(doc, ix + insCardW / 2, iy + 10, 5, ins.color)
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text(ins.icon, ix + insCardW / 2, iy + 11.5, { align: 'center' })
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...SLATE_700)
    doc.text(ins.label.toUpperCase(), ix + insCardW / 2, iy + 20, { align: 'center' })
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...NAVY)
    doc.text(ins.value, ix + insCardW / 2, iy + 30, { align: 'center', maxWidth: insCardW - 8 })
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...SLATE_700)
    doc.text(ins.desc, ix + insCardW / 2, iy + 37, { align: 'center', maxWidth: insCardW - 8 })
  })

  if (leaderboard.length > 0) {
    const lbY = insStartY + 2 * (insCardH + insGapY) + 10
    drawRoundedRect(doc, MARGIN, lbY, PAGE_W - 2 * MARGIN, 75, 3, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...NAVY)
    doc.text('Employee Leaderboard', MARGIN + 6, lbY + 8)

    const barEntries = leaderboard.slice(0, 8)
    const maxCount = barEntries[0]?.count || 1
    const lbBarStartX = MARGIN + 45
    const lbBarMaxW = PAGE_W - 2 * MARGIN - 60

    barEntries.forEach((entry, i) => {
      const by = lbY + 16 + i * 7.5
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...NAVY)
      doc.text(entry.name, lbBarStartX - 3, by + 3.5, { align: 'right', maxWidth: 28 })
      const barW = (entry.count / maxCount) * lbBarMaxW
      doc.setFillColor(...SLATE_50)
      doc.roundedRect(lbBarStartX, by, lbBarMaxW, 5, 1.5, 1.5, 'F')
      const barColor = i === 0 ? BLUE_600 : i === 1 ? CYAN_DARK : BLUE_500
      doc.setFillColor(...barColor)
      doc.roundedRect(lbBarStartX, by, Math.max(barW, 3), 5, 1.5, 1.5, 'F')
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(...NAVY)
      doc.text(entry.count.toString(), lbBarStartX + lbBarMaxW + 3, by + 3.5)
    })
  }

  doc.setFont('Helvetica', 'italic')
  doc.setFontSize(7)
  doc.setTextColor(...SLATE_700)
  doc.text(`Report generated for ${employee} | ${from} to ${to}`, PAGE_W / 2, PAGE_H - 12, { align: 'center' })
}

// ── Thank You Page ───────────────────────────────────────────────────────────
function drawThankYouPage(doc, logoBase64) {
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  drawCircle(doc, PAGE_W / 2, PAGE_H / 2, 60, NAVY_800, 0.3)
  drawCircle(doc, PAGE_W - 25, 30, 30, BLUE_700, 0.25)
  drawCircle(doc, 20, PAGE_H - 50, 22, BLUE_700, 0.25)
  drawCircle(doc, 40, 60, 2, CYAN, 0.3)
  drawCircle(doc, PAGE_W - 50, PAGE_H - 70, 1.5, BLUE_500, 0.35)
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(42)
  doc.setTextColor(255, 255, 255)
  doc.text('THANK YOU', PAGE_W / 2, PAGE_H / 2 - 25, { align: 'center' })
  doc.setFillColor(...CYAN)
  doc.rect(PAGE_W / 2 - 22, PAGE_H / 2 - 15, 30, 1.2, 'F')
  doc.setFillColor(...BLUE_500)
  doc.rect(PAGE_W / 2 + 9, PAGE_H / 2 - 15, 13, 1.2, 'F')
  doc.setFont('Helvetica', 'italic')
  doc.setFontSize(13)
  doc.setTextColor(...GRAY_300)
  doc.text('For your time and attention', PAGE_W / 2, PAGE_H / 2, { align: 'center' })
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...BLUE_500)
  doc.text('www.innovaturelabs.com', PAGE_W / 2, PAGE_H / 2 + 15, { align: 'center' })
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...SLATE_700)
  doc.text(`Report generated on ${today}`, PAGE_W / 2, PAGE_H / 2 + 25, { align: 'center' })
  if (logoBase64) {
    try { doc.addImage(logoBase64, 'PNG', PAGE_W / 2 - 18, PAGE_H / 2 + 35, 36, 14) } catch {}
  }
  doc.setFillColor(...BLUE_600)
  doc.rect(0, PAGE_H - 3, PAGE_W, 3, 'F')
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/export-pdf
// Query params: employee, from, to, type
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const employee = req.query.employee || 'All Employees'
    const from     = req.query.from     || ''
    const to       = req.query.to       || ''
    const type     = req.query.type     || 'all'

    // ── Fetch activities from YOUR MongoDB API ─────────────────────────────
    // Replace this URL with your actual backend API endpoint
    const apiBase = process.env.API_BASE_URL || 'http://localhost:3000'
    const activitiesRes = await axios.get(`${apiBase}/api/activities`, {
      params: { from, to }
    })
    let activities = activitiesRes.data || []

    // ── Parse dates ────────────────────────────────────────────────────────
    activities = activities.map(a => ({
      ...a,
      date: parseMongoDate(a.date)
    }))

    // ── Filter ─────────────────────────────────────────────────────────────
    const start = new Date(from); start.setHours(0, 0, 0, 0)
    const end   = new Date(to);   end.setHours(23, 59, 59, 999)

    const filtered = activities.filter(a => {
      const rowDate = new Date(a.date); rowDate.setHours(0, 0, 0, 0)
      if (employee !== 'All Employees' && a.member_name !== employee) return false
      if (rowDate < start || rowDate > end) return false
      if (type === 'pending'   && a.status  !== 'pending')   return false
      if (type === 'completed' && a.status  !== 'completed') return false
      if (type === 'blocker'   && a.blocker !== true && a.blocker !== 'TRUE') return false
      return true
    })

    // ── Compute stats ──────────────────────────────────────────────────────
    const total      = filtered.length
    const completed  = filtered.filter(a => a.status === 'completed').length
    const pending    = filtered.filter(a => a.status === 'pending').length
    const blockers   = filtered.filter(a => a.blocker === true || a.blocker === 'TRUE').length
    const totalMins  = filtered.reduce((sum, a) => sum + (parseInt(a.duration) || 0), 0)
    const avgDuration    = total ? (totalMins / total).toFixed(1) : '0'
    const completionRate = total ? ((completed / total) * 100).toFixed(1) : '0'
    const blockerRate    = total ? ((blockers  / total) * 100).toFixed(1) : '0'

    const employeeMap = {}
    filtered.forEach(a => {
      employeeMap[a.member_name] = (employeeMap[a.member_name] || 0) + 1
    })
    const leaderboard = Object.entries(employeeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))

    // ── Load logo ──────────────────────────────────────────────────────────
    let logoBase64 = null
    try {
      const logoPath = path.join(__dirname, '..', 'public', 'company_logo.jpeg')
      const imageBuffer = fs.readFileSync(logoPath)
      logoBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
    } catch {}

    // ── Build PDF ──────────────────────────────────────────────────────────
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Page 1: Cover
    drawCoverPage(doc, logoBase64, employee, from, to, type)

    // Page 2: Section Divider
    doc.addPage()
    drawSectionDivider(doc, 'DASHBOARD & ANALYTICS', 'Key metrics and performance overview')

    // Page 3: Dashboard
    doc.addPage()
    drawDashboardPage(doc, total, completed, pending, blockers, 3)

    // Page 4: Section Divider
    doc.addPage()
    drawSectionDivider(doc, 'KEY INSIGHTS', 'Performance analysis and employee breakdown')

    // Page 5: Insights + Leaderboard
    doc.addPage()
    drawInsightsPage(doc, totalMins, avgDuration, completionRate, blockerRate, total, completed, blockers, leaderboard, employee, from, to, 5)

    // Page 6: Section Divider
    doc.addPage()
    drawSectionDivider(doc, 'DETAILED DATA', 'Activity log and records')

    // Page 7+: Activities Table
    doc.addPage()

    const tableBody = filtered.map(a => [
      a.member_name   || '',
      new Date(a.date).toLocaleDateString('en-US'),
      a.activity_type_id || '',   // swap with type name if you join the data
      a.description   || '',
      `${a.duration || 0} min`,
      a.status        || '',
    ])

    autoTable(doc, {
      head: [['Name', 'Date', 'Type', 'Description', 'Duration', 'Status']],
      body: tableBody,
      startY: 28,
      margin: { top: 28, bottom: 14, left: MARGIN, right: MARGIN },
      styles: { fontSize: 8, overflow: 'linebreak', cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.3, font: 'helvetica' },
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center', cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 65 },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 22, halign: 'center' },
      },
      alternateRowStyles: { fillColor: BLUE_100 },
      bodyStyles: { fillColor: [255, 255, 255], textColor: NAVY_800 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const val = (data.cell.raw || '').toLowerCase()
          if (val === 'completed') {
            data.cell.styles.fillColor = GREEN
            data.cell.styles.textColor = [255, 255, 255]
            data.cell.styles.fontStyle = 'bold'
          } else if (val === 'pending') {
            data.cell.styles.fillColor = AMBER
            data.cell.styles.textColor = [255, 255, 255]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
      didDrawPage: () => {
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber
        drawPageHeader(doc, 'Recent Activities', currentPage)
      },
    })

    // Last Page: Thank You
    doc.addPage()
    drawThankYouPage(doc, logoBase64)

    // ── Send PDF ───────────────────────────────────────────────────────────
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="Activity_Report.pdf"')
    res.send(pdfBuffer)

  } catch (err) {
    console.error('PDF Export Error:', err)
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})

export default router
</script>
