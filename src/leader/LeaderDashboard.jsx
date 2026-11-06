import { useMemo, useState } from 'react'
import { FILTER_OPTIONS, getLeaderDashboardData } from './leaderDemoData.js'
import IssueBankEditor from './IssueBankEditor.jsx'
import LiveDeviceActivity from './LiveDeviceActivity.jsx'
import './leader-dashboard.css'

function trendDeltaDir(delta) {
  if (delta === 'stable') return 'flat'
  const t = String(delta).trim()
  if (t.startsWith('-') || t.startsWith('\u2212') || t.startsWith('+')) {
    if (t.startsWith('-') || t.startsWith('\u2212')) return 'down'
    return 'up'
  }
  return 'flat'
}

function TrendChart({ weekLabels, series, title }) {
  const W = 720
  const H = 220
  const padL = 36
  const padR = 12
  const padT = 16
  const padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const n = weekLabels.length
  const xDenom = Math.max(n - 1, 1)

  const { max, points } = useMemo(() => {
    if (!Array.isArray(series) || series.length === 0) {
      return { max: 1, points: [] }
    }
    const all = series.flatMap((s) => s.values)
    const rawMax = Math.max(...all, 1)
    const maxv = Math.ceil(rawMax * 1.1)
    const pts = series.map((s) => ({
      key: s.key,
      label: s.label,
      color: s.color,
      d: s.values
        .map((v, i) => {
          const x = padL + (i / xDenom) * innerW
          const y = padT + innerH - (v / maxv) * innerH
          return `${i === 0 ? 'M' : 'L'}${x},${y}`
        })
        .join(' '),
    }))
    return { max: maxv, points: pts }
  }, [series, weekLabels, xDenom, innerW, innerH])

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padT + innerH * (1 - t),
    lab: Math.round(max * t),
  }))

  if (n < 2) return null

  return (
    <div className="ld-chart" aria-label={title}>
      <h3 className="ld-section-title">{title}</h3>
      <div className="ld-chart__inner">
        <svg className="ld-chart__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} className="ld-chart__axis" />
          <line
            x1={padL}
            y1={padT + innerH}
            x2={W - padR}
            y2={padT + innerH}
            className="ld-chart__axis"
          />
          {yTicks.map((t) => (
            <g key={`y-${t.y}`}>
              <line
                x1={padL}
                y1={t.y}
                x2={W - padR}
                y2={t.y}
                className="ld-chart__grid"
              />
              <text x={padL - 6} y={t.y + 4} className="ld-chart__ylabel" textAnchor="end">
                {t.lab}
              </text>
            </g>
          ))}
          {points.map((p) => (
            <path key={p.key} d={p.d} fill="none" className="ld-chart__line" stroke={p.color} />
          ))}
          {weekLabels.map((lab, i) => {
            const x = padL + (i / xDenom) * innerW
            return (
              <text
                key={`w-${i}-${lab}`}
                x={x}
                y={H - 6}
                className="ld-chart__xlabel"
                textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
              >
                {lab}
              </text>
            )
          })}
        </svg>
        <ul className="ld-chart__legend" aria-label="Chart legend">
          {series.map((s) => (
            <li key={s.key} className="ld-chart__legend-item">
              <span className="ld-chart__swatch" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function LeaderDashboard() {
  const [leaderTab, setLeaderTab] = useState('insight')
  const [year, setYear] = useState('Year 10')
  const [subject, setSubject] = useState('All subjects')
  const [range, setRange] = useState('Last 8 weeks')
  const [reportView, setReportView] = useState('faculty')

  const data = useMemo(
    () => getLeaderDashboardData({ year, subject, range }),
    [year, subject, range],
  )

  return (
    <div className="ld">
      <header className="ld__bar">
        <div className="ld__bar-titles">
          <h1 className="ld__title">Feedback OS — Leader</h1>
          <p className="ld__subtitle">
            {leaderTab === 'insight'
              ? 'MSHS Y7 Task 2 (Persuasive Spoken): cohort view is demo data. Not individual teacher scores. Issue bank tab mirrors the faculty feedback sheet; reset loads the official default list from code.'
              : 'Edit the twelve default issues (Application, Organisation/Development, Textual Features). Same wording as the printed sheet, adapted for on-screen “why / next step.” Saved in this browser until a server is connected.'}
          </p>
          <div className="ld-tabs" role="tablist" aria-label="Leader sections">
            <button
              type="button"
              className={'ld-tab' + (leaderTab === 'insight' ? ' ld-tab--active' : '')}
              id="ld-tab-insight"
              role="tab"
              aria-selected={leaderTab === 'insight'}
              onClick={() => setLeaderTab('insight')}
            >
              Cohort insight
            </button>
            <button
              type="button"
              className={'ld-tab' + (leaderTab === 'issues' ? ' ld-tab--active' : '')}
              id="ld-tab-issues"
              role="tab"
              aria-selected={leaderTab === 'issues'}
              onClick={() => setLeaderTab('issues')}
            >
              Issue bank
            </button>
          </div>
        </div>
      </header>

      <div className="ld__body">
        {leaderTab === 'issues' ? (
          <IssueBankEditor />
        ) : (
        <>
        <div className="ld-toolbar" role="group" aria-label="Cohort filters">
          <div className="ld-field">
            <label className="ld-label" htmlFor="ld-year">
              Cohort
            </label>
            <select
              id="ld-year"
              className="ld-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {FILTER_OPTIONS.year.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="ld-field">
            <label className="ld-label" htmlFor="ld-subject">
              Subject
            </label>
            <select
              id="ld-subject"
              className="ld-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {FILTER_OPTIONS.subject.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="ld-field">
            <label className="ld-label" htmlFor="ld-range">
              Window
            </label>
            <select
              id="ld-range"
              className="ld-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              {FILTER_OPTIONS.range.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ld-toolbar" role="group" aria-label="Reporting lens">
          <div className="ld-field">
            <label className="ld-label" htmlFor="ld-report-view">
              Reporting view
            </label>
            <select
              id="ld-report-view"
              className="ld-select"
              value={reportView}
              onChange={(e) => setReportView(e.target.value)}
            >
              <option value="faculty">Faculty view (core codes)</option>
              <option value="task">Task view (local + core codes)</option>
            </select>
          </div>
        </div>

        <LiveDeviceActivity reportView={reportView} />

        <section className="ld-card ld-card--headline" aria-labelledby="ld-headline-title">
          <h2 id="ld-headline-title" className="ld-card__h">
            This week in brief
          </h2>
          <ul className="ld-brief-list">
            {data.briefBullets.map((line, i) => (
              <li key={`brief-${i}`} className="ld-brief-list__item">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <ul className="ld-kpi-row">
          {data.kpis.map((k) => (
            <li key={k.id} className="ld-kpi">
              <span className="ld-kpi__label">{k.label}</span>
              <span className="ld-kpi__value">{k.value}</span>
              {k.sub ? (
                <span className={`ld-kpi__sub${k.trend === 'up' ? ' ld-kpi__sub--up' : ''}`}>{k.sub}</span>
              ) : null}
            </li>
          ))}
        </ul>

        <TrendChart
          weekLabels={data.weekLabels}
          series={data.series}
          title="Issue mix over time (count of structured items)"
        />

        <div className="ld-two-col">
          <section className="ld-card ld-card--trend" aria-labelledby="ld-emerge">
            <h2 id="ld-emerge" className="ld-card__h">
              Watch list
            </h2>
            <p className="ld-card__lede">Themes increasing relative to prior period — for discussion, not blame.</p>
            <ul className="ld-trend-list">
              {data.emerging.map((e) => (
                <li key={e.title} className="ld-trend-item ld-trend-item--emerge">
                  <div className="ld-trend-top">
                    <span className="ld-trend-title">{e.title}</span>
                    <span className="ld-trend-delta" data-dir={trendDeltaDir(e.delta)}>
                      {e.delta}
                    </span>
                  </div>
                  <p className="ld-trend-copy">{e.copy}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="ld-card ld-card--trend" aria-labelledby="ld-better">
            <h2 id="ld-better" className="ld-card__h">
              Momentum
            </h2>
            <p className="ld-card__lede">Where the cohort pattern is flat or moving in a helpful direction.</p>
            <ul className="ld-trend-list">
              {data.improving.map((e) => (
                <li key={e.title} className="ld-trend-item ld-trend-item--good">
                  <div className="ld-trend-top">
                    <span className="ld-trend-title">{e.title}</span>
                    <span className="ld-trend-delta" data-dir={trendDeltaDir(e.delta)}>
                      {e.delta}
                    </span>
                  </div>
                  <p className="ld-trend-copy">{e.copy}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="ld-foot">
          Charts and cohort copy below are demo data. <strong>Live — this device</strong> is real: it updates when you send
          from Teacher in this browser. Production will use your server. Staff are not ranked.
        </p>
        </>
        )}
      </div>
    </div>
  )
}
