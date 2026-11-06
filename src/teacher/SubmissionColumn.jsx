import './teacher-layout.css'

/**
 * Single scroll container for submission body. Annotation chips register via setAnnotationRef on the parent.
 */
export default function SubmissionColumn({
  scrollContainerRef,
  title = 'Student submission',
  showHeader = true,
  children,
}) {
  return (
    <section
      className="teacher-col teacher-col--submission teacher-col--submission-bfill"
      aria-label={title}
    >
      {showHeader ? <header className="teacher-col__head">{title}</header> : null}
      <div className="teacher-col__scroll" ref={scrollContainerRef}>
        <div className="teacher-col__inner">{children}</div>
      </div>
    </section>
  )
}
