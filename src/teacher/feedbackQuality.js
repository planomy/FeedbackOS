/** @typedef {'high' | 'medium' | 'low'} FeedbackPriority */

export const VALID_PRIORITIES = ['high', 'medium', 'low']

export function priorityLabel(priority) {
  switch (priority) {
    case 'high':
      return 'High priority'
    case 'medium':
      return 'Medium priority'
    case 'low':
      return 'Low priority'
    default:
      return 'Set priority'
  }
}

/** Inline label shown before the priority dot */
export function priorityUpperLabel(priority) {
  switch (priority) {
    case 'high':
      return 'HIGH PRIORITY'
    case 'medium':
      return 'MEDIUM PRIORITY'
    case 'low':
      return 'LOW PRIORITY'
    default:
      return 'SET PRIORITY'
  }
}

function nonBlank(s) {
  return typeof s === 'string' && s.trim().length > 0
}

/**
 * An annotation is complete only when:
 * - an issue is selected (issueId + issue title),
 * - why it matters is non-empty,
 * - next step is non-empty,
 * - priority is high | medium | low.
 * annotationType defaults to improvement when absent; both improvement and strength satisfy the gate.
 */
export function isAnnotationComplete(comment) {
  if (!comment) return false
  if (!nonBlank(comment.issueId)) return false
  if (!nonBlank(comment.issueTitle)) return false
  if (!nonBlank(comment.whyItMatters)) return false
  if (!nonBlank(comment.nextStep)) return false
  if (!VALID_PRIORITIES.includes(comment.priority)) return false
  return true
}

export function areAllAnnotationsComplete(comments) {
  if (!Array.isArray(comments) || comments.length === 0) return true
  return comments.every(isAnnotationComplete)
}

export function feedbackQualityStatus(comments) {
  return areAllAnnotationsComplete(comments) ? 'PASS' : 'FAIL'
}

/** Next value when cycling the priority dot (unset → high). */
export function cyclePriority(current) {
  const order = VALID_PRIORITIES
  const i = order.indexOf(current)
  if (i < 0) return 'high'
  return order[(i + 1) % order.length]
}
