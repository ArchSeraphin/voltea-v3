import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

export default function Collectivites() {
  return (
    <>
      <SEO
        title="Collectivités | Voltea Énergie - Courtage énergie secteur public"
        description="Voltea Énergie accompagne les collectivités territoriales dans l'optimisation de leur budget énergie. Conformité marchés publics, groupements d'achat, audit gratuit."
        canonical="/collectivites"
      />
      <Header />

      {/* HERO */}
      <div className="page-header" style={{ background: 'var(--color-bg)', paddingBottom: '5rem' }}>
        <div className="container">
          <span className="section-label">Secteur public</span>
          <h1>Collectivités : optimisez<br />votre budget énergie</h1>
          <p style={{ maxWidth: '640px' }}>
            L'énergie représente souvent l'un des premiers postes de dépenses des collectivités territoriales.
            Voltea Énergie vous aide à en reprendre le contrôle, dans le strict respect du code des marchés publics.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Audit gratuit collectivité
            </Link>
            <a href="tel:+33642170251" className="btn btn-ghost btn-lg">
              06 42 17 02 51
            </a>
          </div>
        </div>
      </div>

      {/* INTRO */}
      <section className="section section--light">
        <div className="container">
          <div className="about-grid">
            <ScrollReveal>
              <div>
                <span className="section-label">Enjeux</span>
                <h2 className="section-title">L'énergie au cœur des budgets publics</h2>
                <p style={{ color: '#555', lineHeight: '1.8', marginBottom: '1.25rem' }}>
                  Face à la volatilité des prix de l'énergie, les collectivités sont confrontées à des enjeux
                  budgétaires majeurs. Entre la hausse généralisée des tarifs et la complexité croissante des
                  offres, il est difficile de s'assurer d'acheter son énergie aux meilleures conditions.
                </p>
                <p style={{ color: '#555', lineHeight: '1.8', marginBottom: '1.25rem' }}>
                  Voltea Énergie intervient en qualité d'assistant à maîtrise d'ouvrage (AMO) énergétique.
                  Notre rôle : conduire vos procédures d'achat d'énergie, de l'appel d'offres à la mise en
                  service, en garantissant la conformité avec le droit de la commande publique.
                </p>
                <p style={{ color: '#555', lineHeight: '1.8' }}>
                  Notre intervention est entièrement gratuite pour votre collectivité : notre rémunération
                  est assurée par les fournisseurs d'énergie retenus.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Communes', value: '500+ accompagnées en France' },
                  { label: 'Intercommunalités', value: 'EPCI, communautés de communes' },
                  { label: 'Syndicats', value: 'Syndicats d\'énergie, eau, déchets' },
                  { label: 'Établissements publics', value: 'Écoles, EHPAD, hôpitaux, musées' },
                ].map((item) => (
                  <div key={item.label} style={{ background: 'white', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>{item.label}</span>
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SPECIFIC OFFER */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Notre offre</span>
            <h2 className="section-title">Une offre adaptée au secteur public</h2>
            <p className="section-subtitle">
              Nous connaissons les spécificités de la commande publique et les contraintes des budgets municipaux.
            </p>
          </ScrollReveal>
          <div className="features-grid">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: 'Conformité marchés publics',
                text: 'Procédures adaptées au code de la commande publique : mise en concurrence, publicité, respect des seuils et des règles de transparence.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                    <path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                ),
                title: 'Groupement d\'achat',
                text: 'Constitution et animation de groupements d\'achat entre collectivités pour maximiser le volume négocié et obtenir des tarifs encore plus compétitifs.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21V9"/>
                  </svg>
                ),
                title: 'Centrales d\'achat (UGAP)',
                text: 'Analyse comparative avec les offres des centrales d\'achat type UGAP pour vous orienter vers la solution la plus avantageuse selon votre profil.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                ),
                title: 'Transparence budgétaire',
                text: 'Rapports détaillés à destination des élus et des services financiers pour justifier les choix d\'achat et faciliter les délibérations du conseil.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                ),
                title: 'Réactivité & calendrier',
                text: 'Respect de vos contraintes budgétaires et calendaires. Nous anticipons les fins de contrat pour éviter toute rupture de fourniture.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                ),
                title: 'Aucun risque, aucun coût',
                text: 'Notre intervention est sans frais pour votre collectivité. Si nous n\'obtenons pas de meilleures conditions, vous n\'êtes pas obligé de changer de fournisseur.',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="card">
                  <div className="card-icon">{item.icon}</div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-text">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TYPES */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Qui sommes-nous ?</span>
            <h2 className="section-title">Collectivités que nous accompagnons</h2>
          </ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            {[
              'Communes et mairies',
              'Communautés de communes',
              'Communautés d\'agglomération',
              'Métropoles',
              'Syndicats intercommunaux',
              'Syndicats d\'énergie',
              'SDIS',
              'Centres hospitaliers',
              'EHPAD et résidences',
              'Établissements scolaires',
              'Offices HLM',
              'Régions et départements',
            ].map((type) => (
              <div key={type} style={{ background: 'white', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1.25rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--primary">
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>
              Obtenez un audit gratuit pour votre collectivité
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto 2rem' }}>
              Jérémy Lozzi se déplace si besoin pour vous présenter les résultats de l'audit
              et répondre aux questions de vos élus et services.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-ghost btn-lg">
                Demander un audit
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <a href="tel:+33642170251" className="btn btn-ghost btn-lg" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
                Appeler directement
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
