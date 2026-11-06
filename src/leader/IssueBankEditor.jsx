import { useEffect, useState } from 'react'
import {
  getIssueBank,
  makeUniqueIssueId,
  normalizeIssueTier,
  resetIssueBankToDefault,
  setIssueBank,
} from '../lib/issueBankStore.js'
import { useIssueBank } from '../lib/useIssueBank.js'
import './issue-bank-editor.css'

const PRIORITIES = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const TIERS = [
  { value: 'core', label: 'Core (faculty reporting)' },
  { value: 'task', label: 'Task-specific (maps to a core code)' },
]

const DEFAULT_NEW = (id) => ({
  id,
  tier: 'task',
  coreCode: '',
  defaultPriority: 'medium',
  title: 'New issue',
  oneLiner: 'Short hint shown under the title when teachers pick from the list.',
  whyItMatters: 'Explain why this matters for the student’s learning (plain language).',
  nextStep: 'One concrete thing the student can do in their next draft.',
})

export default function IssueBankEditor() {
  const { bank, version } = useIssueBank()
  const sanitize = (rows) =>
    rows.map((i) => {
      const tier = normalizeIssueTier(i.tier)
      return {
        ...i,
        tier,
        coreCode: tier === 'core' ? i.id : i.coreCode || '',
      }
    })
  const [local, setLocal] = useState(() => sanitize(bank))
  const [message, setMessage] = useState(null)

  useEffect(() => {
    setLocal(sanitize(bank))
  }, [bank, version])

  const commit = (next) => {
    setIssueBank(next)
    setMessage('Saved. Teachers will see these issues in the Teacher tab.')
    window.setTimeout(() => setMessage(null), 3200)
  }

  const onSave = () => {
    const seen = new Set()
    const coreIds = new Set(
      local
        .filter((i) => normalizeIssueTier(i.tier) === 'core')
        .map((i) => String(i.id || '').trim())
        .filter(Boolean),
    )
    for (const i of local) {
      if (
        !i.id?.trim() ||
        !i.title?.trim() ||
        !i.oneLiner?.trim() ||
        !i.whyItMatters?.trim() ||
        !i.nextStep?.trim()
      ) {
        setMessage('Each issue needs a code, title, short line, “Why it matters”, and “Next step” filled in.')
        window.setTimeout(() => setMessage(null), 4500)
        return
      }
      const k = i.id.trim()
      if (seen.has(k)) {
        setMessage('Each issue code must be unique.')
        window.setTimeout(() => setMessage(null), 4500)
        return
      }
      const tier = normalizeIssueTier(i.tier)
      if (tier === 'task') {
        const mapped = String(i.coreCode || '').trim()
        if (!mapped) {
          setMessage('Task-specific issues must map to a core code.')
          window.setTimeout(() => setMessage(null), 4500)
          return
        }
        if (!coreIds.has(mapped)) {
          setMessage('Each task-specific issue must map to an existing core code.')
          window.setTimeout(() => setMessage(null), 4500)
          return
        }
      }
      seen.add(k)
    }
    commit(local)
  }

  const onDiscard = () => {
    setLocal(sanitize(getIssueBank()))
    setMessage('Restored the last saved bank.')
    window.setTimeout(() => setMessage(null), 2400)
  }

  const onReset = () => {
    if (!window.confirm('Restore the built-in default issue list? Your custom issues will be removed from this browser.'))
      return
    resetIssueBankToDefault()
    setLocal(sanitize(getIssueBank()))
  }

  const move = (index, dir) => {
    const j = index + dir
    if (j < 0 || j >= local.length) return
    const next = local.slice()
    const t = next[index]
    next[index] = next[j]
    next[j] = t
    setLocal(next)
  }

  const onDelete = (index) => {
    if (local.length <= 1) {
      setMessage('Keep at least one issue in the bank.')
      window.setTimeout(() => setMessage(null), 2400)
      return
    }
    if (!window.confirm('Remove this issue from the bank? Existing comments that use it are unchanged, but the issue will no longer appear in the list.')) return
    setLocal((prev) => prev.filter((_, i) => i !== index))
  }

  const onDuplicate = (index) => {
    const s = local[index]
    if (!s) return
    const existingIds = local.map((i) => i.id)
    const newId = makeUniqueIssueId(`${s.title}-copy`, existingIds)
    const copy = {
      ...s,
      id: newId,
      title: `${s.title} (copy)`,
      tier: 'task',
    }
    if (!copy.coreCode) copy.coreCode = s.tier === 'core' ? s.id : s.coreCode
    setLocal((prev) => {
      const next = prev.slice()
      next.splice(index + 1, 0, copy)
      return next
    })
  }

  const onAdd = () => {
    const existingIds = local.map((i) => i.id)
    const id = makeUniqueIssueId('new-issue', existingIds)
    const firstCore = local.find((i) => normalizeIssueTier(i.tier) === 'core')?.id ?? ''
    setLocal((prev) => [...prev, { ...DEFAULT_NEW(id), coreCode: firstCore }])
  }

  const update = (index, key, value) => {
    setLocal((prev) => {
      const next = prev.slice()
      const row = { ...next[index], [key]: value }
      if (key === 'id') {
        const slug = String(value)
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        row.id = slug
      }
      if (key === 'tier') {
        row.tier = normalizeIssueTier(value)
        if (row.tier === 'core') row.coreCode = row.id
      }
      if (key === 'coreCode') {
        row.coreCode = String(value || '').trim()
      }
      if (row.tier === 'core') row.coreCode = row.id
      next[index] = row
      return next
    })
  }

  return (
    <div className="ibe">
      <div className="ibe__toolbar maxw">
        <p className="ibe__lede">
          Edit or reorder issues below. Click <strong>Save changes</strong> when you’re finished — your browser keeps a
          copy here until a server sync exists.
        </p>
        <div className="ibe__actions">
          {message ? <span className="ibe__msg" role="status">{message}</span> : null}
          <button type="button" className="ibe-btn" onClick={onDiscard}>
            Undo unsaved
          </button>
          <button type="button" className="ibe-btn ibe-btn--danger" onClick={onReset}>
            Reset to defaults
          </button>
          <button type="button" className="ibe-btn ibe-btn--primary" onClick={onSave}>
            Save changes
          </button>
        </div>
      </div>

      <div className="ibe__list maxw">
        {local.map((issue, index) => (
          <article key={`${issue.id}-${index}`} className="ibe-card">
            <div className="ibe-card__top">
              <h3 className="ibe-card__h">Issue {index + 1}</h3>
              <div className="ibe-card__controls">
                <span className="ibe-card__order" aria-label="Order">
                  {index + 1} of {local.length}
                </span>
                <button
                  type="button"
                  className="ibe-icon-btn"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ibe-icon-btn"
                  disabled={index === local.length - 1}
                  onClick={() => move(index, 1)}
                  title="Move down"
                >
                  ↓
                </button>
                <button type="button" className="ibe-tiny" onClick={() => onDuplicate(index)}>
                  Duplicate
                </button>
                <button type="button" className="ibe-tiny ibe-tiny--danger" onClick={() => onDelete(index)}>
                  Remove
                </button>
              </div>
            </div>

            <div className="ibe-grid">
              <div className="ibe-field">
                <label className="ibe-label" htmlFor={`ibe-id-${index}`}>
                  Issue code
                </label>
                <input
                  id={`ibe-id-${index}`}
                  className="ibe-input"
                  value={issue.id}
                  onChange={(e) => update(index, 'id', e.target.value)}
                  autoComplete="off"
                  spellCheck="false"
                disabled={normalizeIssueTier(issue.tier) === 'core'}
                />
              <span className="ibe-hint">
                {normalizeIssueTier(issue.tier) === 'core'
                  ? 'Core codes are locked so faculty reporting stays stable.'
                  : 'Letters, numbers, hyphens only. Keep it unique.'}
              </span>
            </div>
            <div className="ibe-field">
              <label className="ibe-label" htmlFor={`ibe-tier-${index}`}>
                Issue type
              </label>
              <select
                id={`ibe-tier-${index}`}
                className="ibe-select"
                value={normalizeIssueTier(issue.tier)}
                onChange={(e) => update(index, 'tier', e.target.value)}
              >
                {TIERS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              </div>
              <div className="ibe-field">
                <label className="ibe-label" htmlFor={`ibe-pri-${index}`}>
                  Default priority
                </label>
                <select
                  id={`ibe-pri-${index}`}
                  className="ibe-select"
                  value={issue.defaultPriority}
                  onChange={(e) => update(index, 'defaultPriority', e.target.value)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {normalizeIssueTier(issue.tier) === 'task' ? (
              <div className="ibe-field">
                <label className="ibe-label" htmlFor={`ibe-core-${index}`}>
                  Maps to core code
                </label>
                <select
                  id={`ibe-core-${index}`}
                  className="ibe-select"
                  value={issue.coreCode || ''}
                  onChange={(e) => update(index, 'coreCode', e.target.value)}
                >
                  <option value="">Select core code…</option>
                  {local
                    .filter((row) => normalizeIssueTier(row.tier) === 'core')
                    .map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.id} — {row.title}
                      </option>
                    ))}
                </select>
              </div>
            ) : null}

            <div className="ibe-field">
              <label className="ibe-label" htmlFor={`ibe-title-${index}`}>
                Title (what teachers see first)
              </label>
              <input
                id={`ibe-title-${index}`}
                className="ibe-input"
                value={issue.title}
                onChange={(e) => update(index, 'title', e.target.value)}
              />
            </div>

            <div className="ibe-field">
              <label className="ibe-label" htmlFor={`ibe-liner-${index}`}>
                Short line under the title
              </label>
              <input
                id={`ibe-liner-${index}`}
                className="ibe-input"
                value={issue.oneLiner ?? ''}
                onChange={(e) => update(index, 'oneLiner', e.target.value)}
                placeholder="One line — what this issue is about"
              />
            </div>

            <div className="ibe-field">
              <label className="ibe-label" htmlFor={`ibe-why-${index}`}>
                Why it matters (for the student)
              </label>
              <textarea
                id={`ibe-why-${index}`}
                className="ibe-text"
                rows={3}
                value={issue.whyItMatters}
                onChange={(e) => update(index, 'whyItMatters', e.target.value)}
              />
            </div>

            <div className="ibe-field">
              <label className="ibe-label" htmlFor={`ibe-next-${index}`}>
                Next step (what to do next)
              </label>
              <textarea
                id={`ibe-next-${index}`}
                className="ibe-text"
                rows={3}
                value={issue.nextStep}
                onChange={(e) => update(index, 'nextStep', e.target.value)}
              />
            </div>
          </article>
        ))}

        <div className="ibe-footer-actions">
          <button type="button" className="ibe-btn ibe-btn--primary" onClick={onAdd}>
            + Add issue
          </button>
        </div>
      </div>
    </div>
  )
}
