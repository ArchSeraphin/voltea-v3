import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

const SERVICES = [
  {
    id: 'negociation',
    title: 'Négociation de contrats',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
    description: "Notre cœur de métier : obtenir pour vous les meilleures conditions tarifaires sur vos contrats d'électricité et de gaz naturel.",
    points: [
      "Lancement d'appels d'offres multi-fournisseurs",
      'Comparaison objective des offres reçues',
      'Négociation des clauses contractuelles',
      'Accompagnement à la signature',
      'Suivi des échéances et renouvellements',
    ],
  },
  {
    id: 'audit',
    title: 'Audit énergétique',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
    ),
    description: "Avant toute négociation, nous analysons en profondeur votre profil de consommation pour identifier tous les leviers d'économies.",
    points: [
      'Analyse des courbes de charge',
      'Vérification des factures passées',
      'Identification des surconsommations',
      'Benchmarking sectoriel',
      'Rapport de recommandations personnalisé',
    ],
  },
  {
    id: 'optimisation',
    title: 'Optimisation tarifaire',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    description: "Au-delà du prix du kWh, de nombreux paramètres influencent votre facture. Nous les optimisons pour vous.",
    points: [
      'Révision de la puissance souscrite',
      'Optimisation des abonnements',
      'Vérification des taxes (TURPE, CSPE…)',
      'Contrôle des factures de régularisation',
      'Correction des anomalies de facturation',
    ],
  },
  {
    id: 'suivi',
    title: 'Suivi de consommation',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    description: "Notre mission ne s'arrête pas à la signature. Nous assurons un suivi actif de votre consommation tout au long du contrat.",
    points: [
      'Tableau de bord mensuel',
      "Alertes en cas d'anomalie",
      'Analyse des écarts vs prévisionnel',
      'Veille sur les opportunités de renégociation',
      'Compte-rendu trimestriel',
    ],
  },
  {
    id: 'reglementaire',
    title: 'Accompagnement réglementaire',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    description: "Le cadre réglementaire de l'énergie est complexe. Nous vous guidons pour que vous profitiez de tous les dispositifs auxquels vous avez droit.",
    points: [
      "Mécanisme ARENH (Accès Régulé à l'Énergie Nucléaire Historique)",
      'Mécanisme de capacité',
      "CEE (Certificats d'Économie d'Énergie)",
      'Taxes sectorielles et exonérations',
      'Veille réglementaire permanente',
    ],
  },
];

const PROCESS_STEPS = [
  { num: 1, title: 'Audit', desc: 'Analyse de vos factures et de votre profil de consommation' },
  { num: 2, title: 'Analyse', desc: "Identification des leviers d'économies et stratégie de négociation" },
  { num: 3, title: 'Négociation', desc: "Appels d'offres et mise en concurrence des fournisseurs" },
  { num: 4, title: 'Signature', desc: 'Contractualisation aux meilleures conditions identifiées' },
  { num: 5, title: 'Suivi', desc: 'Monitoring continu et accompagnement post-contrat' },
];

export default function Services() {
  return (
    <>
      <SEO
        title="Services de courtage en énergie | Voltea Énergie"
        description="Découvrez tous nos services : négociation de contrats, audit énergétique, optimisation tarifaire, suivi de consommation. Service 100% gratuit pour professionnels et collectivités."
        canonical="/services"
      />
      <Header />

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="container">
          <span className="section-label">Ce que nous faisons</span>
          <h1>Nos services de courtage en énergie</h1>
          <p>
            De l'audit initial à l'accompagnement post-contrat, Voltea Énergie gère l'intégralité
            de votre démarche énergétique. Gratuit, indépendant, efficace.
          </p>
        </div>
      </div>

      {/* SERVICES LIST */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
            {SERVICES.map((service, i) => (
              <ScrollReveal key={service.id}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '3rem',
                    alignItems: 'center',
                    direction: i % 2 !== 0 ? 'rtl' : 'ltr',
                  }}
                  className="service-row"
                >
                  <div style={{ direction: 'ltr' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div className="card-icon" style={{ width: '56px', height: '56px', flexShrink: 0 }}>
                        {service.icon}
                      </div>
                      <h2 style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', margin: 0 }}>{service.title}</h2>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.8', fontSize: '1.05rem' }}>
                      {service.description}
                    </p>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {service.points.map((point) => (
                        <li key={point} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ direction: 'ltr' }}>
                    <div style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: '3rem 2rem',
                      textAlign: 'center',
                      color: 'var(--color-primary)',
                    }}>
                      {service.icon}
                      <p style={{ color: 'var(--color-text-muted)', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Service inclus dans notre accompagnement
                      </p>
                      <p style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', marginTop: '0.5rem' }}>
                        100% Gratuit
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Notre méthode</span>
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">
              Un processus rodé pour maximiser vos économies sans vous mobiliser.
            </p>
          </ScrollReveal>
          <div className="process-steps">
            {PROCESS_STEPS.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 80}>
                <div className="process-step">
                  <div className="process-step-number">{step.num}</div>
                  <p className="process-step-title">{step.title}</p>
                  <p className="process-step-desc">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section--primary">
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Obtenez votre audit gratuit</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Sans engagement, sans frais. Découvrez en quelques jours le potentiel
              d'économies sur vos factures d'énergie.
            </p>
            <Link to="/contact" className="btn btn-ghost btn-lg">
              Démarrer maintenant
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .service-row {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
          }
        }
      `}</style>
    </>
  );
}
