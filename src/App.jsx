import { useState } from 'react'
import TeacherLayout from './teacher/TeacherLayout.jsx'
import StudentPage from './teacher/StudentPage.jsx'
import LeaderDashboard from './leader/LeaderDashboard.jsx'
import EditorPage from './editor/EditorPage.jsx'
import { recordFeedbackSent } from './services/feedbackApi.js'
import { DEFAULT_COMMENTS, DEFAULT_SUBMISSION } from './teacher/markingDemoData.js'

export default function App() {
  const [view, setView] = useState('editor')
  const [submission, setSubmission] = useState(DEFAULT_SUBMISSION)
  const [comments, setComments] = useState(DEFAULT_COMMENTS)
  const [sentSnapshot, setSentSnapshot] = useState(null)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderBottom: '1px solid var(--border, #e2e4e9)',
          background: 'var(--surface, #fff)',
          fontSize: 13,
        }}
      >
        <h1 className="app-shell-brand">Feedback OS</h1>
        <button
          type="button"
          onClick={() => setView('teacher')}
          style={{
            padding: '4px 10px',
            fontWeight: view === 'teacher' ? 600 : 400,
            border: '1px solid var(--border, #e2e4e9)',
            borderRadius: 4,
            background: view === 'teacher' ? 'var(--accent-soft, #dbeafe)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Teacher
        </button>
        <button
          type="button"
          onClick={() => setView('student')}
          style={{
            padding: '4px 10px',
            fontWeight: view === 'student' ? 600 : 400,
            border: '1px solid var(--border, #e2e4e9)',
            borderRadius: 4,
            background: view === 'student' ? 'var(--accent-soft, #dbeafe)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => setView('leader')}
          style={{
            padding: '4px 10px',
            fontWeight: view === 'leader' ? 600 : 400,
            border: '1px solid var(--border, #e2e4e9)',
            borderRadius: 4,
            background: view === 'leader' ? 'var(--accent-soft, #dbeafe)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Leader
        </button>
        <button
          type="button"
          onClick={() => setView('editor')}
          style={{
            padding: '4px 10px',
            fontWeight: view === 'editor' ? 600 : 400,
            border: '1px solid var(--border, #e2e4e9)',
            borderRadius: 4,
            background: view === 'editor' ? 'var(--accent-soft, #dbeafe)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Editor
        </button>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {view === 'teacher' ? (
          <TeacherLayout
            submissionTitle="Task 2 term draft"
            issueBankTitle="Issue bank"
            submission={submission}
            setSubmission={setSubmission}
            comments={comments}
            setComments={setComments}
            onSendFeedback={(data) => {
              if (!data) return
              setSentSnapshot({
                submission: data.submission,
                comments: Array.isArray(data.comments) ? data.comments : [],
                summary: data.summary,
                noteToStudent: data.noteToStudent,
              })
              recordFeedbackSent(data)
            }}
          />
        ) : view === 'student' ? (
          <StudentPage
            pageTitle="Your draft feedback"
            submission={sentSnapshot?.submission}
            comments={sentSnapshot?.comments}
            noteToStudent={sentSnapshot?.noteToStudent}
          />
        ) : view === 'leader' ? (
          <LeaderDashboard />
        ) : (
          <EditorPage />
        )}
      </div>
    </div>
  )
}
