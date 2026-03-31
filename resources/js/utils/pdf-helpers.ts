// src/utils/pdf-helpers.ts
// All jsPDF drawing helper functions — import these in activity-reports.vue

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
export const NAVY       = [15, 23, 42]
export const NAVY_800   = [30, 41, 59]
export const BLUE_700   = [29, 78, 216]
export const BLUE_600   = [37, 99, 235]
export const BLUE_500   = [59, 130, 246]
export const BLUE_100   = [219, 234, 254]
export const SLATE_50   = [248, 250, 252]
export const SLATE_700  = [51, 65, 85]
export const WHITE      = [255, 255, 255]
export const GREEN      = [16, 185, 129]
export const GREEN_DARK = [5, 150, 105]
export const AMBER      = [245, 158, 11]
export const RED        = [239, 68, 68]
export const GRAY_200   = [226, 232, 240]
export const GRAY_300   = [203, 213, 225]
export const CYAN       = [6, 182, 212]
export const CYAN_DARK  = [8, 145, 178]
export const PAGE_W     = 210
export const PAGE_H     = 297
export const MARGIN     = 12

// ═══════════════════════════════════════════════════════════════════════════════
// DATE HELPER
// ═══════════════════════════════════════════════════════════════════════════════
export function parseDate(dateVal: any): Date {
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

export function formatDate(dateVal: any): string {
  return parseDate(dateVal).toLocaleDateString()
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVE DRAWING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
export function drawRoundedRect(
  doc: jsPDF,
  x: number, y: number, w: number, h: number, r: number,
  options: { fill?: number[]; stroke?: number[]; lineWidth?: number } = {}
) {
  if (options.fill)   doc.setFillColor(options.fill[0], options.fill[1], options.fill[2])
  if (options.stroke) {
    doc.setDrawColor(options.stroke[0], options.stroke[1], options.stroke[2])
    doc.setLineWidth(options.lineWidth || 0.3)
  }
  const style = options.fill && options.stroke ? 'FD' : options.fill ? 'F' : 'S'
  doc.roundedRect(x, y, w, h, r, r, style)
}

export function drawCircle(doc: jsPDF, x: number, y: number, r: number, color: number[]) {
  doc.setFillColor(color[0], color[1], color[2])
  doc.circle(x, y, r, 'F')
}

export function drawHorizontalBar(
  doc: jsPDF,
  x: number, y: number, maxW: number, h: number,
  value: number, maxValue: number,
  color: number[], label: string, showValue: boolean
) {
  const barW = maxValue > 0 ? (value / maxValue) * maxW : 0
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2])
  doc.roundedRect(x, y, maxW, h, 1.5, 1.5, 'F')
  if (barW > 0) {
    doc.setFillColor(color[0], color[1], color[2])
    doc.roundedRect(x, y, Math.max(barW, 3), h, 1.5, 1.5, 'F')
  }
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(7.5)
  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text(label, x - 2, y + h / 2 + 1, { align: 'right' })
  if (showValue) {
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(7.5)
    doc.text(value.toString(), x + maxW + 3, y + h / 2 + 1)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT DRAWING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
export function drawKpiCard(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  label: string, value: string, accent: number[], icon: string
) {
  drawRoundedRect(doc, x, y, w, h, 2, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
  doc.setFillColor(accent[0], accent[1], accent[2])
  doc.rect(x, y, w, 1.5, 'F')
  drawCircle(doc, x + w / 2, y + 6, 4, accent)
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(255, 255, 255)
  doc.text(icon, x + w / 2, y + 7.2, { align: 'center' })
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text(value, x + w / 2, y + 17, { align: 'center' })
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(SLATE_700[0], SLATE_700[1], SLATE_700[2])
  doc.text(label.toUpperCase(), x + w / 2, y + 22, { align: 'center' })
}

export function drawStatRow(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  label: string, value: string, accent: number[], icon: string
) {
  drawRoundedRect(doc, x, y, w, h, 2, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
  doc.setFillColor(accent[0], accent[1], accent[2])
  doc.rect(x, y + 2, 1.2, h - 4, 'F')
  drawCircle(doc, x + 8, y + h / 2, 3.5, accent)
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(255, 255, 255)
  doc.text(icon, x + 8, y + h / 2 + 1.2, { align: 'center' })
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(SLATE_700[0], SLATE_700[1], SLATE_700[2])
  doc.text(label.toUpperCase(), x + 15, y + h / 2 - 2)
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text(value, x + 15, y + h / 2 + 4)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE DRAWING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
export function drawPageHeader(doc: jsPDF, heading: string, pageNum: number) {
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]); doc.rect(0, 0, PAGE_W, 18, 'F')
  doc.setFillColor(BLUE_500[0], BLUE_500[1], BLUE_500[2]); doc.rect(0, 18, PAGE_W, 1.2, 'F')
  doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]); doc.rect(0, 19.2, PAGE_W, 0.6, 'F')
  drawCircle(doc, PAGE_W - 12, 5, 10, BLUE_700)
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(255, 255, 255)
  doc.text(heading, MARGIN, 12)
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(GRAY_300[0], GRAY_300[1], GRAY_300[2])
  doc.text('www.innovaturelabs.com', PAGE_W - MARGIN, 12, { align: 'right' })
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]); doc.rect(0, PAGE_H - 5, PAGE_W, 5, 'F')
  doc.setFillColor(BLUE_500[0], BLUE_500[1], BLUE_500[2]); doc.rect(0, PAGE_H - 5.8, PAGE_W, 0.8, 'F')
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(GRAY_300[0], GRAY_300[1], GRAY_300[2])
  doc.text(pageNum.toString().padStart(2, '0'), PAGE_W - MARGIN, PAGE_H - 1.5, { align: 'right' })
  doc.setFont('Helvetica', 'italic'); doc.setFontSize(6)
  doc.text('CONFIDENTIAL', MARGIN, PAGE_H - 1.5)
}

export function drawCoverPage(
  doc: jsPDF,
  logoBase64: string | null,
  employee: string, from: string, to: string, type: string
) {
  const panelW = PAGE_W * 0.55
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]); doc.rect(0, 0, panelW, PAGE_H, 'F')
  doc.setFillColor(BLUE_600[0], BLUE_600[1], BLUE_600[2]); doc.rect(panelW - 3, 0, 6, PAGE_H, 'F')
  drawCircle(doc, panelW - 20, 30, 25, NAVY_800)
  drawCircle(doc, 15, PAGE_H - 40, 18, NAVY_800)
  drawCircle(doc, PAGE_W - 15, 25, 20, BLUE_100)
  drawCircle(doc, PAGE_W - 35, PAGE_H - 50, 15, BLUE_100)

  if (logoBase64) { try { doc.addImage(logoBase64, 'PNG', 15, 15, 40, 16) } catch {} }

  doc.setFont('Helvetica', 'bold'); doc.setFontSize(38); doc.setTextColor(255, 255, 255)
  doc.text('ACTIVITY', 15, 95); doc.text('REPORT', 15, 110)
  doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]); doc.rect(15, 116, 40, 1.5, 'F')
  doc.setFillColor(BLUE_500[0], BLUE_500[1], BLUE_500[2]); doc.rect(56, 116, 12, 1.5, 'F')
  doc.setFont('Helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(GRAY_300[0], GRAY_300[1], GRAY_300[2])
  doc.text('Performance & Progress Tracking', 15, 125)

  const cardX = panelW + 12, cardY = 75, cardW = PAGE_W - panelW - 22, cardH = 80
  drawRoundedRect(doc, cardX, cardY, cardW, cardH, 3, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.4 })
  doc.setFillColor(BLUE_600[0], BLUE_600[1], BLUE_600[2]); doc.rect(cardX, cardY + 6, 1.5, cardH - 12, 'F')

  ;[
    { label: 'EMPLOYEE',    value: employee },
    { label: 'DATE RANGE',  value: `${from}  -  ${to}` },
    { label: 'REPORT TYPE', value: type.toUpperCase() },
  ].forEach((item, i) => {
    const iy = cardY + 14 + i * 22
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(BLUE_600[0], BLUE_600[1], BLUE_600[2])
    doc.text(item.label, cardX + 8, iy)
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(NAVY_800[0], NAVY_800[1], NAVY_800[2])
    doc.text(item.value, cardX + 8, iy + 7, { maxWidth: cardW - 15 })
  })

  doc.setFillColor(BLUE_600[0], BLUE_600[1], BLUE_600[2]); doc.rect(0, PAGE_H - 5, PAGE_W, 5, 'F')
  doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]); doc.rect(0, PAGE_H - 6, PAGE_W, 1, 'F')
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(255, 255, 255)
  doc.text(`Generated: ${today}`, PAGE_W / 2, PAGE_H - 1.5, { align: 'center' })
}

export function drawSectionDivider(doc: jsPDF, title: string, subtitle: string) {
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]); doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  drawCircle(doc, PAGE_W - 30, 40, 45, NAVY_800)
  drawCircle(doc, 20, PAGE_H - 60, 30, NAVY_800)
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(32); doc.setTextColor(255, 255, 255)
  doc.text(title, PAGE_W / 2, PAGE_H / 2 - 10, { align: 'center' })
  doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]); doc.rect(PAGE_W / 2 - 25, PAGE_H / 2, 50, 1.2, 'F')
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(GRAY_300[0], GRAY_300[1], GRAY_300[2])
  doc.text(subtitle, PAGE_W / 2, PAGE_H / 2 + 12, { align: 'center' })
  doc.setFillColor(BLUE_600[0], BLUE_600[1], BLUE_600[2]); doc.rect(0, PAGE_H - 3, PAGE_W, 3, 'F')
}

export function drawDashboardPage(
  doc: jsPDF,
  total: number, completed: number, pending: number, blockers: number,
  pageNum: number
) {
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]); doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  drawPageHeader(doc, 'Dashboard Overview', pageNum)

  const cards = [
    { label: 'Total Tasks', value: total.toString(),     color: BLUE_600, icon: '#' },
    { label: 'Completed',   value: completed.toString(), color: GREEN,    icon: '+' },
    { label: 'Pending',     value: pending.toString(),   color: AMBER,    icon: '~' },
    { label: 'Blockers',    value: blockers.toString(),  color: RED,      icon: '!' },
  ]
  const cardW = 40, cardH = 28, gap = 6
  const startX = (PAGE_W - (cards.length * cardW + (cards.length - 1) * gap)) / 2
  cards.forEach((c, i) => drawKpiCard(doc, startX + i * (cardW + gap), 28, cardW, cardH, c.label, c.value, c.color, c.icon))

  const chartY = 64, chartX = MARGIN + 5, chartW = PAGE_W - 2 * MARGIN - 10
  drawRoundedRect(doc, MARGIN, chartY - 4, PAGE_W - 2 * MARGIN, 65, 3, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text('Task Breakdown', MARGIN + 6, chartY + 4)

  const maxVal = Math.max(completed, pending, blockers, 1)
  ;[
    { label: 'Completed', value: completed, color: GREEN },
    { label: 'Pending',   value: pending,   color: AMBER },
    { label: 'Blockers',  value: blockers,  color: RED   },
  ].forEach((bar, i) => drawHorizontalBar(doc, chartX + 30, chartY + 14 + i * 14, chartW - 42, 6, bar.value, maxVal, bar.color, bar.label, true))

  // Stacked progress bar
  const stackY = chartY + 56, stackW = PAGE_W - 2 * MARGIN - 20, stackX = MARGIN + 10
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]); doc.roundedRect(stackX, stackY, stackW, 5, 2, 2, 'F')
  const totalVal = completed + pending + blockers || 1
  let cx = stackX
  ;[{ val: completed, color: GREEN }, { val: pending, color: AMBER }, { val: blockers, color: RED }].forEach(seg => {
    const segW = (seg.val / totalVal) * stackW
    if (segW > 0) { doc.setFillColor(seg.color[0], seg.color[1], seg.color[2]); doc.roundedRect(cx, stackY, Math.max(segW, 2), 5, 2, 2, 'F'); cx += segW }
  })

  // Summary stats
  const summaryY = 138
  drawRoundedRect(doc, MARGIN, summaryY - 4, PAGE_W - 2 * MARGIN, 80, 3, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
  doc.text('Summary Statistics', MARGIN + 6, summaryY + 4)
  ;[
    { label: 'Total Tasks',     value: total.toString(),     accent: BLUE_600,   icon: '#' },
    { label: 'Completed Tasks', value: completed.toString(), accent: GREEN_DARK, icon: '+' },
    { label: 'Pending Tasks',   value: pending.toString(),   accent: AMBER,      icon: '~' },
    { label: 'Blockers Found',  value: blockers.toString(),  accent: RED,        icon: '!' },
  ].forEach((stat, i) => drawStatRow(doc, MARGIN + 6 + (i % 2) * 90, summaryY + 10 + Math.floor(i / 2) * 30, 82, 22, stat.label, stat.value, stat.accent, stat.icon))
}

export function drawInsightsPage(
  doc: jsPDF,
  totalMins: number, avgDuration: string, completionRate: string, blockerRate: string,
  total: number, completed: number, blockers: number,
  leaderboard: { name: string; count: number }[],
  employee: string, from: string, to: string,
  pageNum: number
) {
  doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]); doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  drawPageHeader(doc, 'Key Insights', pageNum)

  const insCardW = 82, insCardH = 45, insGapX = 10, insGapY = 10
  const insStartX = (PAGE_W - 2 * insCardW - insGapX) / 2, insStartY = 30

  ;[
    { icon: '+', label: 'Completion Rate', value: `${completionRate}%`, color: GREEN,    desc: `${completed} of ${total} tasks completed` },
    { icon: '*', label: 'Most Active',     value: leaderboard[0]?.name || 'N/A',         color: BLUE_600,  desc: leaderboard[0] ? `${leaderboard[0].count} tasks` : '' },
    { icon: '!', label: 'Blocker Rate',    value: `${blockerRate}%`,    color: RED,       desc: `${blockers} blockers across ${total} tasks` },
    { icon: 'T', label: 'Avg Duration',    value: `${avgDuration} min`, color: CYAN_DARK, desc: `${totalMins} total minutes logged` },
  ].forEach((ins, i) => {
    const ix = insStartX + (i % 2) * (insCardW + insGapX)
    const iy = insStartY + Math.floor(i / 2) * (insCardH + insGapY)
    drawRoundedRect(doc, ix, iy, insCardW, insCardH, 2.5, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
    doc.setFillColor(ins.color[0], ins.color[1], ins.color[2]); doc.rect(ix, iy, insCardW, 1.5, 'F')
    drawCircle(doc, ix + insCardW / 2, iy + 10, 5, ins.color)
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(255, 255, 255)
    doc.text(ins.icon, ix + insCardW / 2, iy + 11.5, { align: 'center' })
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(SLATE_700[0], SLATE_700[1], SLATE_700[2])
    doc.text(ins.label.toUpperCase(), ix + insCardW / 2, iy + 20, { align: 'center' })
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
    doc.text(ins.value, ix + insCardW / 2, iy + 30, { align: 'center', maxWidth: insCardW - 8 })
    doc.setFont('Helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(SLATE_700[0], SLATE_700[1], SLATE_700[2])
    doc.text(ins.desc, ix + insCardW / 2, iy + 37, { align: 'center', maxWidth: insCardW - 8 })
  })

  if (leaderboard.length > 0) {
    const lbY = insStartY + 2 * (insCardH + insGapY) + 10
    drawRoundedRect(doc, MARGIN, lbY, PAGE_W - 2 * MARGIN, 75, 3, { fill: WHITE, stroke: GRAY_200, lineWidth: 0.3 })
    doc.setFont('Helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
    doc.text('Employee Leaderboard', MARGIN + 6, lbY + 8)
    const entries = leaderboard.slice(0, 8), maxCount = entries[0]?.count || 1
    const lbStartX = MARGIN + 45, lbMaxW = PAGE_W - 2 * MARGIN - 60
    entries.forEach((entry, i) => {
      const by = lbY + 16 + i * 7.5
      doc.setFont('Helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
      doc.text(entry.name, lbStartX - 3, by + 3.5, { align: 'right', maxWidth: 28 })
      doc.setFillColor(SLATE_50[0], SLATE_50[1], SLATE_50[2]); doc.roundedRect(lbStartX, by, lbMaxW, 5, 1.5, 1.5, 'F')
      const bc = i === 0 ? BLUE_600 : i === 1 ? CYAN_DARK : BLUE_500
      doc.setFillColor(bc[0], bc[1], bc[2]); doc.roundedRect(lbStartX, by, Math.max((entry.count / maxCount) * lbMaxW, 3), 5, 1.5, 1.5, 'F')
      doc.setFont('Helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(NAVY[0], NAVY[1], NAVY[2])
      doc.text(entry.count.toString(), lbStartX + lbMaxW + 3, by + 3.5)
    })
  }

  doc.setFont('Helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(SLATE_700[0], SLATE_700[1], SLATE_700[2])
  doc.text(`Report generated for ${employee} | ${from} to ${to}`, PAGE_W / 2, PAGE_H - 12, { align: 'center' })
}

export function drawThankYouPage(doc: jsPDF, logoBase64: string | null) {
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]); doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
  drawCircle(doc, PAGE_W / 2, PAGE_H / 2, 60, NAVY_800)
  drawCircle(doc, PAGE_W - 25, 30, 30, BLUE_700)
  drawCircle(doc, 20, PAGE_H - 50, 22, BLUE_700)
  doc.setFont('Helvetica', 'bold'); doc.setFontSize(42); doc.setTextColor(255, 255, 255)
  doc.text('THANK YOU', PAGE_W / 2, PAGE_H / 2 - 25, { align: 'center' })
  doc.setFillColor(CYAN[0], CYAN[1], CYAN[2]); doc.rect(PAGE_W / 2 - 22, PAGE_H / 2 - 15, 30, 1.2, 'F')
  doc.setFillColor(BLUE_500[0], BLUE_500[1], BLUE_500[2]); doc.rect(PAGE_W / 2 + 9, PAGE_H / 2 - 15, 13, 1.2, 'F')
  doc.setFont('Helvetica', 'italic'); doc.setFontSize(13); doc.setTextColor(GRAY_300[0], GRAY_300[1], GRAY_300[2])
  doc.text('For your time and attention', PAGE_W / 2, PAGE_H / 2, { align: 'center' })
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(BLUE_500[0], BLUE_500[1], BLUE_500[2])
  doc.text('www.innovaturelabs.com', PAGE_W / 2, PAGE_H / 2 + 15, { align: 'center' })
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.setFont('Helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(SLATE_700[0], SLATE_700[1], SLATE_700[2])
  doc.text(`Report generated on ${today}`, PAGE_W / 2, PAGE_H / 2 + 25, { align: 'center' })
  if (logoBase64) { try { doc.addImage(logoBase64, 'PNG', PAGE_W / 2 - 18, PAGE_H / 2 + 35, 36, 14) } catch {} }
  doc.setFillColor(BLUE_600[0], BLUE_600[1], BLUE_600[2]); doc.rect(0, PAGE_H - 3, PAGE_W, 3, 'F')
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PDF BUILDER
// Called from activity-reports.vue with already-filtered data from props
// ═══════════════════════════════════════════════════════════════════════════════
export function buildActivityPDF(params: {
  employee: string
  from: string
  to: string
  reportType: string
  filtered: any[]
  activityTypes: any[]
  logoBase64?: string | null
}) {
  const { employee, from, to, reportType, filtered, activityTypes, logoBase64 = null } = params

  // ── Stats ────────────────────────────────────────────────────────────
  const total      = filtered.length
  const completed  = filtered.filter(a => a.status === 'completed').length
  const pending    = filtered.filter(a => a.status === 'pending').length
  const blockers   = filtered.filter(a => a.blocker === true || a.blocker === 'TRUE').length
  const totalMins  = filtered.reduce((s, a) => s + (parseInt(a.duration) || 0), 0)
  const avgDur     = total ? (totalMins / total).toFixed(1) : '0'
  const compRate   = total ? ((completed / total) * 100).toFixed(1) : '0'
  const blkRate    = total ? ((blockers  / total) * 100).toFixed(1) : '0'

  // ── Leaderboard ──────────────────────────────────────────────────────
  const empMap: Record<string, number> = {}
  filtered.forEach(a => { empMap[a.member_name] = (empMap[a.member_name] || 0) + 1 })
  const leaderboard = Object.entries(empMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count: count as number }))

  // ── Table rows ───────────────────────────────────────────────────────
  const tableBody = filtered.map(a => [
    a.member_name || '',
    parseDate(a.date).toLocaleDateString('en-US'),
    activityTypes.find(t => t.id === a.activity_type_id)?.name || '-',
    a.description || '',
    `${a.duration || 0} min`,
    a.status || '',
  ])

  // ── Build PDF ────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  drawCoverPage(doc, logoBase64, employee, from, to, reportType)

  doc.addPage(); drawSectionDivider(doc, 'DASHBOARD & ANALYTICS', 'Key metrics and performance overview')
  doc.addPage(); drawDashboardPage(doc, total, completed, pending, blockers, 3)
  doc.addPage(); drawSectionDivider(doc, 'KEY INSIGHTS', 'Performance analysis and employee breakdown')
  doc.addPage(); drawInsightsPage(doc, totalMins, avgDur, compRate, blkRate, total, completed, blockers, leaderboard, employee, from, to, 5)
  doc.addPage(); drawSectionDivider(doc, 'DETAILED DATA', 'Activity log and records')
  doc.addPage()

  autoTable(doc, {
    head: [['Name', 'Date', 'Type', 'Description', 'Duration', 'Status']],
    body: tableBody,
    startY: 28,
    margin: { top: 28, bottom: 14, left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, overflow: 'linebreak', cellPadding: 3, lineColor: [226, 232, 240] as any, lineWidth: 0.3 },
    headStyles: { fillColor: NAVY as any, textColor: [255, 255, 255] as any, fontSize: 8, fontStyle: 'bold', halign: 'center', cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 65 },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
    },
    alternateRowStyles: { fillColor: BLUE_100 as any },
    bodyStyles: { fillColor: [255, 255, 255] as any, textColor: NAVY_800 as any },
    didParseCell: (data: any) => {
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
      drawPageHeader(doc, 'Recent Activities', (doc as any).internal.getCurrentPageInfo().pageNumber)
    },
  })

  doc.addPage(); drawThankYouPage(doc, logoBase64)

  // ── Download in browser ──────────────────────────────────────────────
  doc.save(`Activity_Report_${employee}_${from}_${to}.pdf`)
}
