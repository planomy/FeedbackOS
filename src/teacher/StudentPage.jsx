import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { setAnnotationRef } from './annotationRefs.js'
import { priorityUpperLabel } from './feedbackQuality.js'
import {
  groupImprovementCommentsForStudentReport,
  normalizeAnnotationType,
} from './feedbackTargeting.js'
import './student-page.css'

function scrollToAnnotationRef(annotationTargetRefs, annotationId) {
  const el = annotationTargetRefs.current[annotationId]
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function FeedbackItemCard({ item, onGoToWork }) {
  const pKey = ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'unset'
  return (
    <article className="student-summary-card">
      <div className="student-summary-card__head">
        <span className={`student-summary-card__priority-badge student-summary-card__priority-badge--${pKey}`}>
          {priorityUpperLabel(item.priority)}
        </span>
        <h3 className="student-summary-card__issue-title">{item.issueTitle}</h3>
      </div>
      <div className="student-summary-card__block">
        <span className="student-summary-card__label">Why this matters</span>
        {item.whyItMatters}
      </div>
      <div className="student-summary-card__block">
        <span className="student-summary-card__label">What to do next</span>
        {item.nextStep}
      </div>
      {item.anchorKind === 'essay' ? (
        <blockquote className="student-summary-card__quote student-summary-card__quote--essay">
          Applies to your <strong>whole response</strong> — not one paragraph only.
        </blockquote>
      ) : item.anchorKind === 'paragraph' ? (
        <blockquote className="student-summary-card__quote student-summary-card__quote--paragraph">
          Applies to a <strong>whole paragraph</strong> in your work — your teacher did not flag one sentence
          only.
        </blockquote>
      ) : item.quote ? (
        <blockquote className="student-summary-card__quote">From your writing: “{item.quote}”</blockquote>
      ) : null}
      <button type="button" className="student-summary-card__link" onClick={() => onGoToWork(item)}>
        {item.anchorKind === 'essay' ? 'Jump to your draft' : 'Show in my work'}
      </button>
    </article>
  )
}

export default function StudentPage({
  pageTitle = 'Your feedback',
  submission,
  comments,
  noteToStudent = '',
}) {
  const hasSentFeedback = submission != null && comments != null

  const hasTeacherNote = typeof noteToStudent === 'string' && noteToStudent.trim().length > 0

  const commentsList = useMemo(
    () => (Array.isArray(comments) ? comments : []),
    [comments],
  )

  useEffect(() => {
    if (!import.meta.env.DEV || !hasSentFeedback) return
    console.log('Student comments:', commentsList)
  }, [hasSentFeedback, commentsList])

  const { paragraphItems, essayItems } = useMemo(
    () => groupImprovementCommentsForStudentReport(commentsList, submission),
    [commentsList, submission],
  )

  const paragraphCount = submission?.paragraphs?.length ?? 0

  const annotationTargetRefs = useRef({})
  const draftSectionRef = useRef(null)
  const [focusedAnnotationId, setFocusedAnnotationId] = useState(null)

  const goToAnnotation = useCallback((annotationId) => {
    setFocusedAnnotationId(annotationId)
    requestAnimationFrame(() => {
      scrollToAnnotationRef(annotationTargetRefs, annotationId)
    })
  }, [])

  const handleCardGoToWork = useCallback(
    (item) => {
      if (item.anchorKind === 'essay') {
        draftSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      goToAnnotation(item.id)
    },
    [goToAnnotation],
  )

  return (
    <div className="student-page">
      <header className="student-page__bar">
        <h1 className="student-page__title">{pageTitle}</h1>
      </header>

      <div className="student-page__body">
        {!hasSentFeedback ? (
          <p className="student-summary-placeholder">No feedback sent yet</p>
        ) : (
          <>
            <section className="student-page__section student-page__section--report-intro" aria-labelledby="report-intro-heading">
              <h2 id="report-intro-heading" className="student-page__report-heading">
                Your feedback by paragraph
              </h2>
              <p className="student-page__lede student-page__lede--report">
                Read in order from top to bottom — each section matches a paragraph in your draft. Within each
                section, <strong>high priority</strong> items are listed first. Use this together with your full
                draft at the bottom.
              </p>
            </section>

            {Array.from({ length: paragraphCount }, (_, i) => {
              const items = paragraphItems.get(i) ?? []
              return (
                <section
                  key={`para-${i}`}
                  className="student-page__section student-page__section--paragraph-report"
                  aria-labelledby={`para-report-${i}`}
                >
                  <h2 id={`para-report-${i}`} className="student-page__paragraph-report-title">
                    Paragraph {i + 1}
                  </h2>
                  {items.length === 0 ? (
                    <p className="student-page__paragraph-empty">No targeted feedback for this paragraph.</p>
                  ) : (
                    items.map((item) => (
                      <FeedbackItemCard key={item.id} item={item} onGoToWork={handleCardGoToWork} />
                    ))
                  )}
                </section>
              )
            })}

            {essayItems.length > 0 ? (
              <section className="student-page__section" aria-labelledby="whole-essay-heading">
                <h2 id="whole-essay-heading" className="student-page__report-heading">
                  Whole response
                </h2>
                <p className="student-page__lede student-page__lede--muted">
                  These notes apply across your work — not to a single paragraph.
                </p>
                {essayItems.map((item) => (
                  <FeedbackItemCard key={item.id} item={item} onGoToWork={handleCardGoToWork} />
                ))}
              </section>
            ) : null}

            {hasTeacherNote ? (
              <section className="student-page__section" aria-labelledby="teacher-note-heading">
                <h2 id="teacher-note-heading">Note from your teacher</h2>
                <p className="student-teacher-note">{noteToStudent.trim()}</p>
              </section>
            ) : null}

            <section
              className="student-page__section"
              aria-labelledby="student-work-heading"
              ref={draftSectionRef}
            >
              <h2 id="student-work-heading">Your work</h2>
              <div className="student-work">
                <div className="student-work__head">Submitted response</div>
                <div className="student-work__scroll">
                  {submission.paragraphs.map((p, i) => {
                    const paraIssues = commentsList.filter(
                      (c) =>
                        normalizeAnnotationType(c) === 'improvement' &&
                        c.anchorKind === 'paragraph' &&
                        c.paragraphIndex === i,
                    )
                    return (
                      <div key={p.key ?? i} className="student-work__paragraph-block">
                        <p className="student-work__p">
                          {p.text.map((chunk, j) =>
                            typeof chunk === 'string' ? (
                              <Fragment key={`${i}-${j}`}>{chunk}</Fragment>
                            ) : (
                              <span
                                key={chunk.id}
                                role="button"
                                tabIndex={0}
                                ref={(el) => setAnnotationRef(annotationTargetRefs, chunk.id, el)}
                                className={`student-work__highlight${focusedAnnotationId === chunk.id ? ' is-focused' : ''}`}
                                data-annotation-id={chunk.id}
                                title="Show this spot in your work"
                                onClick={() => goToAnnotation(chunk.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    goToAnnotation(chunk.id)
                                  }
                                }}
                              >
                                {chunk.text}
                              </span>
                            ),
                          )}
                        </p>
                        {paraIssues.length > 0 ? (
                          <div className="student-work__para-issues" role="list">
                            {paraIssues.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                role="listitem"
                                ref={(el) => setAnnotationRef(annotationTargetRefs, c.id, el)}
                                className={`student-work__para-issue${focusedAnnotationId === c.id ? ' is-focused' : ''}`}
                                title={c.issueTitle}
                                onClick={() => goToAnnotation(c.id)}
                              >
                                <span className="student-work__para-issue-scope">Paragraph</span>
                                <span className="student-work__para-issue-title">{c.issueTitle}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
