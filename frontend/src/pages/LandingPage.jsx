import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

/* ── SVG Icons ─────────────────────────────────────────────────────── */
const Icon = ({ path, size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  qr:       'M3 3h6v6H3V3zm0 12h6v6H3v-6zm12-12h6v6h-6V3zm0 12h3v3h-3v-3zm3 3h3v3h-3v-3zm-3 0v-3h3m0 6h-3v-3',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  bell:     'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  users:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  zap:      'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  check:    'M20 6L9 17l-5-5',
  arrow:    'M5 12h14M12 5l7 7-7 7',
  mappin:   'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  globe:    'M12 22a10 10 0 100-20 10 10 0 000 20zm0 0a15 15 0 010-20M2 12h20',
  lock:     'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  x:        'M18 6L6 18M6 6l12 12',
  menu:     'M4 6h16M4 12h16M4 18h16',
};

/* ── Animated Counter ──────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const timer = setInterval(() => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress === 1) clearInterval(timer);
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Feature Card ──────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div className="lp-feature-card" style={{ '--delay': `${delay}ms` }}>
      <div className="lp-feature-icon">
        <Icon path={ICONS[icon]} size={26} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* ── Step Card ─────────────────────────────────────────────────────── */
function StepCard({ num, title, desc, icon }) {
  return (
    <div className="lp-step">
      <div className="lp-step-num">{num}</div>
      <div className="lp-step-icon"><Icon path={ICONS[icon]} size={22} /></div>
      <h4>{title}</h4>
      <p>{desc}</p>
      <div className="lp-step-connector" />
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const FEATURES = [
    { icon: 'calendar', title: 'Smart Booking',       desc: 'Reserve meeting rooms, desks, and labs in seconds. Real-time availability prevents double-bookings across campus.' },
    { icon: 'qr',       title: 'QR Check-In',         desc: 'Every confirmed booking generates a unique QR code. Admins scan it at the door for instant, contactless check-in.' },
    { icon: 'bell',     title: 'Live Notifications',  desc: 'Get instant push alerts for booking approvals, rejections, and reminders — never miss a session.' },
    { icon: 'shield',   title: 'Secure Access',       desc: 'Google OAuth2 + JWT authentication ensures only authorised campus members can access and manage spaces.' },
    { icon: 'users',    title: 'Role-Based Access',   desc: 'Students book spaces; admins manage schedules and approve requests. Clear, structured permission tiers.' },
    { icon: 'zap',      title: 'Instant Updates',     desc: 'Changes sync in real-time across all users. Admin approves → student is notified within seconds.' },
  ];

  const STEPS = [
    { num: '01', icon: 'users',    title: 'Create Account',  desc: 'Sign up with your campus email or authenticate instantly via Google OAuth.' },
    { num: '02', icon: 'mappin',   title: 'Browse Spaces',   desc: 'Explore available rooms, desks, and labs filtered by date, time, and capacity.' },
    { num: '03', icon: 'calendar', title: 'Book in 1 Click', desc: 'Select your slot and confirm. Your booking goes for immediate admin review.' },
    { num: '04', icon: 'qr',       title: 'Scan & Enter',    desc: 'Receive your QR code, then scan it at the entrance for instant check-in.' },
  ];

  return (
    <div className="lp-root">
      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon">S</div>
            <span>SpaceSync</span>
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#stats">Stats</a>
          </div>
          <div className="lp-nav-actions">
            {!user ? (
              <>
                <Link to="/login" className="lp-btn-ghost">Login</Link>
                <Link to="/signup" className="lp-btn-primary">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="lp-btn-ghost">Dashboard</Link>
                <button onClick={logout} className="lp-btn-logout">Logout</button>
              </>
            )}
          </div>
          <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon path={menuOpen ? ICONS.x : ICONS.menu} size={22} />
          </button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
            <a href="#stats" onClick={() => setMenuOpen(false)}>Stats</a>
            {!user ? (
              <>
                <Link to="/login" className="lp-btn-ghost" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="lp-btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="lp-btn-ghost" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="lp-btn-logout">Logout</button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
          <div className="lp-grid-overlay" />
        </div>
        <div className="lp-hero-inner">
          <div className="lp-hero-text">
            <div className="lp-badge">
              <span className="lp-badge-dot" />
              Smart Campus Platform
            </div>
            <h1 className="lp-hero-title">
              Book Campus Spaces
              <span className="lp-hero-gradient"> Effortlessly.</span>
            </h1>
            <p className="lp-hero-sub">
              SpaceSync transforms how your campus manages rooms, desks, and shared spaces.
              Real-time booking, QR check-ins, and role-based access — all in one sleek platform.
            </p>
            <div className="lp-hero-cta">
              {user ? (
                <>
                  <Link to="/dashboard" className="lp-btn-primary lp-btn-lg">
                    Go to Dashboard
                    <Icon path={ICONS.arrow} size={18} />
                  </Link>
                  <Link to="/resources" className="lp-btn-ghost lp-btn-lg">
                    <Icon path={ICONS.globe} size={18} />
                    Explore Campus Resources
                  </Link>
                </>
              ) : (
                <Link to="/resources" className="lp-btn-primary lp-btn-lg">
                  <Icon path={ICONS.globe} size={18} />
                  Explore Resources
                </Link>
              )}
            </div>
            <div className="lp-trust-row">
              {['Trusted by students', 'OAuth2 Secured', 'QR Check-in Ready'].map(t => (
                <div className="lp-trust-item" key={t}>
                  <Icon path={ICONS.check} size={14} color="var(--clr-success)" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────── */}
      <section className="lp-stats" id="stats">
        <div className="lp-stats-inner">
          {[
            { label: 'Spaces Available',   value: 50,   suffix: '+' },
            { label: 'Bookings Processed', value: 1200, suffix: '+' },
            { label: 'Campus Users',       value: 500,  suffix: '+' },
            { label: 'Uptime Guarantee',   value: 99,   suffix: '%' },
          ].map(({ label, value, suffix }) => (
            <div className="lp-stat-card" key={label}>
              <div className="lp-stat-value">
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <div className="lp-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="lp-features" id="features">
        <div className="lp-section-header">
          <div className="lp-section-tag">Platform Features</div>
          <h2>Everything your campus needs</h2>
          <p>SpaceSync brings together booking, access control, and notifications into one cohesive experience.</p>
        </div>
        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="lp-how" id="how">
        <div className="lp-section-header">
          <div className="lp-section-tag">How It Works</div>
          <h2>Up and running in minutes</h2>
          <p>From sign-up to check-in, SpaceSync makes the process seamless.</p>
        </div>
        <div className="lp-steps-row">
          {STEPS.map((s, i) => (
            <StepCard key={s.num} {...s} isLast={i === STEPS.length - 1} />
          ))}
        </div>
      </section>

      {/* ── QR HIGHLIGHT ─────────────────────────────────────────────── */}
      <section className="lp-qr-section">
        <div className="lp-qr-inner">
          <div className="lp-qr-visual">
            <div className="lp-qr-phone">
              <div className="lp-qr-phone-screen">
                <div className="lp-qr-demo-badge">APPROVED</div>
                <div className="lp-qr-code-demo">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className={`lp-qr-block lp-qr-block-${i % 3}`} />
                  ))}
                </div>
                <div className="lp-qr-room-name">Room 202 · 10:00–11:00</div>
                <div className="lp-qr-scan-line" />
              </div>
            </div>
          </div>
          <div className="lp-qr-text">
            <div className="lp-section-tag">QR Check-In</div>
            <h2>Contactless. Instant. Secure.</h2>
            <p>Every approved booking generates a unique QR token. Walk up to any space, hold up your phone — and you're in. No keys, no badges, no waiting.</p>
            <ul className="lp-qr-list">
              {['Unique token per booking', 'Admin scans to verify in seconds', 'Auto-marks status to Checked In', 'Works offline after generation'].map(item => (
                <li key={item}>
                  <Icon path={ICONS.check} size={16} color="var(--clr-primary)" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to={user ? "/dashboard" : "/signup"} className="lp-btn-primary lp-btn-lg">
              {user ? "View Dashboard" : "Try It Now"}
              <Icon path={ICONS.arrow} size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-cta-bg">
          <div className="lp-orb lp-orb-cta1" />
          <div className="lp-orb lp-orb-cta2" />
        </div>
        <div className="lp-cta-inner">
          <div className="lp-stars">
            {[...Array(5)].map((_, i) => <Icon key={i} path={ICONS.star} size={16} color="#f5c518" />)}
          </div>
          <h2>Ready to modernise your campus?</h2>
          <p>Join students and administrators already using SpaceSync to manage spaces smarter.</p>
          <div className="lp-cta-btns">
            {user ? (
              <Link to="/dashboard" className="lp-btn-white lp-btn-lg">
                Go to Dashboard
                <Icon path={ICONS.arrow} size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="lp-btn-white lp-btn-lg">
                  Sign Up Free
                  <Icon path={ICONS.arrow} size={18} />
                </Link>
                <Link to="/login" className="lp-btn-outline lp-btn-lg">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo">
              <div className="lp-logo-icon">S</div>
              <span>SpaceSync</span>
            </div>
            <p>Smart Campus Operations Hub — making space management effortless for universities.</p>
          </div>
          <div className="lp-footer-links">
            <div>
              <h5>Platform</h5>
              <a href="#features">Features</a>
              <a href="#how">How It Works</a>
              <a href="#stats">Stats</a>
            </div>
            <div>
              <h5>Account</h5>
              <Link to="/login">Sign In</Link>
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 SpaceSync. All rights reserved.</span>
          <span>Built with ❤️ for smarter campuses</span>
        </div>
      </footer>
    </div>
  );
}
