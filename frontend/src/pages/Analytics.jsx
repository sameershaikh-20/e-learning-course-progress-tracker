import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, Users } from 'lucide-react';
import { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { idOf } from '../shared/courseUtils';
import { useCourses } from '../hooks/useCourses';
import { TableRowSkeleton } from '../components/LoadingStates';
import { ErrorState } from '../components/ErrorState';

export function Analytics() {
  const { courses, loading, error: coursesError, refresh } = useCourses();
  const { user } = useAuth();
  const mine = courses.filter(course => (course.instructor?._id || course.instructor) === user?._id);
  const [data, setData] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadingStats(true);
    setError(null);
    Promise.all(mine.map(course => endpoints.completionRate(idOf(course)).then(value => [idOf(course), value])))
      .then(entries => { if (active) setData(Object.fromEntries(entries)); })
      .catch(err => { if (active) setError(err.message || 'Unable to load course analytics.'); })
      .finally(() => { if (active) setLoadingStats(false); });
    return () => { active = false; };
  }, [courses, user?._id, retryCount]);

  const rows = mine.map(course => ({ course, stats: data[idOf(course)] || {} }));
  const total = rows.reduce((sum, row) => sum + Number(row.stats.totalEnrolled || 0), 0);
  const completed = rows.reduce((sum, row) => sum + Number(row.stats.totalCompleted || 0), 0);
  const rate = total ? Math.round(rows.reduce((sum, row) => sum + Number(row.stats.completionRate || 0) * Number(row.stats.totalEnrolled || 0), 0) / total) : 0;

  if (coursesError) return <ErrorState message={coursesError} onRetry={refresh}/>;
  if (error) return <ErrorState message={error} onRetry={() => setRetryCount(value => value + 1)}/>;

  return <>
    <div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/>COURSE ANALYTICS</div><h1>Completion analytics.</h1><p>Enrollment and course completion across your courses.</p></div></div>
    <section className="analytics-summary"><div className="analytics-card"><span>TOTAL LEARNERS</span><Users size={18}/><strong>{total}</strong><small>Enrolled across your courses</small></div><div className="analytics-card"><span>COMPLETED</span><CheckCircle2 size={18}/><strong>{completed}</strong><small>Completed course enrollments</small></div><div className="analytics-card"><span>AVG COMPLETION</span><BarChart3 size={18}/><strong>{rate}%</strong><small>Weighted by enrollment</small></div></section>
    {loading || loadingStats ? <TableRowSkeleton rows={4} columns={4}/> : mine.length === 0 ? <div className="empty-state"><BarChart3 size={27}/><h3>No data yet.</h3><p>Create a course to see learner completion data.</p><Link to="/courses/new" className="button button-primary">Create a course <ArrowRight size={15}/></Link></div> : <div className="analytics-table-shell"><table className="analytics-table"><thead><tr><th scope="col">Course</th><th scope="col">Enrolled</th><th scope="col">Completed</th><th scope="col">Completion rate</th></tr></thead><tbody>{rows.map(({course, stats}) => { const percent = Number(stats.completionRate || 0); return <tr key={idOf(course)}><td data-label="Course"><Link to={`/courses/${idOf(course)}`} className="catalog-course-title"><BookOpen size={16}/>{course.title}</Link></td><td data-label="Enrolled">{stats.totalEnrolled ?? '—'}</td><td data-label="Completed">{stats.totalCompleted ?? '—'}</td><td data-label="Completion rate"><div className="analytics-table-progress"><div className="table-progress" role="progressbar" aria-label={`${course.title} completion rate`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}><i style={{width:`${percent}%`}}/></div><span>{stats.completionRate ?? 0}%</span></div></td></tr>; })}</tbody></table></div>}
  </>;
}
