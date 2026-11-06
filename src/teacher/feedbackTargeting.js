/** @typedef {'improvement' | 'strength'} AnnotationType */

export const VALID_ANNOTATION_TYPES = ['improvement', 'strength']

export const MAX_HIGH_PRIORITY_PER_SUBMISSION = 3

/** Shown when no strength annotation exists (student-facing summary). */
export const STUDENT_SUMMARY_STRENGTH_PLACEHOLDER =
  'Your teacher may add a strength here after the next review.'

export function normalizeAnnotationType(comment) {
  const t = comment?.annotationType
  if (VALID_ANNOTATION_TYPES.includes(t)) return t
  return 'improvement'
}

const PRIORITY_RANK = { high: 3, medium: 2, low: 1 }

function priorityRank(p) {
  return PRIORITY_RANK[p] ?? 0
}

/**
 * True if this comment may be set (or kept) at high without exceeding the school cap.
 * Already-high comments may stay high; new highs allowed only if fewer than 3 others are high.
 */
/** Same order as legacy cycle: high → medium → low → high, skipping high when cap is full. */
const PRIORITY_CYCLE_ORDER = ['high', 'medium', 'low']

/**
 * Next priority when clicking the cycle control. If the cap blocks another `high`,
 * continues to the next step (e.g. low → medium when 3 highs already exist).
 */
export function getNextCycledPriority(comments, commentId, currentPriority) {
  const startIdx = PRIORITY_CYCLE_ORDER.indexOf(currentPriority)
  const first = startIdx < 0 ? 0 : (startIdx + 1) % PRIORITY_CYCLE_ORDER.length
  if (!Array.isArray(comments)) {
    return PRIORITY_CYCLE_ORDER[first]
  }
  for (let k = 0; k < PRIORITY_CYCLE_ORDER.length; k++) {
    const idx = (first + k) % PRIORITY_CYCLE_ORDER.length
    const candidate = PRIORITY_CYCLE_ORDER[idx]
    if (candidate === 'high' && !canSetHighPriority(comments, commentId)) continue
    return candidate
  }
  return currentPriority
}

export function canSetHighPriority(comments, commentId) {
  if (!Array.isArray(comments)) return false
  const highs = getHighPriority(comments)
  const selfAlreadyHigh = highs.some((c) => c.id === commentId)
  if (selfAlreadyHigh) return true
  return highs.length < MAX_HIGH_PRIORITY_PER_SUBMISSION
}

/** All comments marked high priority (any type). */
export function getHighPriority(comments) {
  if (!Array.isArray(comments)) return []
  return comments.filter((c) => c.priority === 'high')
}

export function getHighPriorityAnnotations(comments) {
  return getHighPriority(comments)
}

export function getMediumPriority(comments) {
  if (!Array.isArray(comments)) return []
  return comments.filter((c) => c.priority === 'medium')
}

export function getLowPriority(comments) {
  if (!Array.isArray(comments)) return []
  return comments.filter((c) => c.priority === 'low')
}

/**
 * First `limit` high-priority comments, stable order by id (classroom-safe tie-break).
 */
export function getTopHighPriority(comments, limit = 3) {
  const sorted = [...getHighPriority(comments)].sort((a, b) => String(a.id).localeCompare(String(b.id)))
  return sorted.slice(0, Math.max(0, limit))
}

/**
 * Top 2 improvement annotations for student focus: highest priority first (high > medium > low).
 */
export function getTopTargets(comments) {
  if (!Array.isArray(comments)) return []
  const improvements = comments.filter((c) => normalizeAnnotationType(c) === 'improvement')
  const sorted = [...improvements].sort((a, b) => {
    const d = priorityRank(b.priority) - priorityRank(a.priority)
    if (d !== 0) return d
    return String(a.id).localeCompare(String(b.id))
  })
  return sorted.slice(0, 2)
}

/**
 * Single best strength for student summary: prefer higher priority among strength-type annotations.
 */
export function getTopStrength(comments) {
  if (!Array.isArray(comments)) return null
  const strengths = comments.filter((c) => normalizeAnnotationType(c) === 'strength')
  if (strengths.length === 0) return null
  const sorted = [...strengths].sort((a, b) => {
    const d = priorityRank(b.priority) - priorityRank(a.priority)
    if (d !== 0) return d
    return String(a.id).localeCompare(String(b.id))
  })
  return sorted[0] ?? null
}

/** Student summary bundle: top targets, strength or placeholder flag. */
export function buildStudentSummary(comments) {
  const topStrength = getTopStrength(comments)
  return {
    topTargets: getTopTargets(comments),
    topStrength,
    strengthPlaceholder: topStrength ? null : STUDENT_SUMMARY_STRENGTH_PLACEHOLDER,
  }
}

/**
 * Which paragraph index contains an inline annotation chip with this id (range-scoped comments).
 * @returns {number | null}
 */
export function findParagraphIndexContainingAnnotation(submission, commentId) {
  if (commentId == null || !submission?.paragraphs || !Array.isArray(submission.paragraphs)) return null
  const id = String(commentId)
  for (let i = 0; i < submission.paragraphs.length; i++) {
    const chunks = submission.paragraphs[i]?.text
    if (!Array.isArray(chunks)) continue
    for (const ch of chunks) {
      if (typeof ch === 'object' && ch && String(ch.id) === id) return i
    }
  }
  return null
}

/** Sort high → medium → low, then id (student-facing report lists). */
export function compareCommentsByPriorityDescThenId(a, b) {
  const d = priorityRank(b.priority) - priorityRank(a.priority)
  if (d !== 0) return d
  return String(a.id).localeCompare(String(b.id))
}

/**
 * Group improvement comments for paragraph-first student report.
 * - `anchorKind === 'essay'` → whole-essay bucket.
 * - `anchorKind === 'paragraph'` → that paragraph index.
 * - range / legacy (chip id in submission) → paragraph that contains the chip.
 * - Otherwise → whole-essay (orphan / cross-cutting).
 *
 * @returns {{ paragraphItems: Map<number, unknown[]>, essayItems: unknown[] }}
 */
export function groupImprovementCommentsForStudentReport(comments, submission) {
  /** @type {Map<number, unknown[]>} */
  const paragraphItems = new Map()
  const essayItems = []

  if (!Array.isArray(comments)) {
    return { paragraphItems, essayItems }
  }

  const improvements = comments.filter((c) => normalizeAnnotationType(c) === 'improvement')

  for (const c of improvements) {
    if (c.anchorKind === 'essay') {
      essayItems.push(c)
      continue
    }
    if (c.anchorKind === 'paragraph' && Number.isInteger(c.paragraphIndex)) {
      const i = c.paragraphIndex
      if (!paragraphItems.has(i)) paragraphItems.set(i, [])
      paragraphItems.get(i).push(c)
      continue
    }
    const pi = findParagraphIndexContainingAnnotation(submission, c.id)
    if (pi !== null) {
      if (!paragraphItems.has(pi)) paragraphItems.set(pi, [])
      paragraphItems.get(pi).push(c)
    } else {
      essayItems.push(c)
    }
  }

  for (const arr of paragraphItems.values()) {
    arr.sort(compareCommentsByPriorityDescThenId)
  }
  essayItems.sort(compareCommentsByPriorityDescThenId)

  return { paragraphItems, essayItems }
}
