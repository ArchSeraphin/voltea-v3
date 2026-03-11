import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

export default function About() {
  return (
    <>
      <SEO
        title="À propos | Voltea Énergie - Courtier en énergie"
        description="Découvrez Voltea Énergie et Jérémy Lozzi, courtier en énergies basé à Bourgoin-Jallieu. Notre mission : optimiser les contrats d'énergie des professionnels et collectivités."
        canonical="/a-propos"
      />
      <Header />

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="container">
          <span className="section-label" style={{ color: 'var(--color-primary)' }}>Notre histoire</span>
          <h1>À propos de Voltea Énergie</h1>
          <p>Courtier en énergie indépendant, né de la conviction que chaque entreprise mérite de payer son énergie au juste prix.</p>
        </div>
      </div>

      {/* STORY */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <ScrollReveal>
              <div>
                <span className="section-label">Notre fondateur</span>
                <h2 className="section-title">Jérémy Lozzi,<br />au service de votre énergie</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: '1.8' }}>
                  Né d'une passion pour les marchés de l'énergie et d'une volonté d'apporter une expertise
                  concrète aux entreprises et collectivités locales, Voltea Énergie a été fondé par
                  Jérémy Lozzi à Bourgoin-Jallieu, au cœur de l'Isère.
                </p>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: '1.8' }}>
                  Fort d'une solide expérience dans le secteur énergétique, Jérémy a constaté que nombreuses
                  PME et collectivités locales subissaient des tarifs d'énergie bien supérieurs à ce qu'elles
                  pourraient obtenir avec une bonne négociation. C'est pour combler ce déficit que Voltea Énergie
                  a vu le jour.
                </p>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.8' }}>
                  Depuis sa création, Voltea Énergie a accompagné plus de 200 clients — professionnels,
                  commerçants, industriels et collectivités — dans la maîtrise de leur budget énergie, générant
                  en moyenne 30% d'économies sur leur facture annuelle.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Jérémy Lozzi</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Fondateur & Courtier en énergies — Bourgoin-Jallieu, Isère</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <a href="tel:+33642170251" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>06 42 17 02 51</a>
                      <a href="mailto:jl@voltea-energie.fr" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>jl@voltea-energie.fr</a>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div className="about-photo">
                <img
                  src="/assets/images/voltea-energie-jeremy-lozzi.png"
                  alt="Jérémy Lozzi, fondateur de Voltea Énergie"
                  loading="lazy"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Ce qui nous guide</span>
            <h2 className="section-title">Nos valeurs</h2>
            <p className="section-subtitle">
              Trois principes fondamentaux guident chacune de nos actions.
            </p>
          </ScrollReveal>
          <div className="features-grid">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ),
                title: 'Transparence',
                text: 'Aucun frais caché, aucune commission dissimulée. Nous vous expliquons clairement comment nous sommes rémunérés et ce que vous gagnez à travailler avec nous.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                ),
                title: 'Réactivité',
                text: "Les marchés de l'énergie évoluent vite. Nous surveillons en permanence les opportunités pour vous alerter au bon moment et saisir les meilleures fenêtres tarifaires.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8v4l3 3"/>
                  </svg>
                ),
                title: 'Expertise',
                text: "Connaissance approfondie des mécanismes de marché, des réglementations ARENH, de la capacité et des dispositifs d'aide à l'efficacité énergétique.",
              },
            ].map((val, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="card card--light">
                  <div className="card-icon">{val.icon}</div>
                  <h3 className="card-title">{val.title}</h3>
                  <p className="card-text">{val.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ENGAGEMENT */}
      <section className="section">
        <div className="container" style={{ maxWidth: '780px' }}>
          <ScrollReveal>
            <span className="section-label">Notre promesse</span>
            <h2 className="section-title">Notre engagement</h2>
          </ScrollReveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
            {[
              { num: '01', text: 'Analyse gratuite et sans engagement de vos factures et de votre profil de consommation.' },
              { num: '02', text: "Appel d'offres auprès de l'ensemble des fournisseurs qualifiés présents sur le marché." },
              { num: '03', text: 'Recommandation objective basée sur votre intérêt, pas sur les marges des fournisseurs.' },
              { num: '04', text: 'Accompagnement de A à Z : de la signature du contrat au suivi mensuel de votre consommation.' },
              { num: '05', text: 'Disponibilité permanente pour répondre à vos questions et gérer les éventuels litiges.' },
            ].map((item) => (
              <ScrollReveal key={item.num} delay={50}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', padding: '1.25rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0, lineHeight: 1 }}>{item.num}</span>
                  <p style={{ color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.7 }}>{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Prendre contact
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
