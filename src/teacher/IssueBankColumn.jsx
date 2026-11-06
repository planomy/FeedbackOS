import './teacher-layout.css'

export default function IssueBankColumn({
  collapsed,
  onToggleCollapsed,
  title = 'Issue bank',
  showHeader = true,
  children,
}) {
  return (
    <section
      className={`teacher-col teacher-col--issues teacher-col--issues-bfill${
        collapsed ? ' is-collapsed' : ''
      }`}
      aria-label={title}
    >
      {collapsed ? (
        <button
          type="button"
          className="issue-bank-toggle"
          aria-expanded={false}
          title="Expand issue bank"
          onClick={() => onToggleCollapsed(false)}
        >
          ≡
        </button>
      ) : showHeader ? (
        <>
          <header className="teacher-col__head teacher-col__head--with-actions">
            <span>{title}</span>
            <button
              type="button"
              className="issue-bank-toggle"
              style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
              aria-expanded
              title="Collapse issue bank"
              onClick={() => onToggleCollapsed(true)}
            >
              ←
            </button>
          </header>
          <div className="teacher-col__scroll">
            <div className="teacher-col__inner">{children}</div>
          </div>
        </>
      ) : (
        <div className="teacher-col__scroll">
          <div className="teacher-col__inner">{children}</div>
        </div>
      )}
    </section>
  )
}
