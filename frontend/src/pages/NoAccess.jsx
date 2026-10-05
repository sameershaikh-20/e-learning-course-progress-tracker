import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert } from 'lucide-react';

export function NoAccess() {
  return (
    <main className="no-access-page">
      <div className="no-access-card">
        <span className="no-access-icon"><ShieldAlert size={22} /></span>
        <p className="eyebrow"><span className="eyebrow-line" />ACCESS RESTRICTED</p>
        <h1>This page isn’t<br />part of your course.</h1>
        <p>Your account doesn’t have permission to view this page. Head back to your OpenBook workspace.</p>
        <Link className="button button-primary" to="/dashboard">Back to workspace <ArrowRight size={15} /></Link>
      </div>
    </main>
  );
}
