import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/services', label: 'Services' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/collectivites', label: 'Collectivités' },
  { to: '/actualites', label: 'Actualités' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="header-logo" onClick={closeMenu} aria-label="Voltea Énergie - Accueil">
              <img src="/img/logo/logo-clair.png" alt="Voltea Énergie" />
            </Link>

            <nav className="header-nav" aria-label="Navigation principale">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="header-actions">
              <a href="tel:+33642170251" className="header-phone">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.55 6.82 19.79 19.79 0 01.49 2.18 2 2 0 012.47 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                06 42 17 02 51
              </a>
              <Link to="/contact" className="btn btn-primary btn-sm">
                Nous contacter
              </Link>
            </div>

            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <nav className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-label="Menu mobile">
        <button className="mobile-menu-close" onClick={closeMenu} aria-label="Fermer le menu">
          &#10005;
        </button>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            {label}
          </NavLink>
        ))}
        <Link to="/contact" className="btn btn-primary" onClick={closeMenu} style={{ marginTop: '1rem' }}>
          Nous contacter
        </Link>
      </nav>
    </>
  );
}
