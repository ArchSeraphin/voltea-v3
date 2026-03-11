import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';

export default function NotFound() {
  return (
    <>
      <SEO title="Page introuvable | Voltea Énergie" noindex />
      <Header />

      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.25rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem, 15vw, 8rem)', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '1rem' }}>
            404
          </p>
          <h1 style={{ marginBottom: '1rem' }}>Page introuvable</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 2.5rem' }}>
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary">
              Retour à l'accueil
            </Link>
            <Link to="/contact" className="btn btn-ghost">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
