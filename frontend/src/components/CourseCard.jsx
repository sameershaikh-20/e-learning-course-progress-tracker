import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock3, Plus } from 'lucide-react';
import { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { idOf } from '../shared/courseUtils';

export function CourseCard({ course, onChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progressError, setProgressError] = useState(null);
  const [progressRetry, setProgressRetry] = useState(0);
  const enrolled = course.isEnrolled && user?.role === 'learner';
  const own = (course.instructor?._id || course.instructor) === user?._id;
  const lessonCount = course.lessons?.length ?? course.totalLessons ?? 0;

  useEffect(() => {
    let active = true;
    if (enrolled) {
      setProgressError(null);
      endpoints.progress(idOf(course)).then(value => { if (active) setProgress(value); }).catch(error => { if (active) setProgressError(error.message || 'Unable to load progress.'); });
    } else { setProgress(null); setProgressError(null); }
    return () => { active = false; };
  }, [course, enrolled, progressRetry]);

  async function enroll() {
    setBusy(true);
    try {
      await endpoints.enroll(idOf(course));
      toast('You are enrolled in this course.');
      onChange?.();
      navigate(`/courses/${idOf(course)}`);
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  }

  return <article className="course-card">
    <div className="course-card-body">
      <div className="course-card-title-row"><h3>{course.title}</h3><span className="course-category">{course.category || 'Course'}</span></div>
      <p className="course-instructor">{course.instructor?.name || 'OpenBook instructor'}</p>
      <div className="course-meta"><span><BookOpen size={14}/>{lessonCount} lessons</span><span><Clock3 size={14}/>{course.duration || 'Self-paced'}</span></div>
      {progressError ? <div className="course-card-inline-error" role="alert"><span>{progressError}</span><button type="button" onClick={() => setProgressRetry(value => value + 1)}>Retry</button></div> : <div className={`course-progress ${enrolled ? 'enrolled' : ''}`} role="progressbar" aria-label={`${course.title} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={enrolled ? progress?.percentage || 0 : 0}><i style={{ width: `${enrolled ? progress?.percentage || 0 : 0}%` }}/></div>}
      <div className="course-card-foot">
        {enrolled || own || user?.role === 'instructor' ? <Link className={`button ${enrolled ? 'button-primary' : 'button-quiet'} course-card-cta`} to={own ? `/courses/${idOf(course)}/edit` : `/courses/${idOf(course)}`} aria-label={own ? `Manage ${course.title}` : enrolled ? `Continue ${course.title}` : `View ${course.title}`}>
          {own ? 'Manage course' : enrolled ? 'Continue learning' : 'View course'} <ArrowRight size={15}/>
        </Link> : <button className="button button-primary course-card-cta" aria-label={`Enroll in ${course.title}`} disabled={busy} onClick={enroll}>{busy ? 'Enrolling…' : 'Enroll now'} <Plus size={15}/></button>}
        {!enrolled && <span className="course-progress-label">Not enrolled</span>}
        {enrolled && <span className="course-progress-label">{progressError ? 'Progress unavailable' : progress?.isCourseCompleted ? 'Completed' : `${progress?.percentage ?? 0}% complete`}</span>}
      </div>
    </div>
  </article>;
}
