import IssueBankEditor from '../leader/IssueBankEditor.jsx'
import './editor-page.css'

/**
 * Curriculum coordinators: edit the shared issue bank teachers use when marking.
 */
export default function EditorPage() {
  return (
    <div className="editor-page">
      <header className="editor-page__hero">
        <h1 className="editor-page__title">Issue bank editor</h1>
        <p className="editor-page__intro">
          Add or edit the problems teachers can tag in student work. For each issue, write a <strong>title</strong>, a
          short line for the list, <strong>why it matters</strong>, and a clear <strong>next step</strong> for the student.
          Then save — teachers will see these in the Teacher view.
        </p>
      </header>
      <div className="editor-page__body">
        <IssueBankEditor />
      </div>
    </div>
  )
}
