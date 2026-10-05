import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Download, LockKeyhole, Plus } from 'lucide-react';
import { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { idOf } from '../shared/courseUtils';
import { CourseDetailSkeleton } from '../components/LoadingStates';
import { ErrorState } from '../components/ErrorState';

const escapeXml = value => String(value || '').replace(/[<>&'"]/g, character => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[character]));

export function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pendingId, setPendingId] = useState(null);
  const pendingTimer = useRef(null);
  const readerRef = useRef(null);

  async function fetchCourseData() {
    const detail = await endpoints.course(id);
    let learnerProgress = null;
    if (user?.role === 'learner' && detail.isEnrolled) learnerProgress = await endpoints.progress(id);
    return { detail, learnerProgress };
  }

  useEffect(() => {
    let active = true;
    setCourse(null);
    setProgress(null);
    setError(null);
    setLoading(true);
    fetchCourseData().then(({ detail, learnerProgress }) => {
      if (!active) return;
      setCourse(detail);
      setProgress(learnerProgress);
      const sorted = [...(detail.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
      const firstIncomplete = learnerProgress?.lessons?.find(lesson => !lesson.completed);
      setSelected(firstIncomplete ? String(firstIncomplete.lessonId) : idOf(sorted[0] || {}));
    }).catch(err => { if (active) setError(err.message || 'Unable to load this course.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, user?.role, retryCount]);

  const lessons = useMemo(() => [...(course?.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0)), [course]);
  const currentIndex = Math.max(0, lessons.findIndex(lesson => String(idOf(lesson)) === String(selected)));
  const current = lessons[currentIndex];
  const progressLessons = progress?.lessons || [];
  const completedIds = new Set(progressLessons.filter(lesson => lesson.completed).map(lesson => String(lesson.lessonId)));
  const done = current && completedIds.has(String(idOf(current)));
  const own = course && (course.instructor?._id || course.instructor) === user?._id;
  const enrolled = Boolean(course?.isEnrolled || own);
  const total = Number(progress?.totalLessons ?? lessons.length);
  const completedCount = Number(progress?.completedLessons ?? completedIds.size);
  const percentage = Number(progress?.percentage ?? 0);
  const isCourseComplete = Boolean(progress?.isCourseCompleted || (total > 0 && completedCount >= total));

  async function enroll() {
    setBusy(true);
    try { await endpoints.enroll(id); toast('You are enrolled in this course.'); setRetryCount(value => value + 1); }
    catch (error) { toast(error.message, 'error'); }
    finally { setBusy(false); }
  }

  function completeCurrentLesson() {
    if (!current || done || busy || pendingId) return;
    const lessonId = String(idOf(current));
    const previous = progress;
    const nextLessons = [...progressLessons.filter(lesson => String(lesson.lessonId) !== lessonId), {
      lessonId, lessonTitle: current.title, order: current.order, completed: true,
    }];
    const nextCount = Math.min(total, Math.max(completedCount + 1, nextLessons.filter(lesson => lesson.completed).length));
    const optimistic = {
      ...progress,
      totalLessons: total,
      completedLessons: nextCount,
      percentage: total ? Math.round(nextCount / total * 100) : 0,
      isCourseCompleted: total > 0 && nextCount >= total,
      lessons: nextLessons,
    };
    setProgress(optimistic);
    setPendingId(lessonId);

    const timer = setTimeout(async () => {
      pendingTimer.current = null;
      try {
        const result = await endpoints.completeLesson(lessonId);
        setProgress(value => value ? { ...value, isCourseCompleted: Boolean(result.courseCompleted), completedLessons: Math.max(value.completedLessons || 0, nextCount), percentage: total ? Math.round(Math.max(value.completedLessons || 0, nextCount) / total * 100) : 0 } : value);
      } catch (error) {
        setProgress(previous);
        toast(error.message || 'Could not save lesson progress.', 'error');
      } finally { setPendingId(null); }
    }, 3000);
    pendingTimer.current = timer;
    toast('Lesson completed. Undo?', 'success', {
      duration: 3000,
      actionLabel: 'Undo',
      onAction: () => {
        clearTimeout(timer);
        if (pendingTimer.current === timer) pendingTimer.current = null;
        setProgress(previous);
        setPendingId(null);
      },
    });
  }

  function continueLearning() {
    const nextIncomplete = progressLessons.find(lesson => !lesson.completed);
    const lessonId = nextIncomplete?.lessonId || idOf(lessons[0] || {});
    if (lessonId) setSelected(String(lessonId));
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    readerRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function downloadCertificate() {
    const title = escapeXml(course?.title);
    const learner = escapeXml(user?.name || 'Learner');
    const date = new Date().toLocaleDateString();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 1200 840"><rect width="1200" height="840" fill="#FAF7F2"/><rect x="38" y="38" width="1124" height="764" rx="24" fill="#fff" stroke="#E7E1D6" stroke-width="3"/><path d="M80 100h1040M80 740h1040" stroke="#1F5D50" stroke-width="3"/><text x="600" y="220" text-anchor="middle" fill="#1F5D50" font-family="Georgia,serif" font-size="30" letter-spacing="6">OPENBOOK · COURSE COMPLETION</text><text x="600" y="340" text-anchor="middle" fill="#1B1A17" font-family="Georgia,serif" font-size="66">Course Complete</text><text x="600" y="430" text-anchor="middle" fill="#6B675F" font-family="Arial,sans-serif" font-size="25">This certificate is presented to</text><text x="600" y="510" text-anchor="middle" fill="#1B1A17" font-family="Georgia,serif" font-size="48">${learner}</text><text x="600" y="590" text-anchor="middle" fill="#6B675F" font-family="Arial,sans-serif" font-size="23">for completing</text><text x="600" y="650" text-anchor="middle" fill="#1F5D50" font-family="Georgia,serif" font-size="34">${title}</text><text x="600" y="710" text-anchor="middle" fill="#6B675F" font-family="Arial,sans-serif" font-size="18">${escapeXml(date)}</text></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(course?.title || 'course').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-certificate.svg`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function contentBlocks(content) {
    const pieces = (content || 'Lesson content is not available.').split(/```([\w+#-]*)\n([\s\S]*?)```/g);
    const blocks = [];
    for (let index = 0; index < pieces.length; index++) {
      if (index % 3 === 1) {
        blocks.push(<pre className="code-block" key={`code-${index}`}><span>{pieces[index] || 'CODE'}</span><code>{pieces[index + 1].trimEnd()}</code></pre>);
        index++;
      } else pieces[index].split(/\n\s*\n/).filter(Boolean).forEach((paragraph, paragraphIndex) => blocks.push(<p key={`${index}-${paragraphIndex}`}>{paragraph}</p>));
    }
    return blocks;
  }

  if (error) return <ErrorState message={error} onRetry={() => setRetryCount(value => value + 1)}/>;
  if (loading || !course) return <CourseDetailSkeleton/>;
  return <>
    <div className="detail-back"><Link to="/courses"><ArrowLeft size={15}/> Course catalog</Link>{own && <Link className="subtle-link" to={`/courses/${id}/edit`}>Manage course <ArrowRight size={15}/></Link>}</div>
    <section className="reader-header"><div><div className="eyebrow"><span className="eyebrow-line"/>{course.category || 'COURSE DETAILS'}</div><h1>{course.title}</h1><p>{course.description}</p></div></section>
    {!enrolled && <div className="enroll-prompt"><span className="callout-icon"><BookOpen size={19}/></span><div><strong>Enroll to view the lessons.</strong><small>Course content and progress are available after enrollment.</small></div><button className="button button-primary button-small" onClick={enroll} disabled={busy}>{busy ? 'Enrolling…' : 'Enroll now'} <Plus size={15}/></button></div>}
    <div className={`reader-layout${!enrolled ? ' reader-locked' : ''}`}>
      <aside className="curriculum-panel"><div className="curriculum-title"><div><span>COURSE CURRICULUM</span><strong>{lessons.length} lessons</strong></div><BookOpen size={17}/></div><nav className="curriculum-list" aria-label="Course curriculum">{lessons.map((lesson, index) => { const isDone = completedIds.has(String(idOf(lesson))); const active = String(idOf(lesson)) === String(idOf(current || {})); const duration = typeof lesson.duration === 'number' ? `${lesson.duration} min` : lesson.duration || '8 min'; return <button key={idOf(lesson)} className={`curriculum-item ${active ? 'active' : ''}`} onClick={() => setSelected(String(idOf(lesson)))} aria-current={active ? 'step' : undefined} aria-label={`${lesson.title}, ${isDone ? 'completed' : active ? 'current lesson' : 'not started'}`}><span className={`curriculum-num ${isDone ? 'is-done' : active ? 'is-current' : ''}`}>{isDone ? <Check size={14}/> : active ? '●' : '○'}</span><span className="curriculum-text"><small>LESSON {String(index + 1).padStart(2, '0')}</small><strong>{lesson.title}</strong><em>{duration}</em></span>{!enrolled && <LockKeyhole className="curriculum-lock" size={15}/>}</button>; })}</nav></aside>
      <section className="reader-panel" ref={readerRef}>
        {enrolled && <div className="reader-summary"><div className="reader-summary-head"><div><span>COURSE PROGRESS</span><strong>{completedCount} of {total} lessons</strong></div><b>{percentage}%</b></div><div className="course-progress enrolled" role="progressbar" aria-label="Course completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage}><i style={{width:`${percentage}%`}}/></div><button className="button button-primary button-small" onClick={continueLearning}>Continue where you left off <ArrowRight size={15}/></button></div>}
        {!enrolled ? <div className="reader-locked-message"><LockKeyhole size={23}/><h2>Lesson content is locked.</h2><p>Enroll in this course to access the reader and record lesson progress.</p></div> : <>
          {isCourseComplete && !pendingId && user?.role === 'learner' && <div className="certificate-card"><div className="certificate-mark"><CheckCircle2 size={25}/></div><div className="certificate-copy"><span>OPENBOOK · COURSE COMPLETION</span><strong>Course Complete</strong><small>{course.title} · {new Date().toLocaleDateString()}</small></div><button type="button" className="button button-quiet button-small" onClick={downloadCertificate}><Download size={15}/> Download SVG</button></div>}
          {current ? <><article className="reader-content"><div className="reader-kicker">LESSON {String(currentIndex + 1).padStart(2, '0')} <span>·</span> {Math.max(3, Math.ceil((current.content || '').split(/\s+/).length / 220))} MIN READ</div><h2>{current.title}</h2><div className="reader-prose">{contentBlocks(current.content)}</div></article><div className="reader-actionbar"><div className="lesson-step-actions"><button className="button button-quiet button-small" disabled={currentIndex === 0} onClick={() => setSelected(String(idOf(lessons[currentIndex - 1])))}><ArrowLeft size={14}/> Previous</button><button className="button button-quiet button-small" disabled={currentIndex >= lessons.length - 1} onClick={() => setSelected(String(idOf(lessons[currentIndex + 1])))}>Next <ArrowRight size={14}/></button></div>{user?.role === 'learner' && course.isEnrolled && (done ? <button className="button button-complete" disabled><Check size={16}/> Lesson complete</button> : <button className="button button-primary" disabled={busy || Boolean(pendingId)} onClick={completeCurrentLesson}>{pendingId ? 'Undo available for 3 seconds' : 'Mark lesson complete'} <CheckCircle2 size={16}/></button>)}</div></> : <div className="empty-state"><BookOpen size={27}/><h3>Lessons coming soon.</h3></div>}
        </>}
      </section>
    </div>
  </>;
}
