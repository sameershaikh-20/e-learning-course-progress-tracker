import { useEffect, useState } from 'react';

const lines = count => Array.from({ length: count }, (_, index) => <i className="skeleton-surface" key={index}/>);

export function CourseCardSkeleton() {
  return <article className="course-card course-card-skeleton" aria-hidden="true"><div className="skeleton-heading skeleton-surface"/><div className="skeleton-meta-row">{lines(2)}</div><i className="skeleton-progress skeleton-surface"/><i className="skeleton-title-line skeleton-surface"/><div className="skeleton-description">{lines(2)}</div><div className="skeleton-footer"><i className="skeleton-avatar skeleton-surface"/><i className="skeleton-footer-line skeleton-surface"/><i className="skeleton-footer-button skeleton-surface"/></div></article>;
}

export function CourseSkeletons({ count = 3 }) {
  return <div className="course-grid skeleton-grid" role="status" aria-label="Loading courses">{Array.from({ length: count }, (_, index) => <CourseCardSkeleton key={index}/>)}</div>;
}

export function CourseDetailSkeleton() {
  return <div className="course-detail-skeleton" role="status" aria-label="Loading course details"><aside className="detail-skeleton-curriculum"><i className="skeleton-surface skeleton-section-title"/>{Array.from({ length: 5 }, (_, index) => <div className="detail-skeleton-lesson" key={index}><i className="skeleton-surface"/><span><i className="skeleton-surface"/><i className="skeleton-surface"/></span></div>)}</aside><section className="detail-skeleton-reader"><div className="detail-skeleton-summary"><i className="skeleton-surface"/><i className="skeleton-surface"/><i className="skeleton-surface"/></div><div className="detail-skeleton-content"><i className="skeleton-surface skeleton-title-line"/><i className="skeleton-surface"/>{lines(3)}</div></section></div>;
}

export function TableRowSkeleton({ rows = 3, columns = 4 }) {
  return <div className="table-row-skeletons" role="status" aria-label="Loading table data">{Array.from({ length: rows }, (_, row) => <div className="table-row-skeleton" style={{ '--skeleton-columns': columns }} key={row}>{Array.from({ length: columns }, (_, column) => <i className="skeleton-surface" key={column}/>)}</div>)}</div>;
}

export function ProgressRowSkeleton({ rows = 3 }) {
  return <div className="progress-row-skeletons" role="status" aria-label="Loading course progress">{Array.from({ length: rows }, (_, index) => <div className="progress-row-skeleton" key={index}><i className="skeleton-surface"/><span><i className="skeleton-surface"/><i className="skeleton-surface"/><i className="skeleton-surface"/></span></div>)}</div>;
}

export function PageSkeleton({ layout = 'grid' }) {
  return <div className="page-skeleton" role="status" aria-label="Loading page"><header><i className="skeleton-surface"/><i className="skeleton-surface"/><i className="skeleton-surface"/></header>{layout === 'table' ? <TableRowSkeleton/> : layout === 'list' ? <ProgressRowSkeleton/> : <CourseSkeletons/>}</div>;
}

export function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = now => { const t = Math.min(1, (now - start) / 650); setCount(Math.round(value * (1 - Math.pow(1 - t, 3)))); if (t < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return count;
}
