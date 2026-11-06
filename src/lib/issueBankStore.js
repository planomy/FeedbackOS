/**
 * Issue bank — leaders edit; teachers consume. Persisted in localStorage (API later).
 */
import { DEFAULT_ISSUE_BANK } from '../teacher/issueBankData.js'

const STORAGE_KEY = 'feedback-os.issue-bank.v1'
const CHANGED = 'feedback-os-issue-bank-changed'

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_ISSUE_BANK))
}

export function normalizeIssueTier(tier) {
  return tier === 'task' ? 'task' : 'core'
}

function isValidItem(i) {
  if (!i || typeof i !== 'object') return false
  if (typeof i.id !== 'string' || !i.id.trim()) return false
  if (!['high', 'medium', 'low'].includes(i.defaultPriority)) return false
  if (!['core', 'task'].includes(i.tier)) return false
  if (typeof i.coreCode !== 'string' || !i.coreCode.trim()) return false
  if (i.tier === 'task' && i.coreCode === i.id) return false
  if (typeof i.title !== 'string' || !i.title.trim()) return false
  if (typeof i.whyItMatters !== 'string' || !i.whyItMatters.trim()) return false
  if (typeof i.nextStep !== 'string' || !i.nextStep.trim()) return false
  return true
}

function normalizeItem(i) {
  const p = ['high', 'medium', 'low'].includes(i.defaultPriority) ? i.defaultPriority : 'medium'
  const id = String(i.id || '').trim()
  const tier = normalizeIssueTier(i.tier)
  const rawCore = typeof i.coreCode === 'string' ? i.coreCode.trim() : ''
  const coreCode = tier === 'core' ? id : rawCore || id
  return {
    id,
    defaultPriority: p,
    tier,
    coreCode,
    title: typeof i.title === 'string' ? i.title : '',
    oneLiner: typeof i.oneLiner === 'string' ? i.oneLiner : '',
    whyItMatters: typeof i.whyItMatters === 'string' ? i.whyItMatters : '',
    nextStep: typeof i.nextStep === 'string' ? i.nextStep : '',
  }
}

export function getIssueBank() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneDefault()
    const p = JSON.parse(raw)
    if (!Array.isArray(p) || p.length === 0) return cloneDefault()
    const cleaned = p.map(normalizeItem).filter((x) => x.id)
    if (cleaned.length === 0) return cloneDefault()
    return cleaned
  } catch {
    return cloneDefault()
  }
}

export function setIssueBank(bank) {
  if (!Array.isArray(bank) || !bank.length) {
    console.warn('Issue bank: empty list not allowed, keeping previous')
    return
  }
  const next = bank.map(normalizeItem)
  const byId = new Set(next.map((i) => i.id))
  const allCoreCodesExist = next.every((i) => i.tier === 'core' || byId.has(i.coreCode))
  if (!allCoreCodesExist) {
    console.warn('Issue bank: task issue has missing core mapping, keeping previous')
    return
  }
  const valid = next.filter((i) => isValidItem(i))
  const idsUnique = valid.length === next.length && new Set(next.map((i) => i.id)).size === next.length
  if (!idsUnique) {
    console.warn('Issue bank: duplicate or invalid ids, keeping previous')
    return
  }
  if (valid.length === 0) {
    console.warn('Issue bank: no valid items, keeping previous')
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid))
  } catch (e) {
    console.warn('Issue bank: could not save', e)
  }
  window.dispatchEvent(new CustomEvent(CHANGED))
}

export function resetIssueBankToDefault() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* */
  }
  window.dispatchEvent(new CustomEvent(CHANGED))
}

export function issueTemplate(issueId) {
  if (!issueId) return undefined
  return getIssueBank().find((i) => i.id === issueId)
}

export function getIssueById(issueId) {
  if (!issueId) return undefined
  return getIssueBank().find((i) => i.id === issueId)
}

export function coreCodeForIssue(issueId) {
  const row = getIssueById(issueId)
  if (!row) return issueId ? String(issueId) : undefined
  return row.tier === 'task' ? row.coreCode || row.id : row.id
}

export function subscribeIssueBank(fn) {
  const w = () => {
    try {
      fn()
    } catch {
      /* */
    }
  }
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) w()
  }
  window.addEventListener(CHANGED, w)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGED, w)
    window.removeEventListener('storage', onStorage)
  }
}

export function makeUniqueIssueId(title, existingIds) {
  const set = new Set(existingIds)
  const base = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  let id = base || `issue-${Date.now()}`
  if (!set.has(id)) return id
  let n = 2
  while (set.has(`${id}-${n}`)) n += 1
  return `${id}-${n}`
}
