import { useEffect, useState } from 'react'
import { getActivitySummary, subscribeActivity } from '../services/feedbackApi.js'

export default function LiveDeviceActivity({ reportView = 'faculty' }) {
  const [summary, setSummary] = useState(() => getActivitySummary({ reportView }))

  useEffect(() => {
    setSummary(getActivitySummary({ reportView }))
    return subscribeActivity(() => setSummary(getActivitySummary({ reportView })))
  }, [reportView])

  const empty = summary.totalSends === 0

  return (
    <section className="ld-card ld-card--live" aria-labelledby="ld-live-title">
      <div className="ld-live__head">
        <h2 id="ld-live-title" className="ld-card__h">
          Live — this device
        </h2>
        <span className="ld-live__badge">Local store</span>
      </div>
      <p className="ld-live__lede">
        Feeds from feedback you <strong>Send</strong> in Teacher view in this browser. Replaces with server data in production.
      </p>

      {empty ? (
        <p className="ld-live__empty">No sends yet. Switch to <strong>Teacher</strong>, complete comments, and click <strong>Send</strong> — it will show up here.</p>
      ) : (
        <>
          <ul className="ld-live__stats" aria-label="Session summary">
            <li className="ld-live__stat">
              <span className="ld-live__stat-label">Sends (all time)</span>
              <span className="ld-live__stat-value">{summary.totalSends}</span>
            </li>
            <li className="ld-live__stat">
              <span className="ld-live__stat-label">Sends (last 7 days)</span>
              <span className="ld-live__stat-value">{summary.last7Sends}</span>
            </li>
            <li className="ld-live__stat">
              <span className="ld-live__stat-label">Structured items recorded</span>
              <span className="ld-live__stat-value">{summary.totalStructuredItems}</span>
            </li>
          </ul>

          {summary.topIssues.length > 0 ? (
            <div className="ld-live__block">
              <h3 className="ld-live__mini-title">
                Most frequent issues ({reportView === 'faculty' ? 'faculty view' : 'task view'})
              </h3>
              <ol className="ld-live__issues">
                {summary.topIssues.map((t, i) => (
                  <li key={t.id} className="ld-live__issue-row">
                    <span className="ld-live__issue-num">{i + 1}.</span>
                    <span className="ld-live__issue-name">{t.label}</span>
                    <span className="ld-live__issue-count">{t.count}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {summary.recent.length > 0 ? (
            <div className="ld-live__block">
              <h3 className="ld-live__mini-title">Recent sends</h3>
              <ul className="ld-live__recent" aria-label="Recent feedback sends">
                {summary.recent.map((r) => (
                  <li key={r.id} className="ld-live__recent-item">
                    <time className="ld-live__recent-when" dateTime={r.sentAt}>
                      {r.when}
                    </time>
                    <div className="ld-live__recent-body">
                      <span className="ld-live__recent-line">{r.summary}</span>
                      <span className="ld-live__recent-sub">{r.sub}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
