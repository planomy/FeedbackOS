import { forwardRef } from 'react'

/**
 * Highlighted range in the submission. Parent registers the DOM node, e.g.
 * ref={(el) => setAnnotationRef(annotationTargetRefs, annotation.id, el)}
 * so comment.id and annotation.id stay aligned.
 */
const AnnotationChip = forwardRef(function AnnotationChip(
  { annotation, isActive, onActivate = () => {}, children, className, ...rest },
  ref,
) {
  const label = children ?? annotation.anchorLabel ?? annotation.issueTitle ?? annotation.id

  return (
    <span
      ref={ref}
      role="button"
      tabIndex={0}
      data-annotation-id={annotation.id}
      className={['annotation-chip', 'annotation-mark', isActive && 'is-active', className]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onActivate(annotation.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivate(annotation.id)
        }
      }}
      {...rest}
    >
      {label}
    </span>
  )
})

export default AnnotationChip
