import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import { faqCategories } from '../data/faqData.js';

function ChevronIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function Faq() {
  const [openId, setOpenId] = useState(null);

  const allItems = faqCategories.flatMap((c) => c.items);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <>
      <SEO
        title="FAQ — Courtier en énergie : réponses aux questions fréquentes"
        description="Toutes les réponses sur le courtage en énergie pour professionnels : fonctionnement, tarifs, ARENH, TRV, audit, durée des contrats. Par Voltea Énergie."
        canonical="/faq"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <Header />

      <div className="page-header">
        <div className="container">
          <Breadcrumb items={[{ to: '/', label: 'Accueil' }, { label: 'FAQ' }]} />
          <span className="section-label">Questions fréquentes</span>
          <h1>FAQ — Courtage en énergie</h1>
          <p>
            Les réponses concrètes aux questions les plus fréquentes sur le courtage en énergie,
            le fonctionnement de notre service et le marché de l'électricité et du gaz pour les professionnels.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '860px' }}>
          {faqCategories.map((cat, catIdx) => (
            <ScrollReveal key={cat.id}>
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{cat.label}</h2>
                <div className="faq-list">
                  {cat.items.map((item, i) => {
                    const id = `${cat.id}-${i}`;
                    const open = openId === id;
                    return (
                      <div key={id} className={`faq-item${open ? ' faq-item--open' : ''}`}>
                        <button
                          type="button"
                          className="faq-question"
                          aria-expanded={open}
                          onClick={() => setOpenId(open ? null : id)}
                        >
                          <span>{item.q}</span>
                          <ChevronIcon open={open} />
                        </button>
                        {open && (
                          <div className="faq-answer">
                            <p>{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          ))}

          <ScrollReveal>
            <div
              style={{
                textAlign: 'center',
                marginTop: '2rem',
                padding: '2.5rem',
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>
                Vous avez une question qui n'est pas ici ?
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Notre équipe vous répond sous 24h ouvrées.
              </p>
              <Link to="/contact" className="btn btn-primary">
                Nous contacter
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
