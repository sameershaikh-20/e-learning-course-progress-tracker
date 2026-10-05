import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Logo } from '../components/Logo';

export function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <Link to="/" aria-label="OpenBook home"><Logo /></Link>
        <nav className="landing-links" aria-label="Main navigation">
          <a href="#method">Overview</a>
          <Link to="/login">Courses</Link>
        </nav>
        <div className="landing-actions">
          <Link className="text-link" to="/login">Log in</Link>
          <Link className="button button-primary button-small" to="/register">Create account <ArrowRight size={14}/></Link>
        </div>
      </header>
      <main>
        <section className="hero" id="method">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line"/>OPENBOOK COURSE TRACKER</div>
            <h1>Courses and progress,<br/><span className="italic-accent">in one place.</span></h1>
            <p className="hero-description">Browse course lessons, track completion, and review course analytics from one workspace.</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/register">Create account <ArrowRight size={15}/></Link>
              <Link className="button button-quiet" to="/login">Log in</Link>
            </div>
          </div>
          <aside className="landing-feature" aria-label="OpenBook learning workspace">
            <div className="landing-feature-art">
              <div className="landing-art-label"><span>OPENBOOK / FIELD NOTES</span><span>01 — 03</span></div>
              <svg className="landing-book-art" viewBox="0 0 480 310" role="img" aria-labelledby="landing-book-title">
                <title id="landing-book-title">An open book with course notes</title>
                <path d="M73 83c46-14 94-4 167 24v142c-65-27-119-34-167-20V83Z" fill="#1F5D50"/>
                <path d="M407 83c-46-14-94-4-167 24v142c65-27 119-34 167-20V83Z" fill="#1F5D50"/>
                <path d="M240 109c-62-35-111-43-154-31v132c49-11 99-1 154 30V109Z" fill="#FFFFFF" stroke="#D7D0C5" strokeWidth="2"/>
                <path d="M240 109c62-35 111-43 154-31v132c-49-11-99-1-154 30V109Z" fill="#FFFFFF" stroke="#D7D0C5" strokeWidth="2"/>
                <path d="M240 110v130" fill="none" stroke="#C2623F" strokeWidth="3"/>
                <path d="M111 121c25-3 54 2 88 16M111 145c25-3 54 2 88 16M111 169c25-3 54 2 88 16M281 137c34-14 63-19 88-16M281 161c34-14 63-19 88-16M281 185c34-14 63-19 88-16" fill="none" stroke="#D7D0C5" strokeWidth="4" strokeLinecap="round"/>
                <path d="M324 75V38l20 12 20-12v45" fill="#C2623F"/>
                <circle cx="93" cy="62" r="5" fill="#C2623F"/>
                <path d="M105 62h72" stroke="#D7D0C5" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className="landing-art-caption"><BookOpen size={17}/><span>Make room for what’s next.</span></div>
            </div>
            <div className="landing-index">
              <div className="landing-index-heading"><span>EXPLORE THE LIBRARY</span></div>
              <ul><li>Development</li><li>Backend</li><li>Full Stack</li></ul>
              <p>Lessons, course progress, and instructor analytics in one workspace.</p>
            </div>
          </aside>
        </section>
      </main>
      <footer className="landing-strip"><span>LEARNER WORKSPACE</span><span>COURSE MANAGEMENT</span><span>PROGRESS TRACKING</span></footer>
    </div>
  );
}
