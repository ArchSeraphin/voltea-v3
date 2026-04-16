import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

export default function MarketPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Comprendre le marché de l'énergie | Voltea Énergie"
        description="Actualités du marché de l'énergie, prix de l'électricité et du gaz, tendances du courtage. Restez informé avec Voltea Énergie."
        canonical="/marche-energie"
      />
      <Header />

      {/* ── HERO ── */}
      <section className="section section--white" style={{ paddingTop: 'calc(var(--header-height) + 4rem)', paddingBottom: '3rem' }}>
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Marché de l'énergie</span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem', maxWidth: '700px' }}>
              Comprendre le marché de l'énergie
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '600px', marginBottom: '2rem' }}>
              Électricité, gaz, prix spot, fournisseurs… le marché de l'énergie évolue en permanence.
              Retrouvez ici les dernières actualités pour prendre les bonnes décisions au bon moment.
            </p>
            <Link to="/guide-energie" className="btn btn-outline">
              Découvrir notre guide des fournisseurs
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── ACTUALITÉS ── */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <h2 className="section-title">Actualités du marché</h2>
          </ScrollReveal>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p>Chargement des actualités…</p>
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              <p>Les actualités sont temporairement indisponibles. Revenez prochainement.</p>
            </div>
          ) : (
            <div className="news-grid">
              {articles.map((article, i) => (
                <ScrollReveal key={article.url} delay={i * 80}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card"
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="news-card-img"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="news-card-img-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                    <div className="news-card-body">
                      <p className="news-card-date">
                        {article.source?.name} · {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="news-card-title">{article.title}</h3>
                      {article.description && (
                        <p className="news-card-excerpt" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {article.description}
                        </p>
                      )}
                      <span className="news-card-link">
                        Lire l'article
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BANNIÈRE GUIDE ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <div className="why-voltea-card" style={{ textAlign: 'center' }}>
              <span className="section-label">Guide pratique</span>
              <h2 style={{ marginBottom: '1rem' }}>Qui sont les fournisseurs d'énergie ?</h2>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '560px', margin: '0 auto 2rem' }}>
                EDF, Engie, TotalEnergies, Ekwateur… Tous ne se valent pas selon votre profil de consommation.
                Notre guide compare les principaux fournisseurs pour vous aider à y voir clair.
              </p>
              <Link to="/guide-energie" className="btn btn-primary">
                Accéder au guide des fournisseurs
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section section--light" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ marginBottom: '1rem', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
              Un expert à votre côté pour naviguer le marché
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Voltea Énergie surveille le marché pour vous et négocie au moment opportun.
            </p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Contactez-nous
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
