import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import { providers } from '../data/providersData.js';

const CATEGORY_COLORS = {
  'Historique': { bg: 'rgba(15,48,128,0.08)', text: 'var(--color-primary)' },
  'Alternatif': { bg: 'rgba(22,160,133,0.08)', text: '#16a085' },
  'Vert & Indépendant': { bg: 'rgba(39,174,96,0.08)', text: '#27ae60' },
};

export default function GuideIndex() {
  return (
    <>
      <SEO
        title="Guide des fournisseurs d'énergie"
        description="Comparez les principaux fournisseurs d'énergie en France : EDF, Engie, TotalEnergies, Ekwateur, Vattenfall, ENI, Alpiq. Fiches détaillées pour professionnels."
        canonical="/guide-energie"
      />
      <Header />

      {/* ── HERO ── */}
      <section className="section section--white" style={{ paddingTop: 'calc(var(--header-height) + 4rem)', paddingBottom: '3rem' }}>
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Guide pratique</span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem', maxWidth: '700px' }}>
              Guide des fournisseurs d'énergie
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '600px', marginBottom: '2rem' }}>
              Tous les fournisseurs ne se valent pas selon votre profil de consommation.
              Découvrez les caractéristiques, offres et points forts de chaque acteur du marché.
            </p>
            <Link to="/contact" className="btn btn-primary">
              Demander une comparaison personnalisée
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── GRILLE FOURNISSEURS ── */}
      <section className="section section--light">
        <div className="container">
          <div className="features-grid">
            {providers.map((provider, i) => {
              const catStyle = CATEGORY_COLORS[provider.category] || CATEGORY_COLORS['Alternatif'];
              return (
                <ScrollReveal key={provider.slug} delay={i * 60}>
                  <Link
                    to={`/guide-energie/${provider.slug}`}
                    className="card card--light"
                    style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}
                  >
                    {/* Logo ou initiales */}
                    <div style={{ height: '64px', display: 'flex', alignItems: 'center' }}>
                      {provider.logoUrl ? (
                        <img
                          src={provider.logoUrl}
                          alt={`Logo ${provider.name}`}
                          style={{ maxHeight: '48px', maxWidth: '140px', objectFit: 'contain' }}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                          {provider.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{provider.name}</h2>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '999px', background: catStyle.bg, color: catStyle.text }}>
                          {provider.category}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                        {provider.tagline}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                      Voir la fiche
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section section--white" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ marginBottom: '1rem', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
              Vous hésitez entre plusieurs fournisseurs ?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Voltea Énergie les met en concurrence pour vous et négocie les meilleures conditions selon votre profil.
            </p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Obtenir une étude sans frais
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
