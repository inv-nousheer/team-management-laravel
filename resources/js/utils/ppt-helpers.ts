// src/utils/ppt-helpers.ts
// All PptxGenJS slide building functions — import in activity-reports.vue
// Install: npm install pptxgenjs

import PptxGenJS from 'pptxgenjs'
import { parseDate } from './pdf-helpers'

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const NAVY      = '0F172A'
const NAVY_800  = '1E293B'
const BLUE_700  = '1D4ED8'
const BLUE_600  = '2563EB'
const BLUE_500  = '3B82F6'
const BLUE_100  = 'DBEAFE'
const SLATE_50  = 'F8FAFC'
const SLATE_700 = '334155'
const WHITE     = 'FFFFFF'
const GREEN     = '10B981'
const GREEN_DARK= '059669'
const AMBER     = 'F59E0B'
const RED       = 'EF4444'
const GRAY_200  = 'E2E8F0'
const GRAY_300  = 'CBD5E1'
const CYAN      = '06B6D4'
const CYAN_DARK = '0891B2'
const INDIGO    = '6366F1'
const SLIDE_W   = 13.33
const SLIDE_H   = 7.5

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function applyCoverLayout(slide: PptxGenJS.Slide) {
  // Left navy panel
  slide.addShape('rect', { x: 0, y: 0, w: SLIDE_W * 0.58, h: SLIDE_H, fill: { color: NAVY } })

  // Diagonal accent strip
  slide.addShape('rect', { x: SLIDE_W * 0.55, y: 0, w: 0.8, h: SLIDE_H, fill: { color: BLUE_600 }, rotate: 3 })

  // Decorative circles
  slide.addShape('ellipse', { x: SLIDE_W - 2.5, y: -0.8, w: 3, h: 3, fill: { color: BLUE_100, transparency: 60 } })
  slide.addShape('ellipse', { x: SLIDE_W - 4, y: SLIDE_H - 2, w: 2.5, h: 2.5, fill: { color: BLUE_100, transparency: 70 } })
  slide.addShape('ellipse', { x: 0.5, y: 0.4, w: 0.3, h: 0.3, fill: { color: CYAN, transparency: 40 } })
  slide.addShape('ellipse', { x: 1.2, y: 0.6, w: 0.15, h: 0.15, fill: { color: BLUE_500, transparency: 50 } })

  // Bottom accent bars
  slide.addShape('rect', { x: 0, y: SLIDE_H - 0.25, w: SLIDE_W, h: 0.25, fill: { color: BLUE_600 } })
  slide.addShape('rect', { x: 0, y: SLIDE_H - 0.3, w: SLIDE_W, h: 0.05, fill: { color: CYAN } })
}

function applyHeaderLayout(slide: PptxGenJS.Slide, heading: string, slideNum?: number) {
  // Navy header band
  slide.addShape('rect', {
    x: 0, y: 0, w: SLIDE_W, h: 1.15,
    fill: { color: NAVY },
    shadow: { type: 'outer', blur: 6, offset: 3, angle: 270, color: '000000', opacity: 0.25 },
  })

  // Accent strips
  slide.addShape('rect', { x: 0, y: 1.15, w: SLIDE_W, h: 0.08, fill: { color: BLUE_500 } })
  slide.addShape('rect', { x: 0, y: 1.23, w: SLIDE_W, h: 0.04, fill: { color: CYAN } })

  // Decorative circle in header
  slide.addShape('ellipse', { x: SLIDE_W - 1.8, y: -0.3, w: 1.5, h: 1.5, fill: { color: BLUE_700, transparency: 60 } })

  // Heading
  slide.addText(heading, { x: 0.8, y: 0.25, w: 8, h: 0.7, fontSize: 26, bold: true, color: WHITE, fontFace: 'Calibri' })

  // Website
  slide.addText('www.innovaturelabs.com', { x: SLIDE_W - 4, y: 0.35, w: 3.5, align: 'right', fontSize: 11, color: GRAY_300, fontFace: 'Calibri' })

  // Footer
  slide.addShape('rect', { x: 0, y: SLIDE_H - 0.25, w: SLIDE_W, h: 0.25, fill: { color: NAVY } })
  slide.addShape('rect', { x: 0, y: SLIDE_H - 0.29, w: SLIDE_W, h: 0.04, fill: { color: BLUE_500 } })

  if (slideNum) {
    slide.addText(slideNum.toString().padStart(2, '0'), { x: SLIDE_W - 1.5, y: SLIDE_H - 0.25, w: 1, h: 0.25, align: 'center', fontSize: 9, color: GRAY_300, fontFace: 'Calibri' })
  }

  slide.addText('CONFIDENTIAL', { x: 0.5, y: SLIDE_H - 0.25, w: 2, h: 0.25, fontSize: 7, color: GRAY_300, fontFace: 'Calibri', italic: true })
}

function addSectionDivider(pptx: PptxGenJS, title: string, subtitle: string) {
  const slide = pptx.addSlide()
  slide.background = { fill: NAVY }

  slide.addShape('ellipse', { x: SLIDE_W - 4, y: -2, w: 6, h: 6, fill: { color: NAVY_800, transparency: 30 } })
  slide.addShape('ellipse', { x: -1, y: SLIDE_H - 3, w: 4, h: 4, fill: { color: NAVY_800, transparency: 40 } })
  slide.addShape('ellipse', { x: 2, y: 2, w: 0.2, h: 0.2, fill: { color: CYAN, transparency: 30 } })
  slide.addShape('ellipse', { x: 10, y: 5.5, w: 0.15, h: 0.15, fill: { color: BLUE_500, transparency: 40 } })

  slide.addText(title, { x: 1.5, y: 2.5, w: SLIDE_W - 3, h: 1.2, fontSize: 40, bold: true, color: WHITE, align: 'center', fontFace: 'Calibri' })
  slide.addShape('rect', { x: SLIDE_W / 2 - 1.5, y: 3.9, w: 3, h: 0.08, fill: { color: CYAN } })
  slide.addText(subtitle, { x: 2, y: 4.3, w: SLIDE_W - 4, h: 0.6, fontSize: 16, color: GRAY_300, align: 'center', fontFace: 'Calibri' })
  slide.addShape('rect', { x: 0, y: SLIDE_H - 0.15, w: SLIDE_W, h: 0.15, fill: { color: BLUE_600 } })

  return slide
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════

function addCoverSlide(pptx: PptxGenJS, employee: string, from: string, to: string, type: string) {
  const slide = pptx.addSlide()
  slide.background = { fill: SLATE_50 }
  applyCoverLayout(slide)

  // Title
  slide.addText('ACTIVITY\nREPORT', {
    x: 0.8, y: 2.0, w: SLIDE_W * 0.5, h: 2.2,
    fontSize: 52, bold: true, color: WHITE, fontFace: 'Calibri', lineSpacingMultiple: 1.1,
  })

  // Accent lines under title
  slide.addShape('rect', { x: 0.8, y: 4.3, w: 2.5, h: 0.1, fill: { color: CYAN } })
  slide.addShape('rect', { x: 3.4, y: 4.3, w: 0.8, h: 0.1, fill: { color: BLUE_500 } })

  // Tagline
  slide.addText('Performance & Progress Tracking', {
    x: 0.8, y: 4.6, w: 5, h: 0.5,
    fontSize: 14, color: GRAY_300, fontFace: 'Calibri', italic: true,
  })

  // Details card on right panel
  slide.addShape('roundRect', {
    x: SLIDE_W * 0.62, y: 2.2, w: 4.2, h: 3.2,
    fill: { color: WHITE }, rectRadius: 0.15,
    shadow: { type: 'outer', blur: 8, offset: 3, angle: 270, color: '000000', opacity: 0.15 },
    line: { color: GRAY_200, width: 1 },
  })

  // Left accent bar on card
  slide.addShape('rect', { x: SLIDE_W * 0.62, y: 2.4, w: 0.08, h: 2.8, fill: { color: BLUE_600 } })

  // Card content
  const cardX = SLIDE_W * 0.62 + 0.4
  ;[
    { label: 'EMPLOYEE',    value: employee },
    { label: 'DATE RANGE',  value: `${from}  -  ${to}` },
    { label: 'REPORT TYPE', value: type.toUpperCase() },
  ].forEach((item, i) => {
    const yPos = 2.5 + i * 0.9
    slide.addText(item.label, { x: cardX, y: yPos, w: 3.5, h: 0.3, fontSize: 9, bold: true, color: BLUE_600, fontFace: 'Calibri' })
    slide.addText(item.value, { x: cardX, y: yPos + 0.28, w: 3.5, h: 0.35, fontSize: 15, color: NAVY_800, fontFace: 'Calibri' })
  })
}

function addDashboardSlide(pptx: PptxGenJS, total: number, completed: number, pending: number, blockers: number) {
  const slide = pptx.addSlide()
  slide.background = { fill: SLATE_50 }
  applyHeaderLayout(slide, 'Dashboard Overview', 3)

  // KPI Cards
  const kpiCards = [
    { title: 'Total Tasks', value: total,     color: BLUE_600, icon: '#'      },
    { title: 'Completed',   value: completed, color: GREEN,    icon: '\u2713' },
    { title: 'Pending',     value: pending,   color: AMBER,    icon: '\u23F3' },
    { title: 'Blockers',    value: blockers,  color: RED,      icon: '\u26A0' },
  ]

  const cardWidth = 2.5, cardGap = 0.4
  const totalCardsW = kpiCards.length * cardWidth + (kpiCards.length - 1) * cardGap
  const startX = (SLIDE_W - totalCardsW) / 2

  kpiCards.forEach((card, i) => {
    const cx = startX + i * (cardWidth + cardGap)
    slide.addShape('roundRect', {
      x: cx, y: 1.6, w: cardWidth, h: 2.2,
      fill: { color: card.color }, rectRadius: 0.15,
      shadow: { type: 'outer', blur: 6, offset: 3, angle: 270, color: '000000', opacity: 0.2 },
    })
    slide.addShape('rect', { x: cx, y: 1.6, w: cardWidth, h: 0.5, fill: { color: WHITE, transparency: 85 } })
    slide.addText(card.icon,  { x: cx, y: 1.65, w: cardWidth, h: 0.45, align: 'center', fontSize: 18, color: WHITE, fontFace: 'Calibri' })
    slide.addText(card.value.toString(), { x: cx, y: 2.2, w: cardWidth, h: 1, align: 'center', fontSize: 44, bold: true, color: WHITE, fontFace: 'Calibri' })
    slide.addText(card.title.toUpperCase(), { x: cx, y: 3.15, w: cardWidth, h: 0.5, align: 'center', fontSize: 11, color: WHITE, fontFace: 'Calibri', bold: true })
  })

  // Bar chart container
  slide.addShape('roundRect', {
    x: 1.5, y: 4.2, w: SLIDE_W - 3, h: 2.8,
    fill: { color: WHITE }, rectRadius: 0.1,
    shadow: { type: 'outer', blur: 4, offset: 2, angle: 270, color: '000000', opacity: 0.12 },
    line: { color: GRAY_200, width: 0.5 },
  })
  slide.addText('Task Breakdown', { x: 1.8, y: 4.3, w: 4, h: 0.4, fontSize: 12, bold: true, color: NAVY_800, fontFace: 'Calibri' })
  slide.addChart(pptx.ChartType.bar,
    [{ name: 'Tasks', labels: ['Completed', 'Pending', 'Blockers'], values: [completed, pending, blockers] }],
    {
      x: 2, y: 4.6, w: SLIDE_W - 4, h: 2.2,
      showLegend: false, chartColors: [GREEN, AMBER, RED],
      barDir: 'bar', barGapWidthPct: 100,
      dataLabelPosition: 'outEnd', showDataTable: true,
      dataLabelFontSize: 11, dataLabelColor: NAVY_800,
      catAxisOrientation: 'minMax', valAxisHidden: true,
      catAxisLineShow: false, valAxisLineShow: false,
      catAxisLabelFontSize: 11, catAxisLabelFontFace: 'Calibri',
    }
  )
}

function addSummarySlide(pptx: PptxGenJS, totalMins: number, avgDuration: string, completionRate: string, completed: number, pending: number, blockers: number) {
  const slide = pptx.addSlide()
  slide.background = { fill: SLATE_50 }
  applyHeaderLayout(slide, 'Summary Overview', 4)

  // Decorative background shape
  slide.addShape('ellipse', { x: -1, y: SLIDE_H - 3, w: 3, h: 3, fill: { color: BLUE_100, transparency: 70 } })

  // Stat cards
  const statCards = [
    { label: 'Total Minutes Worked', value: `${totalMins} min`,        accent: BLUE_600,   icon: '\u23F1' },
    { label: 'Average Duration',     value: `${avgDuration} min/task`, accent: CYAN_DARK,  icon: '\u2300' },
    { label: 'Completion Rate',      value: `${completionRate}%`,      accent: GREEN_DARK, icon: '\u2713' },
  ]

  statCards.forEach((sc, i) => {
    const cy = 1.8 + i * 1.5
    slide.addShape('roundRect', {
      x: 0.8, y: cy, w: 4.8, h: 1.2, fill: { color: WHITE }, rectRadius: 0.1,
      shadow: { type: 'outer', blur: 4, offset: 2, angle: 270, color: '000000', opacity: 0.1 },
      line: { color: GRAY_200, width: 0.5 },
    })
    slide.addShape('rect', { x: 0.8, y: cy + 0.15, w: 0.08, h: 0.9, fill: { color: sc.accent } })
    slide.addShape('ellipse', { x: 1.15, y: cy + 0.2, w: 0.7, h: 0.7, fill: { color: sc.accent, transparency: 85 } })
    slide.addText(sc.icon,  { x: 1.15, y: cy + 0.2, w: 0.7, h: 0.7, align: 'center', fontSize: 18, color: sc.accent, fontFace: 'Calibri' })
    slide.addText(sc.label.toUpperCase(), { x: 2.1, y: cy + 0.15, w: 3, h: 0.35, fontSize: 9, bold: true, color: SLATE_700, fontFace: 'Calibri' })
    slide.addText(sc.value, { x: 2.1, y: cy + 0.5, w: 3, h: 0.5, fontSize: 24, bold: true, color: NAVY_800, fontFace: 'Calibri' })
  })

  // Doughnut chart container
  slide.addShape('roundRect', {
    x: 6.3, y: 1.6, w: 6.2, h: 5, fill: { color: WHITE }, rectRadius: 0.1,
    shadow: { type: 'outer', blur: 4, offset: 2, angle: 270, color: '000000', opacity: 0.1 },
    line: { color: GRAY_200, width: 0.5 },
  })
  slide.addText('Task Distribution', { x: 6.6, y: 1.7, w: 4, h: 0.4, fontSize: 12, bold: true, color: NAVY_800, fontFace: 'Calibri' })
  slide.addChart(pptx.ChartType.doughnut,
    [{ name: 'Tasks', labels: ['Completed', 'Pending', 'Blockers'], values: [completed, pending, blockers] }],
    {
      x: 6.8, y: 2.1, w: 5.2, h: 4.2,
      showLegend: true, legendPos: 'b', legendFontSize: 10,
      chartColors: [GREEN, AMBER, RED],
      dataLabelPosition: 'outEnd', showDataTable: true,
      dataLabelFontSize: 11, dataLabelColor: NAVY_800,
    }
  )
}

function addTableSlide(pptx: PptxGenJS, filtered: any[], activityTypes: any[]) {
  const slide = pptx.addSlide()
  slide.background = { fill: WHITE }
  applyHeaderLayout(slide, 'Recent Activities', 6)

  // Header row
  const headerRow = ['Name', 'Date', 'Type', 'Description', 'Duration', 'Status', 'Blocker'].map(text => ({
    text,
    options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 10, fontFace: 'Calibri', align: 'center' as const, valign: 'middle' as const },
  }))

  const tableRows: object[][] = [headerRow]

  filtered.forEach((a, idx) => {
    const isEven   = idx % 2 === 0
    const rowBg    = isEven ? BLUE_100 : WHITE
    const status   = a.status || ''
    const blocker  = a.blocker === true || a.blocker === 'TRUE'
    const typeName = activityTypes.find(t => t.id === a.activity_type_id)?.name || '-'

    const statusFill  = status === 'completed' ? GREEN : status === 'pending' ? AMBER : rowBg
    const statusColor = status === 'completed' || status === 'pending' ? WHITE : NAVY_800
    const blockerFill = blocker ? RED : rowBg
    const blockerColor= blocker ? WHITE : NAVY_800

    tableRows.push([
      { text: a.member_name || '',                                      options: { fill: { color: rowBg }, fontSize: 9, color: NAVY_800,  fontFace: 'Calibri', valign: 'middle' as const } },
      { text: parseDate(a.date).toLocaleDateString('en-US'),            options: { fill: { color: rowBg }, fontSize: 9, color: SLATE_700, fontFace: 'Calibri', align: 'center' as const, valign: 'middle' as const } },
      { text: typeName,                                                  options: { fill: { color: rowBg }, fontSize: 9, color: SLATE_700, fontFace: 'Calibri', align: 'center' as const, valign: 'middle' as const } },
      { text: a.description || '',                                       options: { fill: { color: rowBg }, fontSize: 9, color: NAVY_800,  fontFace: 'Calibri', valign: 'middle' as const } },
      { text: `${a.duration || 0} min`,                                  options: { fill: { color: rowBg }, fontSize: 9, color: SLATE_700, fontFace: 'Calibri', align: 'center' as const, valign: 'middle' as const } },
      { text: status.toUpperCase(),                                      options: { fill: { color: statusFill },  fontSize: 9, bold: true, color: statusColor,  fontFace: 'Calibri', align: 'center' as const, valign: 'middle' as const } },
      { text: blocker ? 'YES' : 'NO',                                   options: { fill: { color: blockerFill }, fontSize: 9, bold: blocker, color: blockerColor, fontFace: 'Calibri', align: 'center' as const, valign: 'middle' as const } },
    ])
  })

  slide.addTable(tableRows, {
    x: 0.4, y: 1.5, w: SLIDE_W - 0.8,
    colW: [1.8, 1.3, 1.3, 3.8, 1.0, 1.2, 1.0],
    fontSize: 9,
    border: { type: 'solid', color: GRAY_200, pt: 0.5 },
    autoPage: true,
    autoPageRepeatHeader: true,
    autoPageSlideStartY: 1.5,
  })
}

function addLeaderboardSlide(pptx: PptxGenJS, leaderboard: { name: string; count: number }[]) {
  if (leaderboard.length === 0) return

  const slide = pptx.addSlide()
  slide.background = { fill: SLATE_50 }
  applyHeaderLayout(slide, 'Employee Leaderboard', 7)

  const top3 = leaderboard.slice(0, 3)
  const podiumColors   = [BLUE_600, CYAN_DARK, INDIGO]
  const podiumHeights  = [2.8, 2.2, 1.8]
  const podiumWidth    = 2.5, podiumGap = 0.3
  const podiumTotalW   = top3.length * podiumWidth + (top3.length - 1) * podiumGap
  const podiumStartX   = (SLIDE_W - podiumTotalW) / 2
  const podiumBaseY    = 6.4

  // Show #2, #1, #3 for visual podium effect
  const podiumOrder = top3.length >= 3 ? [1, 0, 2] : top3.map((_, i) => i)

  podiumOrder.forEach((dataIdx, posIdx) => {
    if (dataIdx >= top3.length) return
    const entry = top3[dataIdx]
    const px = podiumStartX + posIdx * (podiumWidth + podiumGap)
    const ph = podiumHeights[dataIdx]
    const py = podiumBaseY - ph

    slide.addShape('roundRect', {
      x: px, y: py, w: podiumWidth, h: ph,
      fill: { color: podiumColors[dataIdx] }, rectRadius: 0.1,
      shadow: { type: 'outer', blur: 5, offset: 3, angle: 270, color: '000000', opacity: 0.2 },
    })
    slide.addText(`#${dataIdx + 1}`, { x: px, y: py + 0.2,  w: podiumWidth, h: 0.6,  align: 'center', fontSize: 28, bold: true, color: WHITE, fontFace: 'Calibri' })
    slide.addText(entry.name,        { x: px, y: py + 0.85, w: podiumWidth, h: 0.4,  align: 'center', fontSize: 12, bold: true, color: WHITE, fontFace: 'Calibri' })
    slide.addText(`${entry.count} tasks`, { x: px, y: py + 1.25, w: podiumWidth, h: 0.35, align: 'center', fontSize: 11,           color: WHITE, fontFace: 'Calibri' })
  })

  // Full bar chart if more than 3
  if (leaderboard.length > 3) {
    const barData = leaderboard.slice(0, 10)
    slide.addChart(pptx.ChartType.bar,
      [{ name: 'Tasks', labels: barData.map(e => e.name), values: barData.map(e => e.count) }],
      {
        x: 0.8, y: 1.6, w: SLIDE_W - 1.6, h: 2,
        showLegend: false, chartColors: [BLUE_600],
        barDir: 'bar', barGapWidthPct: 60,
        dataLabelPosition: 'outEnd', showDataTable: true,
        dataLabelFontSize: 10, dataLabelColor: NAVY_800,
        catAxisLabelFontSize: 10, catAxisLabelFontFace: 'Calibri',
        valAxisHidden: true, catAxisLineShow: false, valAxisLineShow: false,
      }
    )
  }
}

function addInsightsSlide(pptx: PptxGenJS, completionRate: string, blockerRate: string, avgDuration: string, totalMins: number, total: number, completed: number, blockers: number, leaderboard: { name: string; count: number }[], employee: string, from: string, to: string) {
  const slide = pptx.addSlide()
  slide.background = { fill: SLATE_50 }
  applyHeaderLayout(slide, 'Key Insights', 8)

  const insights = [
    { icon: '\u2713', label: 'Completion Rate', value: `${completionRate}%`,                              color: GREEN,    desc: `${completed} of ${total} tasks completed`         },
    { icon: '\u2605', label: 'Most Active',      value: leaderboard[0]?.name || 'N/A',                    color: BLUE_600, desc: leaderboard[0] ? `${leaderboard[0].count} tasks` : '' },
    { icon: '\u26A0', label: 'Blocker Rate',     value: `${blockerRate}%`,                                color: RED,      desc: `${blockers} blockers across ${total} tasks`       },
    { icon: '\u23F1', label: 'Avg Duration',     value: `${avgDuration} min`,                             color: CYAN_DARK,desc: `${totalMins} total minutes logged`               },
  ]

  const insightW = 2.7, insightGap = 0.35
  const insightTotalW = insights.length * insightW + (insights.length - 1) * insightGap
  const insightStartX = (SLIDE_W - insightTotalW) / 2

  insights.forEach((ins, i) => {
    const ix = insightStartX + i * (insightW + insightGap)
    const iy = 1.8

    slide.addShape('roundRect', {
      x: ix, y: iy, w: insightW, h: 3.6, fill: { color: WHITE }, rectRadius: 0.12,
      shadow: { type: 'outer', blur: 6, offset: 3, angle: 270, color: '000000', opacity: 0.12 },
      line: { color: GRAY_200, width: 0.5 },
    })
    slide.addShape('rect',    { x: ix, y: iy, w: insightW, h: 0.08, fill: { color: ins.color } })
    slide.addShape('ellipse', { x: ix + insightW / 2 - 0.45, y: iy + 0.3, w: 0.9, h: 0.9, fill: { color: ins.color, transparency: 85 } })
    slide.addText(ins.icon,                 { x: ix + insightW / 2 - 0.45, y: iy + 0.3,  w: 0.9,           h: 0.9,  align: 'center', fontSize: 24, color: ins.color,  fontFace: 'Calibri' })
    slide.addText(ins.label.toUpperCase(),  { x: ix + 0.15, y: iy + 1.35, w: insightW - 0.3, h: 0.35, align: 'center', fontSize: 9,  bold: true, color: SLATE_700, fontFace: 'Calibri' })
    slide.addText(ins.value,                { x: ix + 0.15, y: iy + 1.7,  w: insightW - 0.3, h: 0.8,  align: 'center', fontSize: 28, bold: true, color: NAVY_800,  fontFace: 'Calibri' })
    slide.addText(ins.desc,                 { x: ix + 0.15, y: iy + 2.6,  w: insightW - 0.3, h: 0.6,  align: 'center', fontSize: 10,             color: SLATE_700, fontFace: 'Calibri' })
  })

  slide.addShape('rect', { x: 2, y: 5.9, w: SLIDE_W - 4, h: 0.03, fill: { color: GRAY_200 } })
  slide.addText(`Report generated for ${employee} | ${from} to ${to}`, {
    x: 2, y: 6.0, w: SLIDE_W - 4, h: 0.4,
    align: 'center', fontSize: 9, color: SLATE_700, fontFace: 'Calibri', italic: true,
  })
}

function addThankYouSlide(pptx: PptxGenJS) {
  const slide = pptx.addSlide()
  slide.background = { fill: NAVY }

  slide.addShape('ellipse', { x: SLIDE_W / 2 - 4, y: SLIDE_H / 2 - 4, w: 8, h: 8, fill: { color: NAVY_800, transparency: 40 } })
  slide.addShape('ellipse', { x: SLIDE_W - 3, y: -1.5, w: 4, h: 4, fill: { color: BLUE_700, transparency: 70 } })
  slide.addShape('ellipse', { x: -1.5, y: SLIDE_H - 2.5, w: 3, h: 3, fill: { color: BLUE_700, transparency: 70 } })
  slide.addShape('ellipse', { x: 3,  y: 1.5, w: 0.2,  h: 0.2,  fill: { color: CYAN,      transparency: 30 } })
  slide.addShape('ellipse', { x: 10, y: 5.8, w: 0.15, h: 0.15, fill: { color: BLUE_500,  transparency: 40 } })
  slide.addShape('ellipse', { x: 8,  y: 1.2, w: 0.12, h: 0.12, fill: { color: CYAN,      transparency: 50 } })

  slide.addText('THANK YOU', { x: 1, y: 2.0, w: SLIDE_W - 2, h: 1.5, align: 'center', fontSize: 54, bold: true, color: WHITE, fontFace: 'Calibri' })

  slide.addShape('rect', { x: SLIDE_W / 2 - 1.5, y: 3.6, w: 2,   h: 0.08, fill: { color: CYAN }      })
  slide.addShape('rect', { x: SLIDE_W / 2 + 0.6, y: 3.6, w: 0.9, h: 0.08, fill: { color: BLUE_500 }  })

  slide.addText('For your time and attention', { x: 2, y: 3.9, w: SLIDE_W - 4, h: 0.6, align: 'center', fontSize: 18, color: GRAY_300, fontFace: 'Calibri', italic: true })
  slide.addText('www.innovaturelabs.com',       { x: 2, y: 4.8, w: SLIDE_W - 4, h: 0.4, align: 'center', fontSize: 14, color: BLUE_500,  fontFace: 'Calibri' })

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  slide.addText(`Report generated on ${today}`, { x: 2, y: 5.5, w: SLIDE_W - 4, h: 0.4, align: 'center', fontSize: 10, color: SLATE_700, fontFace: 'Calibri' })

  slide.addShape('rect', { x: 0, y: SLIDE_H - 0.15, w: SLIDE_W, h: 0.15, fill: { color: BLUE_600 } })
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PPT BUILDER
// Called from activity-reports.vue with already-filtered data from props
// ═══════════════════════════════════════════════════════════════════════════════
export async function buildActivityPPT(params: {
  employee: string
  from: string
  to: string
  reportType: string
  filtered: any[]
  activityTypes: any[]
}) {
  const { employee, from, to, reportType, filtered, activityTypes } = params

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

  // ── Build PPT ────────────────────────────────────────────────────────
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.theme  = { headFontFace: 'Calibri', bodyFontFace: 'Calibri' }

  // Slide 1: Cover
  addCoverSlide(pptx, employee, from, to, reportType)

  // Slide 2: Section divider
  addSectionDivider(pptx, 'DASHBOARD & ANALYTICS', 'Key metrics and performance overview')

  // Slide 3: Dashboard KPIs + bar chart
  addDashboardSlide(pptx, total, completed, pending, blockers)

  // Slide 4: Summary + doughnut chart
  addSummarySlide(pptx, totalMins, avgDur, compRate, completed, pending, blockers)

  // Slide 5: Section divider
  addSectionDivider(pptx, 'DETAILED DATA', 'Activity log and employee breakdown')

  // Slide 6+: Activities table (auto-pages)
  addTableSlide(pptx, filtered, activityTypes)

  // Slide 7: Employee leaderboard
  addLeaderboardSlide(pptx, leaderboard)

  // Slide 8: Key insights
  addInsightsSlide(pptx, compRate, blkRate, avgDur, totalMins, total, completed, blockers, leaderboard, employee, from, to)

  // Slide 9: Thank you
  addThankYouSlide(pptx)

  // ── Download in browser — zero API calls ─────────────────────────────
  await pptx.writeFile({ fileName: `Activity_Report_${employee}_${from}_${to}.pptx` })
}
