import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, ChevronDown, CirclePlay, Compass, LayoutDashboard, LogOut, Menu, Settings2, User, X } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { initials } from '../shared/courseUtils';

const PREFERENCES_KEY = 'openbook-ui-preferences';
const DEFAULT_PREFERENCES = { reduceMotion: false, compactLayout: false };

function readPreferences() {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(stored);
    return {
      reduceMotion: typeof parsed?.reduceMotion === 'boolean' ? parsed.reduceMotion : false,
      compactLayout: typeof parsed?.compactLayout === 'boolean' ? parsed.compactLayout : false,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function Shell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [infoPanel, setInfoPanel] = useState(null);
  const [preferences, setPreferences] = useState(readPreferences);
  const touchStartY = useRef(null);
  const profileTriggerRef = useRef(null);
  const panelCloseRef = useRef(null);
  const infoPanelRef = useRef(null);
  const infoTriggerRef = useRef(null);
  const profileMenuRef = useRef(null);
  const instructor = user?.role === 'instructor';

  useEffect(() => {
    if (!drawerOpen && !profileOpen && !infoPanel) return undefined;
    const closeOnEscape = event => {
      if (event.key !== 'Escape') return;
      if (infoPanel) {
        setInfoPanel(null);
        window.requestAnimationFrame(() => infoTriggerRef.current?.focus());
      } else if (profileOpen) {
        setProfileOpen(false);
        profileTriggerRef.current?.focus();
      } else setDrawerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen, profileOpen, infoPanel]);

  useEffect(() => {
    if (infoPanel) panelCloseRef.current?.focus();
  }, [infoPanel]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {
      // Preferences still apply for this session if browser storage is unavailable.
    }
  }, [preferences]);

  useEffect(() => {
    if (!infoPanel) return undefined;
    const keepFocusInPanel = event => {
      if (event.key !== 'Tab') return;
      const focusable = [...(infoPanelRef.current?.querySelectorAll('button:not(:disabled), a[href]') || [])];
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', keepFocusInPanel);
    return () => document.removeEventListener('keydown', keepFocusInPanel);
  }, [infoPanel]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const closeOnOutsideClick = event => {
      if (!profileMenuRef.current?.contains(event.target) && !profileTriggerRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [profileOpen]);

  const closeDrawer = () => setDrawerOpen(false);
  const logout = () => { closeDrawer(); setProfileOpen(false); signOut(); navigate('/'); };
  const showInfo = (kind, event) => {
    infoTriggerRef.current = event.currentTarget;
    closeDrawer();
    setProfileOpen(false);
    setInfoPanel(kind);
  };
  const closeInfo = () => {
    setInfoPanel(null);
    window.requestAnimationFrame(() => infoTriggerRef.current?.focus());
  };
  const updatePreference = (name, value) => setPreferences(current => ({ ...current, [name]: value }));
  const resetPreferences = () => setPreferences(DEFAULT_PREFERENCES);
  const mobileNavClass = ({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`;

  return <div className={`app-shell${preferences.compactLayout ? ' compact-layout' : ''}${preferences.reduceMotion ? ' user-reduced-motion' : ''}`}>
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <Link to="/dashboard" aria-label="OpenBook home"><Logo/></Link>
      <div className="side-label">WORKSPACE</div>
      <nav className="side-nav">
        <Link to="/dashboard"><LayoutDashboard size={18}/>Overview</Link>
        <Link to="/courses"><Compass size={18}/>{instructor ? 'My courses' : 'Explore courses'}</Link>
        {!instructor && <Link to="/learning"><BookOpen size={18}/>My learning</Link>}
        {instructor && <Link to="/analytics"><BarChart3 size={18}/>Analytics</Link>}
      </nav>
      <div className="side-label side-label-spaced">YOUR SPACE</div>
      <nav className="side-nav"><button type="button" onClick={event => showInfo('settings', event)}><Settings2 size={18}/>Settings</button><button type="button" onClick={event => showInfo('help', event)}><CirclePlay size={18}/>Help center</button></nav>
      <div className="sidebar-bottom"><button className="profile-row" onClick={logout}><span className="avatar">{initials(user?.name)}</span><span className="profile-copy"><strong>{user?.name}</strong><small>{user?.role}</small></span><LogOut size={16}/></button></div>
    </aside>

    <div className="main-column">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation"><Menu size={20}/></button>
        <div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
        <div className="topbar-right"><span className="live-dot"/>Learning mode <span className="topbar-divider"/><div className="profile-control"><button ref={profileTriggerRef} type="button" className="profile-trigger" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(value => !value)}><span className="avatar avatar-small">{initials(user?.name)}</span><ChevronDown size={16}/></button>{profileOpen && <div ref={profileMenuRef} className="profile-menu" role="menu" aria-label="Profile menu"><div className="profile-menu-user"><strong>{user?.name}</strong><span>{user?.role}</span></div><button type="button" role="menuitem" onClick={logout}><LogOut size={16}/>Log out</button></div>}</div></div>
      </header>
      <main className="page-content" onClick={() => menuOpen && setMenuOpen(false)}><Outlet/></main>
    </div>

    <nav className="mobile-bottom-bar" aria-label="Mobile navigation">
      <NavLink to="/courses" className={mobileNavClass} aria-label="Course catalog"><Compass/><span>Catalog</span></NavLink>
      {instructor ? <NavLink to="/analytics" className={mobileNavClass} aria-label="Analytics"><BarChart3/><span>Analytics</span></NavLink> : <NavLink to="/learning" className={mobileNavClass} aria-label="My progress"><BookOpen/><span>My Progress</span></NavLink>}
      <button type="button" className="mobile-nav-item" aria-label="Settings" onClick={event => showInfo('settings', event)}><Settings2/><span>Settings</span></button>
      <button type="button" className={`mobile-nav-item${drawerOpen ? ' active' : ''}`} onClick={() => setDrawerOpen(true)} aria-label="Open profile menu" aria-expanded={drawerOpen}><User/><span>Profile</span></button>
    </nav>

    {drawerOpen && <button type="button" className="mobile-drawer-overlay" aria-label="Close profile menu" onClick={closeDrawer}/>}
    <section className={`mobile-profile-drawer${drawerOpen ? ' open' : ''}`} aria-label="Profile menu" aria-hidden={!drawerOpen} onTouchStart={event => { touchStartY.current = event.touches[0].clientY; }} onTouchEnd={event => { if (touchStartY.current !== null && event.changedTouches[0].clientY - touchStartY.current > 70) closeDrawer(); touchStartY.current = null; }}>
      <div className="mobile-drawer-handle" aria-hidden="true"/>
      <div className="mobile-drawer-profile"><span className="avatar">{initials(user?.name)}</span><span className="profile-copy"><strong>{user?.name}</strong><small>{user?.role}</small></span></div>
      <div className="side-label">WORKSPACE</div>
      <nav className="mobile-drawer-links" aria-label="Workspace">
        <NavLink to="/dashboard" onClick={closeDrawer}><LayoutDashboard size={18}/>Overview</NavLink>
        <NavLink to="/courses" onClick={closeDrawer}><Compass size={18}/>{instructor ? 'My courses' : 'Explore courses'}</NavLink>
        {!instructor && <NavLink to="/learning" onClick={closeDrawer}><BookOpen size={18}/>My learning</NavLink>}
        {instructor && <NavLink to="/analytics" onClick={closeDrawer}><BarChart3 size={18}/>Analytics</NavLink>}
      </nav>
      <div className="side-label side-label-spaced">YOUR SPACE</div>
      <nav className="mobile-drawer-links" aria-label="Your space"><button type="button" onClick={event => showInfo('settings', event)}><Settings2 size={18}/>Settings</button><button type="button" onClick={event => showInfo('help', event)}><CirclePlay size={18}/>Help center</button></nav>
      <button type="button" className="mobile-drawer-logout" onClick={logout}><LogOut size={17}/>Log out</button>
    </section>

    {infoPanel && <div className="shell-panel-scrim" onMouseDown={event => { if (event.target === event.currentTarget) closeInfo(); }}>
      <section ref={infoPanelRef} className="shell-info-panel" role="dialog" aria-modal="true" aria-labelledby="shell-panel-title">
        <button ref={panelCloseRef} type="button" className="shell-panel-close" aria-label="Close panel" onClick={closeInfo}><X size={18}/></button>
        {infoPanel === 'settings' ? <>
          <div className="eyebrow"><span className="eyebrow-line"/>YOUR ACCOUNT</div>
          <h2 id="shell-panel-title">Settings</h2>
          <p className="shell-panel-description">Adjust how OpenBook is displayed on this device. These preferences are saved in this browser.</p>
          <div className="settings-options" aria-label="Interface preferences">
            <label className="settings-option"><span><strong>Reduce motion</strong><small>Disable interface transitions and animations. Your device’s accessibility preference is also respected.</small></span><input type="checkbox" checked={preferences.reduceMotion} onChange={event => updatePreference('reduceMotion', event.target.checked)} /></label>
            <label className="settings-option"><span><strong>Compact layout</strong><small>Use tighter spacing in course lists, cards, and page content.</small></span><input type="checkbox" checked={preferences.compactLayout} onChange={event => updatePreference('compactLayout', event.target.checked)} /></label>
          </div>
          <button type="button" className="settings-reset" onClick={resetPreferences}>Reset to defaults</button>
          <details className="shell-account-details"><summary>Account information</summary><dl><div><dt>Name</dt><dd>{user?.name || '—'}</dd></div><div><dt>Email</dt><dd>{user?.email || '—'}</dd></div><div><dt>Role</dt><dd>{user?.role || '—'}</dd></div></dl></details>
        </> : <>
          <div className="eyebrow"><span className="eyebrow-line"/>OPENBOOK GUIDE</div>
          <h2 id="shell-panel-title">Help center</h2>
          <p className="shell-panel-description">Use these areas to find courses and keep track of your work.</p>
          <div className="shell-help-list"><article><strong>Browse courses</strong><p>Explore the course catalog and open a course to see its curriculum.</p><Link to="/courses" onClick={closeInfo}>Open course catalog <Compass size={15}/></Link></article>{instructor ? <article><strong>Review analytics</strong><p>See enrollment and completion summaries for your courses.</p><Link to="/analytics" onClick={closeInfo}>Open analytics <BarChart3 size={15}/></Link></article> : <article><strong>Track your learning</strong><p>Review enrolled courses and lesson completion in one place.</p><Link to="/learning" onClick={closeInfo}>Open my progress <BookOpen size={15}/></Link></article>}</div>
        </>}
      </section>
    </div>}
  </div>;
}
