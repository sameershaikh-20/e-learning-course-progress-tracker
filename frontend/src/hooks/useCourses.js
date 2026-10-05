import { useCallback, useEffect, useState } from 'react';
import { endpoints } from '../services/api';

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => { setLoading(true); setError(null); setReload(value => value + 1); }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    endpoints.courses()
      .then(data => { if (active) setCourses(Array.isArray(data) ? data : data.courses || []); })
      .catch(err => { if (active) setError(err.message || 'Unable to load courses.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  return { courses, loading, error, refresh };
}
