import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { isAnnotationComplete, priorityLabel, priorityUpperLabel } from './feedbackQuality'

const SECTIONS = [
  { key: 'whyItMatters', label: 'Why it matters' },
  { key: 'nextStep', label: 'Next step' },
]

function toTrimmed(s) {
  if (s == null) return ''
  return String(s).replace(/\r\n/g, '\n').trim()
}

function sizeStructuredTextareas(root) {
  if (!root) return
  root.querySelectorAll('textarea.structured-comment__field').forEach((ta) => {
    ta.style.height = '0'
    ta.style.height = `${ta.scrollHeight}px`
  })
}

/**
 * Renders a structured (issue-based) comment card: issue title in the header; why/next in collapsible details.
 */
export function StructuredCommentCard({
  comment,
  isActive = false,
  onActivate,
  onUpdateComment,
  onCycleCommentPriority,
  onDeleteComment,
  showPriorityCapWarning = false,
  setCardRef,
}) {
  const [draft, setDraft] = useState(() => ({ whyItMatters: toTrimmed(comment.whyItMatters), nextStep: toTrimmed(comment.nextStep) }))

  const bodyRef = useRef(null)
  const sizeBodyTextareas = useCallback(() => {
    sizeStructuredTextareas(bodyRef.current)
  }, [])

  useEffect(() => {
    setDraft({
      whyItMatters: toTrimmed(comment.whyItMatters),
      nextStep: toTrimmed(comment.nextStep),
    })
  }, [comment.id, comment.issueId])

  useLayoutEffect(() => {
    sizeBodyTextareas()
  }, [draft.whyItMatters, draft.nextStep, sizeBodyTextareas])

  const priority = comment.priority
  const priorityKey = ['high', 'medium', 'low'].includes(priority) ? priority : 'unset'

  const complete = isAnnotationComplete(comment)
  const headerTitle =
    toTrimmed(comment.issueTitle) ||
    toTrimmed(comment.label) ||
    (comment.id != null && comment.id !== '' ? `Annotation ${String(comment.id)}` : 'Comment')

  return (
    <article
      ref={setCardRef}
      className={[
        'structured-comment',
        isActive && 'is-active',
        !complete && 'structured-comment--incomplete',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="structured-comment__header">
        <button
          type="button"
          className="structured-comment__title-btn"
          title={headerTitle}
          onClick={() => onActivate?.(comment.id)}
        >
          <span className="structured-comment__meta-title-text">{headerTitle}</span>
        </button>
        <div className="structured-comment__header-right" role="group" aria-label="Priority and status">
          <button
            type="button"
            className="priority-dot-group"
            title={`${priorityLabel(priority || 'unassigned')}. Click to change priority.`}
            aria-label={priorityLabel(priority || 'unassigned')}
            onClick={() => onCycleCommentPriority?.(comment.id, priority)}
          >
            <span className="priority-dot-group__label" aria-hidden="true">
              {priorityUpperLabel(priority)}
            </span>
            <span
              className={`priority-dot priority-dot--${priorityKey}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {!complete ? (
        <span className="structured-comment__incomplete-badge" id={`incomplete-hint-${comment.id}`}>
          Complete all fields to send
        </span>
      ) : null}

      {showPriorityCapWarning && (
        <p className="priority-cap-warning" role="status">
          Only 3 high-priority items per submission. This card stayed at medium; remove or lower another high
          to raise this one.
        </p>
      )}

      {comment.anchorKind === 'paragraph' ? (
        <p className="structured-comment__paragraph-scope">
          Scoped to the <strong>whole paragraph</strong> — not one sentence or highlighted phrase.
        </p>
      ) : null}

      <div className="structured-comment__body" ref={bodyRef}>
        {SECTIONS.map(({ key, label }) => {
          const describedBy = !complete ? `incomplete-hint-${comment.id}` : undefined

          return (
          <div key={key} className="structured-comment__section">
            <details
              className="structured-comment__details"
              onToggle={(e) => {
                if (e.currentTarget.open) {
                  requestAnimationFrame(() => sizeBodyTextareas())
                }
              }}
            >
              <summary className="structured-comment__summary">
                {label}
              </summary>
              <div className="structured-comment__details-body">
                <textarea
                  className={`structured-comment__field${key === 'nextStep' ? ' structured-comment__field--next' : ' structured-comment__field--why'}`}
                  rows={1}
                  value={draft[key]}
                  onChange={(e) => {
                    const raw = e.target.value
                    setDraft((d) => ({ ...d, [key]: raw }))
                    onUpdateComment(comment.id, { [key]: toTrimmed(raw) })
                  }}
                  onContextMenuCapture={(e) => e.stopPropagation()}
                  aria-label={key === 'whyItMatters' ? 'Why it matters' : 'Next step for the student'}
                  placeholder={
                    key === 'whyItMatters'
                      ? 'E.g. readers need a clear through-line; otherwise they lose the argument.'
                      : 'E.g. add a topic sentence, then a sentence of evidence, then a linking sentence to the main claim.'
                  }
                  id={key === 'whyItMatters' ? `annotation-whyItMatters-${comment.id}` : `annotation-nextStep-${comment.id}`}
                  name={key === 'whyItMatters' ? 'annotation-whyItMatters' : 'annotation-nextStep'}
                  data-markup-allow
                  data-markup-allow-structural
                  data-markup-control="structural-annotation"
                  data-markup-field={key}
                  data-markup-comment={String(comment.id)}
                  aria-describedby={describedBy}
                />
              </div>
            </details>
          </div>
        );
        })}

        {onDeleteComment ? (
          <p className="structured-comment__footer">
            <button
              type="button"
              className="structured-comment__remove"
              onClick={() => onDeleteComment(comment.id)}
            >
              Remove comment
            </button>
          </p>
        ) : null}
      </div>
    </article>
  )
}

export default StructuredCommentCard
