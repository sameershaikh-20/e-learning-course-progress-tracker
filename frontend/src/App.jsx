import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { Shell } from './components/Shell';
import { Landing } from './pages/Landing';
import { AuthPage } from './pages/AuthPage';
import { Dashboard, Catalog, Learning } from './pages/Dashboard';
import { CourseDetail } from './pages/CourseDetail';
import { CourseEditor, CourseForm } from './pages/CourseManagement';
import { Analytics } from './pages/Analytics';
import { NotFound } from './pages/NotFound';
import { NoAccess } from './pages/NoAccess';

function App(){return <Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage register/>}/><Route path="/no-access" element={<NoAccess/>}/><Route element={<ProtectedRoute/>}><Route element={<Shell/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/courses" element={<Catalog/>}/><Route path="/courses/new" element={<ProtectedRoute role="instructor"/>}><Route index element={<CourseForm/>}/></Route><Route path="/courses/:id" element={<CourseDetail/>}/><Route path="/courses/:id/edit" element={<ProtectedRoute role="instructor"/>}><Route index element={<CourseEditor/>}/></Route><Route path="/courses/:id/edit/details" element={<ProtectedRoute role="instructor"/>}><Route index element={<CourseForm edit/>}/></Route><Route path="/learning" element={<ProtectedRoute role="learner"/>}><Route index element={<Learning/>}/></Route><Route path="/analytics" element={<ProtectedRoute role="instructor"/>}><Route index element={<Analytics/>}/></Route></Route></Route><Route path="*" element={<NotFound/>}/></Routes>}
export default App;
