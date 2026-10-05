import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, Plus, Settings2, X } from 'lucide-react';
import { endpoints } from '../services/api';
import { useToast } from '../context/ToastContext';
import { idOf } from '../shared/courseUtils';
import { PageSkeleton } from '../components/LoadingStates';
import { ErrorState } from '../components/ErrorState';

export function CourseForm({ edit = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(edit);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!edit) return undefined;
    let active = true;
    setLoading(true);
    setError(null);
    endpoints.course(id).then(course => { if (active) setForm({ title: course.title, description: course.description || '' }); })
      .catch(err => { if (active) setError(err.message || 'Unable to load course details.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [edit, id, retryCount]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const course = edit ? await endpoints.updateCourse(id, form) : await endpoints.createCourse(form);
      toast(edit ? 'Course details updated.' : 'Your course is ready for its first lesson.');
      navigate(`/courses/${idOf(course) || id}/edit`);
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  }

  if (error) return <ErrorState message={error} onRetry={() => setRetryCount(value => value + 1)}/>;
  if (loading) return <PageSkeleton layout="grid"/>;
  return <><div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/>{edit ? 'COURSE DETAILS' : 'CREATE A COURSE'}</div><h1>{edit ? 'Course details.' : 'New course.'}</h1><p>Add a title and description for this course.</p></div></div><form className="editor-card" onSubmit={submit}><label>Course title<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="e.g. The foundations of thoughtful design"/></label><label>Course description<textarea required rows="5" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Describe the course content and learning goals."/></label><div className="editor-actions"><Link className="text-link" to="/courses">Cancel</Link><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : edit ? 'Save changes' : 'Create course'} <ArrowRight size={16}/></button></div></form></>;
}

export function CourseEditor() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', order: '' });
  const [editing, setEditing] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([endpoints.course(id), endpoints.completionRate(id)]).then(([courseData, completionData]) => {
      if (!active) return;
      setCourse(courseData);
      setStats(completionData);
    }).catch(err => { if (active) setError(err.message || 'Unable to load course data.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, retryCount]);

  function reload() { setRetryCount(value => value + 1); }

  async function add(event) {
    event.preventDefault();
    const body = { ...form };
    if (body.order === '') delete body.order;
    else body.order = Number(body.order);
    try {
      if (editing) await endpoints.updateLesson(id, editing, body);
      else await endpoints.createLesson(id, body);
      setForm({ title: '', content: '', order: '' });
      setEditing(null);
      toast(editing ? 'Lesson updated.' : 'Lesson added to your course.');
      reload();
    } catch (err) { toast(err.message, 'error'); }
  }

  async function remove(lesson) {
    if (!window.confirm(`Delete “${lesson.title}”? Learner progress for this lesson will also be removed.`)) return;
    try { await endpoints.deleteLesson(id, idOf(lesson)); toast('Lesson deleted.'); reload(); }
    catch (err) { toast(err.message, 'error'); }
  }

  async function removeCourse() {
    if (!window.confirm(`Delete “${course.title}” and all of its lessons and learner progress? This cannot be undone.`)) return;
    try { await endpoints.deleteCourse(id); toast('Course and its lessons deleted.'); navigate('/dashboard'); }
    catch (err) { toast(err.message, 'error'); }
  }

  if (error) return <ErrorState message={error} onRetry={() => setRetryCount(value => value + 1)}/>;
  if (loading || !course) return <PageSkeleton layout="list"/>;
  const lessons = [...(course.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return <><div className="detail-back"><Link to={`/courses/${id}`}><ArrowDownRight size={15}/> View course</Link><Link className="subtle-link" to={`/analytics?course=${id}`}>Analytics <ArrowRight size={15}/></Link></div><div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/>COURSE STUDIO</div><h1>{course.title}</h1><p>Manage course details and lesson order.</p></div></div>
    <section className="editor-stats"><div><span>LESSONS</span><strong>{lessons.length}</strong></div><div><span>LEARNERS ENROLLED</span><strong>{stats?.totalEnrolled ?? 0}</strong></div><div><span>COMPLETION RATE</span><strong>{stats?.completionRate ?? 0}%</strong></div><Link className="button button-primary button-small" to={`/courses/${id}/edit/details`}><Settings2 size={15}/> Edit course details</Link><button type="button" className="delete-course-button" onClick={removeCourse}>Delete course</button></section>
    <div className="editor-layout"><section className="lesson-editor"><div className="lesson-section-head"><div><div className="eyebrow"><span className="eyebrow-line"/>CURRICULUM</div><h2>Your lessons</h2></div><span className="page-count">{lessons.length} modules</span></div><div className="lesson-list">{lessons.length ? lessons.map((lesson, index) => <article className="lesson-row compact" key={idOf(lesson)}><span className="lesson-number">{String(lesson.order || index + 1).padStart(2, '0')}</span><div className="lesson-content"><div><span className="lesson-kicker">LESSON {String(lesson.order || index + 1).padStart(2, '0')}</span><h3>{lesson.title}</h3></div><p>{lesson.content}</p></div><button type="button" className="icon-button" aria-label={`Edit ${lesson.title}`} onClick={() => { setEditing(idOf(lesson)); setForm({ title: lesson.title, content: lesson.content, order: lesson.order ?? index + 1 }); }}><Settings2 size={16}/></button><button type="button" className="icon-button danger-icon" aria-label={`Delete ${lesson.title}`} onClick={() => remove(lesson)}><X size={16}/></button></article>) : <div className="empty-state lesson-empty-state"><h3>No lessons yet.</h3><p>Add your first lesson using the form.</p></div>}</div></section>
      <form className="lesson-form" onSubmit={add}><div className="eyebrow"><span className="eyebrow-line"/>{editing ? 'EDIT LESSON' : 'ADD A LESSON'}</div><h3>{editing ? 'Update this lesson' : 'Create a new lesson'}</h3><label>Lesson title<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="e.g. Make your first prototype"/></label><label>Lesson order <span className="optional-label">(optional)</span><input type="number" min="1" value={form.order} onChange={event => setForm({ ...form, order: event.target.value })} placeholder="Added to the end by default"/></label><label>Lesson content<textarea required rows="8" value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} placeholder="Write the lesson content here…"/></label><button className="button button-primary button-wide">{editing ? 'Save lesson' : 'Add to curriculum'} <Plus size={16}/></button>{editing && <button className="cancel-edit" type="button" onClick={() => { setEditing(null); setForm({ title: '', content: '', order: '' }); }}>Cancel editing</button>}</form>
    </div></>;
}
