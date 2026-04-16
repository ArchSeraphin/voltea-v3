import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import { getProviderBySlug } from '../data/providersData.js';

export default function ProviderPage() {
  const { slug } = useParams();
  const provider = getProviderBySlug(slug);

  if (!provider) {
    return <Navigate to="/guide-energie" replace />;
  }

  return (
    <>
      <SEO
        title={`${provider.name} — Fournisseur d'énergie | Voltea Énergie`}
        description={`Découvrez les offres ${provider.name} (${provider.fullName}) pour les professionnels. ${provider.tagline}. Analyse complète par Voltea Énergie.`}
        canonical={`/guide-energie/${provider.slug}`}
      />
      <Header />

      {/* ── HEADER FICHE ── */}
      <section className="section section--white" style={{ paddingTop: 'calc(var(--header-height) + 4rem)', paddingBottom: '3rem' }}>
        <div className="container">
          <ScrollReveal>
            <Link to="/guide-energie" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Retour au guide
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {provider.logoUrl ? (
                <img
                  src={provider.logoUrl}
                  alt={`Logo ${provider.name}`}
                  style={{ maxHeight: '64px', maxWidth: '180px', objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.4rem', flexShrink: 0 }}>
                  {provider.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', margin: '0 0 0.25rem' }}>{provider.name}</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{provider.fullName}</p>
              </div>
            </div>

            <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', maxWidth: '650px' }}>
              {provider.tagline}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── PRÉSENTATION ── */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <div style={{ maxWidth: '720px' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Présentation</h2>
              {provider.description.map((para, i) => (
                <p key={i} style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '1rem' }}>
                  {para}
                </p>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── OFFRES ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <h2 style={{ marginBottom: '2rem' }}>Offres proposées</h2>
          </ScrollReveal>
          <div className="features-grid">
            {provider.offers.map((offer, i) => (
              <ScrollReveal key={offer.label} delay={i * 80}>
                <div className="card card--light" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(20,110,243,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{offer.label}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>{offer.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROS / CONS ── */}
      <section className="section section--light">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <ScrollReveal>
              <h2 style={{ marginBottom: '1.25rem' }}>Points forts</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {provider.pros.map((pro) => (
                  <li key={pro} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(39,174,96,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>{pro}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h2 style={{ marginBottom: '1.25rem' }}>Points de vigilance</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {provider.cons.map((con) => (
                  <li key={con} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>{con}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── PROFILS ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <h2 style={{ marginBottom: '1.25rem' }}>Pour quel profil ?</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {provider.profiles.map((profile) => (
                <span
                  key={profile}
                  style={{ padding: '0.4rem 1rem', borderRadius: '999px', background: 'rgba(20,110,243,0.08)', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  {profile}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA VOLTEA ── */}
      <section className="section section--light" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <ScrollReveal>
            <div className="why-voltea-card" style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '1rem' }}>
                {provider.name} correspond à votre profil ?
              </h2>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '520px', margin: '0 auto 2rem' }}>
                Voltea Énergie met {provider.name} en concurrence avec plus de 20 fournisseurs partenaires
                et négocie les meilleures conditions pour vous — sans frais.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/contact" className="btn btn-primary btn-lg">
                  Demander une étude sans frais
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link to="/guide-energie" className="btn btn-outline btn-lg">
                  Voir les autres fournisseurs
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
