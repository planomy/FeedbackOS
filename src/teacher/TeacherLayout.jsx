import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SubmissionColumn from './SubmissionColumn.jsx'
import CommentsColumn from './CommentsColumn.jsx'
import IssueBankColumn from './IssueBankColumn.jsx'
import AnnotationChip from './AnnotationChip.jsx'
import { setAnnotationRef } from './annotationRefs.js'
import {
  getTextOffsetsInParagraph,
  nextAnnotationId,
  removeAnnotationFromChunks,
  selectionIntersectsAnnotationChip,
  tryAddAnnotationFromRange,
} from './submissionAnnotationSplit.js'
import { useIssueBank } from '../lib/useIssueBank.js'
import { areAllAnnotationsComplete, feedbackQualityStatus } from './feedbackQuality.js'
import {
  buildStudentSummary,
  canSetHighPriority,
  getNextCycledPriority,
} from './feedbackTargeting.js'
import './teacher-layout.css'
import { DEFAULT_COMMENTS, DEFAULT_SUBMISSION, issueTemplate } from './markingDemoData.js'

/** Faculty-sheet category segment from issue id (`m7-app-*` → `app`). */
function issueCategorySegment(issueId) {
  const seg = String(issueId).split('-')[1]
  return ['app', 'org', 'text'].includes(seg) ? seg : 'other'
}

/** Alternate stripe by faculty-sheet category (Application / Organisation / Textual). */
function issueBankStripeClass(issueId) {
  const cat = issueCategorySegment(issueId)
  const order = ['app', 'org', 'text']
  const idx = order.indexOf(cat)
  const bucket = idx >= 0 ? idx : 0
  return bucket % 2 === 0 ? 'issue-bank-item--cat-a' : 'issue-bank-item--cat-b'
}

export default function TeacherLayout({
  submissionTitle,
  commentsTitle,
  issueBankTitle,
  submission,
  setSubmission,
  comments,
  setComments,
  issueBankContent,
  onSendFeedback,
}) {
  const submissionScrollRef = useRef(null)
  const annotationTargetRefs = useRef({})
  const commentItemRefs = useRef({})
  const pendingSelRef = useRef(null)
  const submissionRef = useRef(null)
  const commentsRef = useRef(null)
  const priorityCapTimerRef = useRef(null)
  const activeAnnotationIdRef = useRef(null)

  const [activeAnnotationId, setActiveAnnotationId] = useState(null)
  const [selectedIssueId, setSelectedIssueId] = useState(null)
  const [hasPendingSelection, setHasPendingSelection] = useState(false)
  /** Mirrors pending selection: paragraph-level ("Tag end") vs quoted text range. */
  const [pendingSelectionScope, setPendingSelectionScope] = useState(null)
  const [issueBankNotice, setIssueBankNotice] = useState(null)
  const [priorityCapWarningId, setPriorityCapWarningId] = useState(null)
  const [noteToStudent, setNoteToStudent] = useState('')
  const { bank: issueBank } = useIssueBank()

  const submissionModel = submission ?? DEFAULT_SUBMISSION
  const commentsList = Array.isArray(comments) ? comments : DEFAULT_COMMENTS

  submissionRef.current = submissionModel
  commentsRef.current = commentsList
  activeAnnotationIdRef.current = activeAnnotationId

  const commentById = useMemo(() => {
    const m = {}
    for (const c of commentsList) m[c.id] = c
    return m
  }, [commentsList])

  const allCommentsComplete = useMemo(() => areAllAnnotationsComplete(commentsList), [commentsList])
  const feedbackQuality = useMemo(() => feedbackQualityStatus(commentsList), [commentsList])

  const focusAnnotation = useCallback((annotationId) => {
    const target = annotationTargetRefs.current[annotationId]
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const clearPendingSelection = useCallback(() => {
    pendingSelRef.current = null
    setHasPendingSelection(false)
    setPendingSelectionScope(null)
  }, [])

  const handleCommentClick = useCallback(
    (annotationId) => {
      clearPendingSelection()
      setActiveAnnotationId(annotationId)
      const comm = commentsRef.current.find((c) => c.id === annotationId)
      setSelectedIssueId(comm?.issueId ?? null)
      requestAnimationFrame(() => focusAnnotation(annotationId))
    },
    [clearPendingSelection, focusAnnotation],
  )

  const handleAnnotationChipClick = useCallback(
    (annotationId) => {
      clearPendingSelection()
      setActiveAnnotationId(annotationId)
      const comm = commentsRef.current.find((c) => c.id === annotationId)
      setSelectedIssueId(comm?.issueId ?? null)
    },
    [clearPendingSelection],
  )

  const applyIssueTemplateToComment = useCallback(
    (commentId, issueId) => {
      if (!commentId || !issueId) return
      const comm = commentsRef.current.find((c) => c.id === commentId)
      if (!comm || comm.issueId === issueId) return
      const issue = issueTemplate(issueId)
      if (!issue) return

      let priority = issue.defaultPriority ?? 'medium'
      if (priority === 'high' && !canSetHighPriority(commentsRef.current, commentId)) {
        priority = 'medium'
      }

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                issueId: issue.id,
                issueTitle: issue.title,
                whyItMatters: issue.whyItMatters,
                nextStep: issue.nextStep,
                priority,
              }
            : c,
        ),
      )
      if (priority !== 'high') {
        setPriorityCapWarningId((w) => (w === commentId ? null : w))
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => focusAnnotation(commentId))
      })
    },
    [focusAnnotation, setComments],
  )

  const createAnnotationFromPending = useCallback(
    (issue) => {
      const pending = pendingSelRef.current
      if (!pending || !issue) return
      pendingSelRef.current = null
      setHasPendingSelection(false)
      setPendingSelectionScope(null)
      window.getSelection()?.removeAllRanges()

      const subPrev = submissionRef.current
      const commPrev = commentsRef.current
      const id = nextAnnotationId(commPrev, subPrev)

      let priority = issue.defaultPriority ?? 'medium'
      if (priority === 'high' && !canSetHighPriority(commPrev, id)) {
        priority = 'medium'
      }

      const baseComment = {
        id,
        issueId: issue.id,
        annotationType: 'improvement',
        priority,
        label: `Annotation ${id}`,
        issueTitle: issue.title,
        whyItMatters: issue.whyItMatters,
        nextStep: issue.nextStep,
      }

      /** Whole-paragraph issues do not insert inline chips — avoids implying one sentence is the problem. */
      if (pending.scope === 'paragraph') {
        setComments([
          ...commPrev,
          {
            ...baseComment,
            anchorKind: 'paragraph',
            paragraphIndex: pending.paragraphIndex,
          },
        ])
        setActiveAnnotationId(id)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => focusAnnotation(id))
        })
        return
      }

      const { paragraphIndex, start, end, quote } = pending
      const para = subPrev.paragraphs[paragraphIndex]
      if (!para) return
      const newText = tryAddAnnotationFromRange(para.text, start, end, id)
      if (!newText) return

      setSubmission({
        paragraphs: subPrev.paragraphs.map((p, i) => (i === paragraphIndex ? { ...p, text: newText } : p)),
      })
      setComments([
        ...commPrev,
        {
          ...baseComment,
          anchorKind: 'range',
          quote,
        },
      ])
      setActiveAnnotationId(id)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => focusAnnotation(id))
      })
    },
    [focusAnnotation, setComments, setSubmission],
  )

  const handleIssueBankItemClick = useCallback(
    (issueId) => {
      setSelectedIssueId(issueId)
      setIssueBankNotice(null)
      const issue = issueTemplate(issueId)
      if (!issue) return

      const pending = pendingSelRef.current
      if (pending) {
        createAnnotationFromPending(issue)
        return
      }

      const commentId = activeAnnotationIdRef.current
      if (commentId) {
        const comm = commentsRef.current.find((c) => c.id === commentId)
        if (comm && comm.issueId !== issueId) {
          applyIssueTemplateToComment(commentId, issueId)
          return
        }
        if (comm && comm.issueId === issueId) {
          return
        }
      }

      setIssueBankNotice('select_text_first')
    },
    [applyIssueTemplateToComment, createAnnotationFromPending],
  )

  const handleUpdateComment = useCallback((commentId, partial) => {
    if (partial.priority === 'high') {
      const prev = commentsRef.current
      if (!canSetHighPriority(prev, commentId)) {
        setPriorityCapWarningId(commentId)
        if (priorityCapTimerRef.current) window.clearTimeout(priorityCapTimerRef.current)
        priorityCapTimerRef.current = window.setTimeout(() => setPriorityCapWarningId(null), 4500)
        return
      }
    }
    if (partial.priority != null && partial.priority !== 'high') {
      setPriorityCapWarningId((w) => (w === commentId ? null : w))
    }
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, ...partial } : c)))
  }, [setComments])

  const handleCycleCommentPriority = useCallback(
    (commentId, currentPriority) => {
      const next = getNextCycledPriority(commentsRef.current, commentId, currentPriority)
      if (next === currentPriority) return
      handleUpdateComment(commentId, { priority: next })
    },
    [handleUpdateComment],
  )

  const handleDeleteComment = useCallback(
    (commentId) => {
      if (activeAnnotationIdRef.current === commentId) {
        setSelectedIssueId(null)
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setSubmission((prev) => ({
        paragraphs: prev.paragraphs.map((p) => ({
          ...p,
          text: removeAnnotationFromChunks(p.text, commentId),
        })),
      }))
      setActiveAnnotationId((id) => (id === commentId ? null : id))
      setPriorityCapWarningId((w) => (w === commentId ? null : w))
      pendingSelRef.current = null
      setHasPendingSelection(false)
      setPendingSelectionScope(null)
    },
    [setComments, setSubmission],
  )

  const tagParagraphEnd = useCallback((paragraphIndex) => {
    if (!submissionRef.current?.paragraphs?.[paragraphIndex]) return
    window.getSelection()?.removeAllRanges()
    setActiveAnnotationId(null)
    pendingSelRef.current = {
      scope: 'paragraph',
      paragraphIndex,
    }
    setPendingSelectionScope('paragraph')
    setHasPendingSelection(true)
  }, [setActiveAnnotationId])

  const handleSendFeedback = useCallback(() => {
    const c = commentsRef.current
    if (!Array.isArray(c) || !areAllAnnotationsComplete(c)) return
    const s = submissionRef.current
    let commentsSnapshot
    let submissionSnapshot
    try {
      commentsSnapshot = structuredClone(c)
      submissionSnapshot =
        s != null && typeof s === 'object' ? structuredClone(s) : s
    } catch {
      commentsSnapshot = c.map((item) => ({ ...item }))
      submissionSnapshot =
        s && typeof s === 'object'
          ? {
              ...s,
              paragraphs: Array.isArray(s.paragraphs)
                ? s.paragraphs.map((p) => ({
                    ...p,
                    text: Array.isArray(p.text) ? [...p.text] : p.text,
                  }))
                : s.paragraphs,
            }
          : s
    }
    onSendFeedback?.({
      submission: submissionSnapshot,
      comments: commentsSnapshot,
      summary: buildStudentSummary(commentsSnapshot),
      noteToStudent: noteToStudent.trim() || undefined,
    })
  }, [onSendFeedback, noteToStudent])

  useEffect(() => {
    const root = submissionScrollRef.current
    if (!root) return

    const clearPending = () => {
      pendingSelRef.current = null
      setHasPendingSelection(false)
      setPendingSelectionScope(null)
    }

    const onPointerFinish = (e) => {
      if (e.type === 'mouseup' && e.button !== 0) return
      if (!root.contains(e.target)) return
      if (e.target?.closest?.('.submission-paragraph__end')) return

      requestAnimationFrame(() => {
        const sel = window.getSelection()
        if (!sel || sel.rangeCount === 0) {
          clearPending()
          return
        }
        const range = sel.getRangeAt(0)
        if (range.isCollapsed) {
          clearPending()
          return
        }
        if (!root.contains(range.commonAncestorContainer)) {
          clearPending()
          return
        }
        let n = range.commonAncestorContainer
        if (n.nodeType !== Node.ELEMENT_NODE) n = n.parentElement
        const p = n?.closest?.('p[data-paragraph-index]')
        if (!p || !root.contains(p)) {
          clearPending()
          return
        }
        const pi = parseInt(p.dataset.paragraphIndex, 10)
        if (Number.isNaN(pi)) {
          clearPending()
          return
        }
        const para = submissionRef.current.paragraphs[pi]
        if (!para) {
          clearPending()
          return
        }
        if (selectionIntersectsAnnotationChip(range, p)) {
          clearPending()
          return
        }
        const offsets = getTextOffsetsInParagraph(p, range)
        if (!offsets || offsets.start >= offsets.end) {
          clearPending()
          return
        }
        const quote = sel.toString()
        if (!quote.trim()) {
          clearPending()
          return
        }
        if (!tryAddAnnotationFromRange(para.text, offsets.start, offsets.end, '__dry__')) {
          clearPending()
          return
        }
        const rect = range.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) {
          clearPending()
          return
        }
        setActiveAnnotationId(null)
        pendingSelRef.current = {
          scope: 'range',
          paragraphIndex: pi,
          start: offsets.start,
          end: offsets.end,
          quote,
        }
        setPendingSelectionScope('range')
        setHasPendingSelection(true)
      })
    }

    const onScroll = () => clearPending()

    document.addEventListener('mouseup', onPointerFinish)
    document.addEventListener('touchend', onPointerFinish, { passive: true })
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('mouseup', onPointerFinish)
      document.removeEventListener('touchend', onPointerFinish)
      root.removeEventListener('scroll', onScroll)
    }
  }, [setActiveAnnotationId])

  useEffect(() => {
    if (!hasPendingSelection) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        pendingSelRef.current = null
        setHasPendingSelection(false)
        setPendingSelectionScope(null)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [hasPendingSelection])

  useEffect(() => {
    if (!hasPendingSelection) return
    const onDocMouseDown = (e) => {
      const t = e.target
      if (submissionScrollRef.current?.contains(t)) return
      if (t.closest?.('.issue-bank-list') || t.closest?.('.teacher-col--issues')) return
      pendingSelRef.current = null
      setHasPendingSelection(false)
      setPendingSelectionScope(null)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [hasPendingSelection])

  useEffect(() => {
    if (issueBankNotice !== 'select_text_first') return
    const t = window.setTimeout(() => setIssueBankNotice(null), 2800)
    return () => window.clearTimeout(t)
  }, [issueBankNotice])

  useEffect(
    () => () => {
      if (priorityCapTimerRef.current) window.clearTimeout(priorityCapTimerRef.current)
    },
    [],
  )

  return (
    <div className="teacher-layout">
      <div className="teacher-layout__workspace teacher-ws">
        <header className="teacher-ws__hcell teacher-ws__hcell--submission">{submissionTitle}</header>
        <header className="teacher-ws__hcell teacher-ws__hcell--issues">{issueBankTitle}</header>
        <header className="teacher-ws__hcell teacher-ws__hcell--comments teacher-ws__hcell--comments-with-toolbar">
          <span className="teacher-ws__comments-title">{commentsTitle}</span>
          <div className="comments-quality-bar comments-quality-bar--in-ws-header">
            <span
              className={`comments-quality-badge comments-quality-badge--${
                feedbackQuality === 'PASS' ? 'pass' : 'fail'
              }`}
            >
              Feedback Quality: <strong>{feedbackQuality}</strong>
            </span>
            <button
              type="button"
              className="comments-send-btn"
              disabled={!allCommentsComplete}
              title={
                allCommentsComplete
                  ? 'Send feedback to student'
                  : 'Complete all feedback items before sending'
              }
              aria-disabled={!allCommentsComplete}
              onClick={() => handleSendFeedback()}
            >
              Send
            </button>
          </div>
        </header>

        <div className="teacher-ws__bcell teacher-ws__bcell--submission">
          <SubmissionColumn
            scrollContainerRef={submissionScrollRef}
            title={submissionTitle}
            showHeader={false}
          >
            {submissionModel.paragraphs.map((p, i) => {
              const paragraphScoped = commentsList.filter(
                (c) => c.anchorKind === 'paragraph' && c.paragraphIndex === i,
              )
              return (
                <div key={p.key ?? i} className="submission-paragraph-wrap">
                  <p data-paragraph-index={i} className="teacher-submission-paragraph">
                    {p.text.map((chunk, j) =>
                      typeof chunk === 'string' ? (
                        <Fragment key={`${i}-${j}`}>{chunk}</Fragment>
                      ) : (
                        <AnnotationChip
                          key={chunk.id}
                          ref={(el) => setAnnotationRef(annotationTargetRefs, chunk.id, el)}
                          annotation={commentById[chunk.id] ?? { id: chunk.id }}
                          isActive={activeAnnotationId === chunk.id}
                          onActivate={handleAnnotationChipClick}
                        >
                          {chunk.text}
                        </AnnotationChip>
                      ),
                    )}
                  </p>
                  {paragraphScoped.length > 0 ? (
                    <div
                      className="submission-paragraph__para-issues"
                      role="list"
                      aria-label="Paragraph-level issues for this paragraph"
                    >
                      {paragraphScoped.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          role="listitem"
                          ref={(el) => setAnnotationRef(annotationTargetRefs, c.id, el)}
                          className={`submission-paragraph-issue${activeAnnotationId === c.id ? ' is-active' : ''}`}
                          title={c.issueTitle}
                          onClick={() => handleCommentClick(c.id)}
                        >
                          <span className="submission-paragraph-issue__scope">Paragraph</span>
                          <span className="submission-paragraph-issue__title">{c.issueTitle}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="submission-paragraph__end"
                    title="Mark this paragraph for a paragraph-level issue"
                    aria-label={`Mark paragraph ${i + 1} for a paragraph-level issue`}
                    onClick={() => tagParagraphEnd(i)}
                  >
                    Mark paragraph
                  </button>
                </div>
              )
            })}
          </SubmissionColumn>
        </div>

        <div className="teacher-ws__bcell teacher-ws__bcell--issues">
          <IssueBankColumn collapsed={false} onToggleCollapsed={() => {}} title={issueBankTitle} showHeader={false}>
            {issueBankContent ?? (
              <div className="issue-bank-list">
                {hasPendingSelection ? (
                  <p className="issue-bank-pending" role="status">
                    {pendingSelectionScope === 'paragraph'
                      ? 'Paragraph marked — choose an issue for this paragraph.'
                      : 'Text selected — choose an issue to add the comment.'}
                  </p>
                ) : null}
                {issueBankNotice === 'select_text_first' ? (
                  <p className="issue-bank-notice" role="alert">
                    Select text first
                  </p>
                ) : null}
                {issueBank.map((issue, index) => {
                  const prev = issueBank[index - 1]
                  const gapBeforeCategory =
                    index > 0 && issueCategorySegment(issue.id) !== issueCategorySegment(prev.id)
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      className={`issue-bank-item ${issueBankStripeClass(issue.id)}${
                        gapBeforeCategory ? ' issue-bank-item--category-gap-before' : ''
                      }${selectedIssueId === issue.id ? ' is-selected' : ''}`}
                      onClick={() => handleIssueBankItemClick(issue.id)}
                    >
                      <span className="issue-bank-item__title">{issue.title}</span>
                      {issue.oneLiner?.trim() ? (
                        <span className="issue-bank-item__one-liner">{issue.oneLiner.trim()}</span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )}
          </IssueBankColumn>
        </div>

        <div className="teacher-ws__bcell teacher-ws__bcell--comments">
          <CommentsColumn
            activeAnnotationId={activeAnnotationId}
            onCommentClick={handleCommentClick}
            onUpdateComment={handleUpdateComment}
            onCycleCommentPriority={handleCycleCommentPriority}
            onDeleteComment={handleDeleteComment}
            onSendFeedback={handleSendFeedback}
            priorityCapWarningId={priorityCapWarningId}
            commentItemRefs={commentItemRefs}
            title={commentsTitle}
            showHeader={false}
            showQualityToolbar={false}
            comments={commentsList}
            noteToStudent={noteToStudent}
            onNoteToStudentChange={setNoteToStudent}
          />
        </div>
      </div>
    </div>
  )
}
