/**
 * Feedback "API" — persists send events in localStorage (swap for fetch() later).
 * @typedef {{ submission: object, comments: object[], summary?: object }} SentFeedbackPayload
 */

import { coreCodeForIssue, getIssueBank } from '../lib/issueBankStore.js'

const STORAGE_KEY = 'feedback-os.events.v1'
const CHANGED = 'feedback-os-events-changed'
const MAX_EVENTS = 200

function readList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

function writeList(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('Feedback OS: could not persist event', e)
  }
  window.dispatchEvent(new CustomEvent(CHANGED))
}

export function issueLabel(issueId) {
  if (!issueId) return 'Unknown'
  const row = getIssueBank().find((i) => i.id === issueId)
  return row ? row.title : String(issueId)
}

export function coreIssueLabel(issueId) {
  const coreCode = coreCodeForIssue(issueId)
  if (!coreCode) return 'Unknown'
  const row = getIssueBank().find((i) => i.id === coreCode)
  return row ? row.title : String(coreCode)
}

/**
 * @param {SentFeedbackPayload} data
 */
export function recordFeedbackSent(data) {
  const comments = Array.isArray(data?.comments) ? data.comments : []
  const issueCounts = {}
  const priorityCounts = { high: 0, medium: 0, low: 0 }
  for (const c of comments) {
    if (c.issueId) {
      issueCounts[c.issueId] = (issueCounts[c.issueId] || 0) + 1
    }
    const p = c.priority
    if (p === 'high' || p === 'medium' || p === 'low') priorityCounts[p] += 1
  }
  const event = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    sentAt: new Date().toISOString(),
    commentCount: comments.length,
    issueCounts,
    priorityCounts,
  }
  const list = readList()
  list.push(event)
  if (list.length > MAX_EVENTS) list.splice(0, list.length - MAX_EVENTS)
  writeList(list)
}

export function listRawEvents() {
  return readList()
}

function formatRelative(iso) {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return '—'
  const s = Math.floor((Date.now() - t) / 1000)
  if (s < 45) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
  if (s < 604800) return `${Math.floor(s / 86400)} days ago`
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * @param {{ reportView?: 'faculty' | 'task' }} opts
 * @returns {{ totalSends: number, last7Sends: number, totalStructuredItems: number, topIssues: { id: string, label: string, count: number }[], recent: { id: string, when: string, sub: string, summary: string }[] }}
 */
export function getActivitySummary(opts = {}) {
  const reportView = opts.reportView === 'task' ? 'task' : 'faculty'
  const events = readList()
  const now = Date.now()
  const sevenAgo = now - 7 * 864e5
  let last7Sends = 0
  let totalStructuredItems = 0
  const issueTotals = {}

  for (const e of events) {
    const ts = Date.parse(e.sentAt)
    if (Number.isFinite(ts) && ts >= sevenAgo) last7Sends += 1
    const n = e.commentCount ?? 0
    totalStructuredItems += n
    const ic = e.issueCounts || {}
    for (const [k, v] of Object.entries(ic)) {
      const bucket = reportView === 'faculty' ? coreCodeForIssue(k) : k
      issueTotals[bucket] = (issueTotals[bucket] || 0) + v
    }
  }

  const topIssues = Object.entries(issueTotals)
    .map(([id, count]) => ({
      id,
      label: reportView === 'faculty' ? coreIssueLabel(id) : issueLabel(id),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const recent = events.slice(-5).reverse().map((e) => {
    const ic = e.issueCounts || {}
    const topKeys = Object.entries(ic)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => (reportView === 'faculty' ? coreIssueLabel(id) : issueLabel(id)))
    const sub = topKeys.length ? topKeys.join(' · ') : '—'
    const n = e.commentCount ?? 0
    return {
      id: e.id,
      sentAt: e.sentAt,
      when: formatRelative(e.sentAt),
      sub,
      summary: `${n} structured item${n === 1 ? '' : 's'}`,
    }
  })

  return {
    totalSends: events.length,
    last7Sends,
    totalStructuredItems,
    topIssues,
    recent,
  }
}

/** Same-tab and cross-tab updates. */
export function subscribeActivity(fn) {
  const run = () => {
    try {
      fn()
    } catch {
      /* no-op */
    }
  }
  const onChange = (ev) => {
    if (ev.type === 'storage' && ev.key && ev.key !== STORAGE_KEY) return
    run()
  }
  window.addEventListener(CHANGED, run)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGED, run)
    window.removeEventListener('storage', onChange)
  }
}
