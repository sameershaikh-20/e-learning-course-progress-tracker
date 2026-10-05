import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function NotFound(){return <div className="empty-state"><span className="not-found">404</span><h3>Page not found.</h3><p>Return to your OpenBook workspace.</p><Link className="button button-primary" to="/dashboard">Back to overview <ArrowRight size={16}/></Link></div>}
