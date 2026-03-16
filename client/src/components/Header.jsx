import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/a-propos', label: 'Qui sommes nous' },
  { to: '/services', label: 'Nos services' },
  { to: '/collectivites', label: 'Collectivités' },
  { to: '/actualites', label: 'Actus' },
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
              <img src="/img/logo/logo-sombre.png" alt="Voltea Énergie" />
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
              <Link to="/contact" className="btn btn-primary btn-sm">
                Contact
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
        <button className="mobile-menu-close" onClick={closeMenu} aria-label="Fermer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
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
          Contact
        </Link>
      </nav>
    </>
  );
}
