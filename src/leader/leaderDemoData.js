/**
 * Mock cohort analytics for the leader dashboard demo.
 * In production, series would come from an API keyed by org + filters.
 */

/** Short labels for demo charts — align to MSHS Y7 Task 2: Persuasive Spoken (issue-bank ids on the server side in production). */
const M7 = {
  appPov: 'Application: POV & reasons',
  appCtx: 'Application: SCHC & values',
  orgMain: 'Organisation: main (TEEL)',
  textG: 'Textual: spoken grammar & tone',
  orgStruct: 'Organisation: intro / rebuttal / close',
  textDel: 'Textual: delivery & rehearsal',
}

export const FILTER_OPTIONS = {
  year: ['Whole school', 'Year 7', 'Year 9', 'Year 10', 'Year 11'],
  subject: ['All subjects', 'English', 'History', 'Science'],
  range: ['This term', 'Last 8 weeks', 'Last half term'],
}

const WEEK_LABELS = [
  '2 Sep',
  '9 Sep',
  '16 Sep',
  '23 Sep',
  '30 Sep',
  '7 Oct',
  '14 Oct',
  '21 Oct',
]

/** Pre-built datasets; key = `${year}|${subject}|${range}` with fallbacks. */
const PRESETS = {
  default: {
    briefBullets: [
      'Task 2 (Persuasive Spoken) drafts: “Application — POV & reasons” and “Organisation — main (TEEL)” are the most used tags in this window.',
      '“Textual — spoken grammar & tone” is high as students shift from written-style sentences to a script that sounds speakable.',
      'After the debate-scaffold review, rebuttal and context (SCHC) are tracking up—useful to align with the paper sheet’s “Prioritise” column.',
    ],
    kpis: [
      { id: 'events', label: 'Feedback events', value: '1,240', sub: '↑ 12% vs previous window', trend: 'up' },
      { id: 'teachers', label: 'Teachers using Feedback OS', value: '34', sub: 'of 38 classroom staff' },
      { id: 'top', label: 'Largest share of items', value: M7.orgMain, sub: '27% of all structured items' },
    ],
    series: [
      { key: 'm7-org-main', label: M7.orgMain, color: '#1d4ed8', values: [42, 45, 48, 44, 46, 50, 47, 45] },
      { key: 'm7-app-pov', label: M7.appPov, color: '#7c3aed', values: [28, 30, 25, 24, 22, 20, 19, 18] },
      { key: 'm7-text-grammar', label: M7.textG, color: '#0d9488', values: [20, 21, 20, 22, 23, 22, 22, 21] },
      { key: 'm7-app-schc', label: M7.appCtx, color: '#c2410c', values: [16, 15, 18, 17, 19, 16, 17, 16] },
    ],
    emerging: [
      { title: M7.textG, delta: '+12%', copy: 'Drafts still read like essays—rehearsal and read-aloud minis in class may help before final recording or live delivery.' },
      { title: M7.appCtx, delta: '+8%', copy: 'More tags for context and values; align with the sheet’s social / historical / cultural row.' },
    ],
    improving: [
      { title: M7.orgMain, delta: '−6%', copy: 'After explicit TEEL modelling, main-argument items are a little less frequent as a share of total.' },
      { title: M7.appPov, delta: 'stable', copy: 'Still a core focus—expected for first formal spoken task of the year.' },
    ],
  },
  'Year 10|History|Last 8 weeks': {
    briefBullets: [
      'Year 10 History: a different task family from Y7 spoken—this filter is for cross-subject comparison in the demo only.',
    ],
    kpis: [
      { id: 'events', label: 'Feedback events', value: '186', sub: '↑ 6% vs previous window', trend: 'up' },
      { id: 'teachers', label: 'Contributing teachers', value: '5', sub: 'History team' },
      { id: 'top', label: 'Largest share of items', value: M7.orgMain, sub: '34% in this filter (demo)' },
    ],
    series: [
      { key: 'm7-org-main', label: M7.orgMain, color: '#1d4ed8', values: [18, 20, 22, 21, 19, 23, 24, 22] },
      { key: 'm7-app-pov', label: M7.appPov, color: '#0f766e', values: [14, 12, 15, 16, 14, 15, 13, 12] },
      { key: 'm7-text-grammar', label: M7.textG, color: '#0d9488', values: [9, 8, 10, 9, 11, 9, 10, 8] },
      { key: 'm7-app-schc', label: M7.appCtx, color: '#c2410c', values: [11, 12, 10, 11, 10, 12, 11, 10] },
    ],
    emerging: [
      { title: M7.appCtx, delta: '+5%', copy: 'Demo data only for this subject filter.' },
    ],
    improving: [
      { title: M7.orgMain, delta: 'stable', copy: '—' },
    ],
  },
  'Year 7|All subjects|This term': {
    briefBullets: [
      'Year 7 English: Task 2 draft feedback clusters on Application (POV, context) and Organisation (intro, TEEL, rebuttal, conclusion) before QLearn + Turnitin.',
      'Textual features (vocabulary, spoken grammar, delivery) often rise as students move from script to performance—align with the sheet’s Textual Features block.',
      'Use “Prioritise” on the paper sheet alongside this tool so students get one clear focus list for revision.',
    ],
    kpis: [
      { id: 'events', label: 'Feedback events', value: '420', sub: 'Year 7 English draft window (demo)' },
      { id: 'teachers', label: 'English team', value: '6', sub: 'using the shared issue bank' },
      { id: 'top', label: 'Largest share of items', value: M7.orgMain, sub: '24% of items' },
    ],
    series: [
      { key: 'm7-text-grammar', label: M7.textG, color: '#0d9488', values: [32, 34, 35, 36, 33, 32, 34, 35] },
      { key: 'm7-org-main', label: M7.orgMain, color: '#7c3aed', values: [26, 25, 27, 24, 23, 25, 26, 24] },
      { key: 'm7-app-pov', label: M7.appPov, color: '#1d4ed8', values: [18, 19, 17, 18, 20, 19, 18, 19] },
      { key: 'm7-text-delivery', label: M7.textDel, color: '#c2410c', values: [10, 11, 10, 12, 12, 13, 12, 11] },
    ],
    emerging: [
      { title: M7.textDel, delta: '+15%', copy: 'Common as students rehearse—matches the verbal / nonverbal row on the MSHS sheet.' },
    ],
    improving: [
      { title: M7.orgStruct, delta: '−4%', copy: 'Slightly fewer “whole section” intro/conclusion items after whole-class model.' },
    ],
  },
}

/**
 * @param {{ year: string, subject: string, range: string }} filters
 */
export function getLeaderDashboardData(filters) {
  const { year, subject, range } = filters
  const key = `${year}|${subject}|${range}`
  if (PRESETS[key]) {
    return { weekLabels: WEEK_LABELS, ...PRESETS[key], filterKey: key }
  }
  if (year === 'Year 10' && subject === 'History' && range === 'Last 8 weeks') {
    return { weekLabels: WEEK_LABELS, ...PRESETS['Year 10|History|Last 8 weeks'], filterKey: key }
  }
  if (year === 'Year 7' && range === 'This term') {
    return { weekLabels: WEEK_LABELS, ...PRESETS['Year 7|All subjects|This term'], filterKey: key }
  }
  return { weekLabels: WEEK_LABELS, ...PRESETS.default, filterKey: 'default' }
}
