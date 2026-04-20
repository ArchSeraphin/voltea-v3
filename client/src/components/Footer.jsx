import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <img src="/img/logo/logo-clair.png" alt="Voltea Énergie" />
            <p>
              Courtier indépendant agissant comme tiers de confiance pour optimiser vos contrats. Expertise,
              réactivité et professionnalisme au service de votre budget.
            </p>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/voltea.energie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Voltea Énergie"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/voltea.energie38"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Voltea Énergie"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/voltea-energie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Voltea Énergie"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Menu rapide */}
          <div>
            <p className="footer-col-title">Menu rapide</p>
            <ul className="footer-links">
              <li><Link to="/contact">Contactez-nous</Link></li>
              <li><Link to="/services">Nos services</Link></li>
              <li><Link to="/guide-energie">Guide des fournisseurs</Link></li>
              <li><Link to="/marche-energie">Marché de l'énergie</Link></li>
              <li><Link to="/a-propos">Qui sommes-nous ?</Link></li>
              <li><Link to="/actualites">Actualités</Link></li>
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <p className="footer-col-title">Liens utiles</p>
            <ul className="footer-links">
              <li><Link to="/mentions-legales">Mentions légales</Link></li>
              <li><Link to="/politique-de-confidentialite">Politique de confidentialité</Link></li>
              <li><Link to="/services">Nos partenaires</Link></li>
              <li><Link to="/contact">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Voltea Énergie. Tous droits réservés.</span>
          <span className="footer-credit">
            Site réalisé par{' '}
            <a href="https://voilavoila.tv" target="_blank" rel="noopener noreferrer">
              Voïla Voïla
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
