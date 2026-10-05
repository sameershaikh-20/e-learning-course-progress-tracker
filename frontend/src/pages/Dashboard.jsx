import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Compass, Plus, Search } from 'lucide-react';
import { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { categories, idOf } from '../shared/courseUtils';
import { useCourses } from '../hooks/useCourses';
import { CourseCard } from '../components/CourseCard';
import { CourseSkeletons, ProgressRowSkeleton, TableRowSkeleton } from '../components/LoadingStates';
import { ErrorState } from '../components/ErrorState';

export function Dashboard() {
  const { user } = useAuth();
  const { courses, loading, error, refresh } = useCourses();
  const learner = user?.role === 'learner';
  const mine = courses.filter(course => learner ? course.isEnrolled : (course.instructor?._id || course.instructor) === user?._id);
  const [completion, setCompletion] = useState(null);
  const [completionError, setCompletionError] = useState(null);
  const [completionRetry, setCompletionRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setCompletionError(null);
    Promise.all(mine.map(course => learner ? endpoints.progress(idOf(course)) : endpoints.completionRate(idOf(course)))).then(rows => {
      if (!active) return;
      const value = rows.reduce((sum, row) => sum + Number(learner ? row.percentage || 0 : row.completionRate || 0), 0);
      setCompletion(rows.length ? Math.round(value / rows.length) : 0);
    }).catch(error => { if (active) setCompletionError(error.message || 'Unable to load course completion.'); });
    return () => { active = false; };
  }, [courses, learner, user?._id, completionRetry]);

  if (error) return <ErrorState message={error} onRetry={refresh}/>;
  if (completionError) return <ErrorState message={completionError} onRetry={() => setCompletionRetry(value => value + 1)}/>;

  return <>
    <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/>{learner ? 'LEARNER OVERVIEW' : 'INSTRUCTOR OVERVIEW'}</div><h1>{learner ? <>Track your learning<br/><span>progress across courses.</span></> : <>Manage and analyze<br/><span>your courses.</span></>}</h1><p>{learner ? 'Review your enrollments and completed lessons.' : 'Review your courses and learner completion rates.'}</p></div></section>
    <section className="metric-grid dashboard-metrics"><div className="metric-card metric-main"><div className="metric-head"><span>{learner ? 'ACTIVE COURSES' : 'YOUR COURSES'}</span><span className="metric-icon"><BookOpen size={17}/></span></div><div className="metric-number">{loading ? '—' : mine.length}<span>{learner ? 'enrolled courses' : 'courses published'}</span></div><div className="metric-bottom"><small>{learner ? 'Enrolled courses update automatically.' : 'Courses you have created'}</small><ArrowUpRight size={16}/></div></div><div className="metric-card metric-completion"><div className="metric-head"><span>AVERAGE COMPLETION</span><span className="metric-icon">{learner ? <Activity size={17}/> : <BarChart3 size={17}/>}</span></div><div className="metric-number">{completion === null ? '—' : `${completion}%`}<span>across your courses</span></div><div className="completion-track"><span style={{width:`${completion || 0}%`}}/></div><div className="metric-footline"><span>{mine.length ? 'Based on current progress' : 'No course data yet'}</span><span className="metric-live"><i/> LIVE</span></div></div></section>
    <section className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{learner ? 'ENROLLED COURSES' : 'YOUR COURSE LIBRARY'}</div><h2>{learner ? 'Your enrolled courses.' : 'Courses you’ve created.'}</h2></div><Link className="subtle-link" to="/courses">Browse all <ArrowRight size={15}/></Link></section>
    {loading ? <CourseSkeletons/> : mine.length ? <div className="course-grid">{mine.slice(0,3).map(course=><CourseCard key={idOf(course)} course={course}/>)}</div> : <div className="empty-state"><BookOpen size={27}/><h3>No courses yet.</h3><p>{learner ? 'Browse the course catalog and enroll in a course.' : 'Create a course to publish lessons and track learner completion.'}</p><Link className="button button-primary" to={learner ? '/courses' : '/courses/new'}>{learner ? 'Explore courses' : 'Create your first course'} <ArrowRight size={15}/></Link></div>}
    {!learner && mine.length > 0 && <div className="instructor-callout"><span className="callout-icon"><Plus size={20}/></span><div><strong>Create a new course.</strong><small>Build courses that learners complete.</small></div><Link to="/courses/new" className="button button-primary button-small">Create a course <ArrowRight size={15}/></Link></div>}
  </>;
}

export function Catalog() {
  const { user } = useAuth();
  const { courses, loading, error, refresh } = useCourses();
  const instructor = user?.role === 'instructor';
  const mine = useMemo(() => courses.filter(course => (course.instructor?._id || course.instructor) === user?._id), [courses, user?._id]);
  const [filter, setFilter] = useState('All courses');
  const [query, setQuery] = useState('');
  const [analytics, setAnalytics] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(instructor);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [analyticsRetry, setAnalyticsRetry] = useState(0);
  const source = instructor ? mine : courses;
  const shown = source.filter(course => (!query || course.title?.toLowerCase().includes(query.toLowerCase())) && (filter === 'All courses' || course.category?.toLowerCase() === filter.toLowerCase()));

  useEffect(() => {
    if (!instructor) return undefined;
    let active = true;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    Promise.all(mine.map(course => endpoints.completionRate(idOf(course)).then(value => [idOf(course), value])))
      .then(entries => { if (active) setAnalytics(Object.fromEntries(entries)); })
      .catch(err => { if (active) setAnalyticsError(err.message || 'Unable to load course analytics.'); })
      .finally(() => { if (active) setAnalyticsLoading(false); });
    return () => { active = false; };
  }, [instructor, mine, analyticsRetry]);

  const clearFilters = () => { setQuery(''); setFilter('All courses'); };
  if (error) return <ErrorState message={error} onRetry={refresh}/>;
  if (instructor && analyticsError) return <ErrorState message={analyticsError} onRetry={() => setAnalyticsRetry(value => value + 1)}/>;
  return <>
    <div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/>{instructor ? 'COURSE MANAGEMENT' : 'THE COURSE LIBRARY'}</div><h1>{instructor ? 'Your courses.' : 'Course catalog.'}</h1><p>{instructor ? 'Review enrollment and completion for each course.' : 'Browse courses by category or search by title.'}</p></div>{instructor ? <Link className="button button-primary" to="/courses/new"><Plus size={16}/> Create course</Link> : <label className="search-box"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a course" aria-label="Search courses"/></label>}</div>
    {!instructor && <><div className="filter-row" role="group" aria-label="Filter courses by category">{categories.map(item=><button key={item} type="button" className={filter === item ? 'active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div></>}
    {loading ? instructor ? <TableRowSkeleton rows={4} columns={5}/> : <CourseSkeletons/> : instructor && analyticsLoading ? <TableRowSkeleton rows={4} columns={5}/> : !shown.length ? <div className="empty-state"><span className="empty-icon"><Compass size={24}/></span><h3>{instructor ? 'No courses yet.' : 'No courses match your search.'}</h3><p>{instructor ? 'Add lessons and review learner progress from your course library.' : 'Try another title or category.'}</p>{instructor ? <Link to="/courses/new" className="button button-primary"><Plus size={15}/> Create your first course</Link> : <button className="button button-primary" onClick={clearFilters}>Clear filters</button>}</div> : instructor ? <div className="catalog-table-shell"><table className="catalog-table"><thead><tr><th scope="col">Course</th><th scope="col">Enrolled</th><th scope="col">Avg Completion</th><th scope="col">Progress</th><th scope="col">Actions</th></tr></thead><tbody>{shown.map(course => { const values = analytics[idOf(course)] || {}; const rate = Number(values.completionRate || 0); return <tr key={idOf(course)}><td data-label="Course"><Link className="catalog-course-title" to={`/courses/${idOf(course)}`}>{course.title}</Link><small>{course.lessons?.length || 0} lessons</small></td><td data-label="Enrolled">{values.totalEnrolled ?? '—'}</td><td data-label="Avg Completion">{values.completionRate == null ? '—' : `${rate}%`}</td><td data-label="Progress"><div className="table-progress" role="progressbar" aria-label={`${course.title} average completion`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={rate}><i style={{width:`${rate}%`}}/></div></td><td data-label="Actions"><Link className="table-action" aria-label={`View analytics for ${course.title}`} to="/analytics">View analytics <ArrowRight size={14}/></Link></td></tr>; })}</tbody></table></div> : <div className="course-grid">{shown.map(course => <CourseCard key={idOf(course)} course={course} onChange={refresh}/>)}</div>}
  </>;
}

export function Learning() {
  const { courses, loading, error, refresh } = useCourses();
  const { user } = useAuth();
  const enrolled = courses.filter(course => course.isEnrolled && user?.role === 'learner');
  const [progress, setProgress] = useState({});
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState(null);
  const [progressRetry, setProgressRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setProgressLoading(true);
    setProgressError(null);
    Promise.all(enrolled.map(course => endpoints.progress(idOf(course)).then(value => [idOf(course), value])))
      .then(entries => { if (active) setProgress(Object.fromEntries(entries)); })
      .catch(err => { if (active) setProgressError(err.message || 'Unable to load course progress.'); })
      .finally(() => { if (active) setProgressLoading(false); });
    return () => { active = false; };
  }, [courses, user?.role, progressRetry]);

  if (error) return <ErrorState message={error} onRetry={refresh}/>;
  if (progressError) return <ErrorState message={progressError} onRetry={() => setProgressRetry(value => value + 1)}/>;
  return <><div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/>MY PROGRESS</div><h1>Course progress.</h1><p>Completion and lesson counts for your enrolled courses.</p></div><span className="page-count"><BookOpen size={16}/>{enrolled.length} courses</span></div>
    {loading || progressLoading ? <ProgressRowSkeleton/> : enrolled.length ? <div className="learning-list">{enrolled.map(course => { const value = progress[idOf(course)] || {}; const percent = Number(value.percentage || 0); const completed = Boolean(value.isCourseCompleted); return <Link to={`/courses/${idOf(course)}`} className="learning-item" key={idOf(course)}><div className="learning-thumb"><span>{(course.title || 'C')[0]}</span></div><div className="learning-info"><h3>{course.title}</h3><p>{course.instructor?.name || 'OpenBook instructor'}</p><div className="learning-progress-row"><div className="course-progress enrolled" role="progressbar" aria-label={`${course.title} completion`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent}><i style={{width:`${percent}%`}}/></div><small>{value.completedLessons || 0} of {value.totalLessons ?? course.lessons?.length ?? 0} lessons</small></div></div><span className={`learning-status ${completed ? 'completed' : ''}`}>{completed ? 'Completed' : 'In progress'}</span></Link>; })}</div> : <div className="empty-state"><BookOpen size={27}/><h3>No courses yet.</h3><p>Enroll in a course to see your progress here.</p><Link to="/courses" className="button button-primary">Explore courses <ArrowRight size={16}/></Link></div>}
  </>;
}
