import { useEffect, useMemo, useRef } from 'react'
import StructuredCommentCard from './StructuredCommentCard.jsx'
import { areAllAnnotationsComplete, feedbackQualityStatus } from './feedbackQuality.js'
import './teacher-layout.css'

export default function CommentsColumn({
  commentsScrollRef,
  activeAnnotationId,
  onCommentClick,
  onUpdateComment,
  onCycleCommentPriority,
  onDeleteComment,
  onSendFeedback,
  priorityCapWarningId,
  commentItemRefs,
  title = 'Comments',
  showHeader = true,
  showQualityToolbar = true,
  comments = [],
  noteToStudent = '',
  onNoteToStudentChange,
}) {
  const internalScrollRef = useRef(null)
  const scrollRef = commentsScrollRef ?? internalScrollRef

  const allComplete = useMemo(() => areAllAnnotationsComplete(comments), [comments])
  const quality = useMemo(() => feedbackQualityStatus(comments), [comments])

  useEffect(() => {
    if (!activeAnnotationId || !commentItemRefs?.current) return
    const el = commentItemRefs.current[activeAnnotationId]
    const container = scrollRef.current
    if (!el || !container) return
    const c = container.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const elTop = container.scrollTop + (r.top - c.top)
    const offset = container.clientHeight * 0.35
    const top = Math.max(0, elTop - offset)
    container.scrollTo({ top, behavior: 'smooth' })
  }, [activeAnnotationId, commentItemRefs, scrollRef])

  const sendTitle = allComplete
    ? 'Send feedback to student'
    : 'Complete all feedback items before sending'

  return (
    <section className="teacher-col teacher-col--comments teacher-col--comments-bfill" aria-label={title}>
      {showHeader ? <header className="teacher-col__head">{title}</header> : null}
      {showQualityToolbar ? (
        <div className="comments-quality-bar">
          <span
            className={`comments-quality-badge comments-quality-badge--${quality === 'PASS' ? 'pass' : 'fail'}`}
          >
            Feedback Quality: <strong>{quality}</strong>
          </span>
          <button
            type="button"
            className="comments-send-btn"
            disabled={!allComplete}
            title={sendTitle}
            aria-disabled={!allComplete}
            onClick={() => onSendFeedback?.()}
          >
            Send
          </button>
        </div>
      ) : null}
      {!allComplete ? (
        <div className="comments-send-hint" role="status">
          Complete all feedback items before sending.
        </div>
      ) : null}
      <div className="teacher-col__scroll" ref={scrollRef}>
        <div className="teacher-col__inner teacher-col__inner--structured">
          {comments.map((c) => (
            <StructuredCommentCard
              key={c.id}
              comment={c}
              isActive={activeAnnotationId === c.id}
              onActivate={onCommentClick}
              onUpdateComment={onUpdateComment}
              onCycleCommentPriority={onCycleCommentPriority}
              onDeleteComment={onDeleteComment}
              showPriorityCapWarning={priorityCapWarningId === c.id}
              setCardRef={(el) => {
                if (!commentItemRefs?.current) return
                if (el) commentItemRefs.current[c.id] = el
                else delete commentItemRefs.current[c.id]
              }}
            />
          ))}
          <div className="comments-note-to-student">
            <label className="comments-note-to-student__label" htmlFor="note-to-student">
              Add note to student
            </label>
            <textarea
              id="note-to-student"
              className="comments-note-to-student__field"
              rows={3}
              placeholder="Optional—overall encouragement, hand-in reminder, or context that doesn’t sit in a single issue."
              value={noteToStudent}
              onChange={(e) => onNoteToStudentChange?.(e.target.value)}
              aria-label="Add note to student"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
