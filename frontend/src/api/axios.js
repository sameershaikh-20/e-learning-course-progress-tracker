import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('elearning_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    if (error.response?.data?.message) error.message = error.response.data.message;
    if (typeof window !== 'undefined' && status === 401) {
      const returnUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}${window.location.hash}`);
      window.location.assign(`/login?returnUrl=${returnUrl}`);
    } else if (typeof window !== 'undefined' && status === 403) {
      window.location.assign('/no-access');
    }
    return Promise.reject(error);
  },
);

async function request(promise) {
  const response = await promise;
  return response.data?.data ?? response.data;
}

export const login = body => request(api.post('/auth/login', body));
export const register = body => request(api.post('/auth/register', body));
export const courses = () => request(api.get('/courses'));
export const course = id => request(api.get(`/courses/${id}`));
export const enroll = id => request(api.post(`/courses/${id}/enroll`));
export const progress = id => request(api.get(`/courses/${id}/progress`));
export const completionRate = id => request(api.get(`/courses/${id}/completion-rate`));
export const completeLesson = id => request(api.post(`/lessons/${id}/complete`));
export const createCourse = body => request(api.post('/courses', body));
export const updateCourse = (id, body) => request(api.put(`/courses/${id}`, body));
export const deleteCourse = id => request(api.delete(`/courses/${id}`));
export const createLesson = (courseId, body) => request(api.post(`/courses/${courseId}/lessons`, body));
export const updateLesson = (courseId, lessonId, body) => request(api.put(`/courses/${courseId}/lessons/${lessonId}`, body));
export const deleteLesson = (courseId, lessonId) => request(api.delete(`/courses/${courseId}/lessons/${lessonId}`));

export const endpoints = {
  login, register, courses, course, enroll, progress, completionRate, completeLesson,
  createCourse, updateCourse, deleteCourse, createLesson, updateLesson, deleteLesson,
};
