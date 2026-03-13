import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const GOOGLE_REVIEW_URL = 'https://www.google.com/maps/place/Voltea+%C3%89nergie+-+Courtier+en+%C3%89nergie/@45.3120642,4.1182379,401630m/data=!3m1!1e3!4m16!1m9!3m8!1s0x29c10eb64bb6011d:0x4bd5763860ad32a0!2sVoltea+%C3%89nergie+-+Courtier+en+%C3%89nergie!8m2!3d45.317723!4d5.4372395!9m1!1b1!16s%2Fg%2F11ywwgfxxy!3m5!1s0x29c10eb64bb6011d:0x4bd5763860ad32a0!8m2!3d45.317723!4d5.4372395!16s%2Fg%2F11ywwgfxxy?entry=ttu&g_ep=EgoyMDI2MDMxMC4wIKXMDSoASAFQAw%3D%3D';

function StarDisplay({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '0.1rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={star <= rating ? '#facc15' : 'none'}
          stroke={star <= rating ? '#facc15' : '#6b7280'}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/api/articles?page=1')
      .then((r) => r.json())
      .then((data) => setArticles((data.articles || []).slice(0, 3)))
      .catch(() => {});
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <SEO
        title="Voltea Énergie | Courtier en énergie Bourgoin-Jallieu"
        description="Voltea Énergie, courtier en énergie indépendant à Bourgoin-Jallieu. Négociation de contrats d'électricité et de gaz pour professionnels et collectivités. Économisez jusqu'à 30% sur votre facture. Audit gratuit."
        canonical="/"
      />
      <Header />

      {/* HERO */}
      <section className="hero">
        <video
          className="hero-video"
          src="/assets/videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              Courtier certifié
            </div>
            <h1>Maîtrisez votre<br />facture d'énergie</h1>
            <p className="hero-subtitle">
              Voltea Énergie négocie vos contrats d'électricité et de gaz pour vous faire
              économiser jusqu'à 30% sur votre facture annuelle. Service 100% gratuit,
              100% indépendant.
            </p>
            <div className="hero-actions">
              <Link to="/contact" className="btn btn-primary btn-lg">
                Obtenir un audit gratuit
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/services" className="btn btn-ghost btn-lg">
                Découvrir nos services
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>Défiler</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div>
              <div className="stat-number">200+</div>
              <div className="stat-label">Clients accompagnés</div>
            </div>
            <div>
              <div className="stat-number">30%</div>
              <div className="stat-label">Économies moyennes</div>
            </div>
            <div>
              <div className="stat-number">5+</div>
              <div className="stat-label">Fournisseurs partenaires</div>
            </div>
            <div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Indépendant & gratuit</div>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Ce que nous faisons</span>
            <h2 className="section-title">Nos services</h2>
            <p className="section-subtitle">
              De l'audit à la signature, nous gérons l'intégralité de votre démarche
              pour obtenir les meilleures conditions du marché.
            </p>
          </ScrollReveal>
          <div className="features-grid">
            <ScrollReveal delay={0}>
              <div className="card card--light">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 className="card-title">Négociation de contrats</h3>
                <p className="card-text">
                  Électricité et gaz naturel : nous lançons des appels d'offres auprès
                  de l'ensemble des fournisseurs pour vous obtenir les tarifs les plus
                  compétitifs du marché.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="card card--light">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <h3 className="card-title">Audit énergétique</h3>
                <p className="card-text">
                  Analyse complète de votre consommation, identification des axes
                  d'amélioration et benchmarking par rapport aux standards de votre secteur.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="card card--light">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h3 className="card-title">Accompagnement personnalisé</h3>
                <p className="card-text">
                  Suivi dédié tout au long du contrat, gestion des litiges, alertes de
                  marché et conseils proactifs pour anticiper les évolutions tarifaires.
                </p>
              </div>
            </ScrollReveal>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/services" className="btn btn-outline">
              Voir tous nos services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY VOLTEA */}
      <section className="section">
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Nos engagements</span>
            <h2 className="section-title">Pourquoi choisir Voltea Énergie ?</h2>
            <p className="section-subtitle">
              Une approche transparente et indépendante au service de votre budget énergie.
            </p>
          </ScrollReveal>
          <div className="features-grid">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                ),
                title: 'Expertise & indépendance',
                text: "Aucun lien capitalistique avec les fournisseurs d'énergie. Nous travaillons exclusivement dans votre intérêt pour vous recommander les meilleures offres du marché.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                ),
                title: 'Service 100% gratuit',
                text: "Notre rémunération est assurée directement par les fournisseurs d'énergie sous forme de commission. Vous ne payez absolument rien pour notre accompagnement.",
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                ),
                title: 'Gain de temps',
                text: "Nous gérons l'intégralité du processus : de l'appel d'offres à la signature du contrat. Concentrez-vous sur votre activité, nous nous occupons de votre énergie.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="card-icon">{item.icon}</div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-text">{item.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TARGET */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <span className="section-label">Qui accompagnons-nous ?</span>
            <h2 className="section-title">Une solution pour chaque profil</h2>
          </ScrollReveal>
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            <ScrollReveal delay={0}>
              <div className="card card--light" style={{ padding: '2.5rem' }}>
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                  </svg>
                </div>
                <h3 className="card-title">Professionnels</h3>
                <p className="card-text" style={{ marginBottom: '1.5rem' }}>
                  PME, TPE, commerces, industries, hôtels, restaurants, cliniques...
                  Quelle que soit votre taille, nous optimisons vos contrats d'énergie
                  et réduisons vos charges opérationnelles.
                </p>
                <Link to="/contact" className="btn btn-primary btn-sm">
                  Obtenir un audit
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <div className="card card--light" style={{ padding: '2.5rem' }}>
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <h3 className="card-title">Collectivités</h3>
                <p className="card-text" style={{ marginBottom: '1.5rem' }}>
                  Communes, intercommunalités, syndicats, établissements publics...
                  Nous maîtrisons le code des marchés publics et vous accompagnons
                  dans vos groupements d'achat d'énergie.
                </p>
                <Link to="/collectivites" className="btn btn-outline btn-sm">
                  En savoir plus
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* NEWS PREVIEW */}
      {articles.length > 0 && (
        <section className="section">
          <div className="container">
            <ScrollReveal>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <div>
                  <span className="section-label">Blog</span>
                  <h2 className="section-title" style={{ marginBottom: 0 }}>Actualités énergétiques</h2>
                </div>
                <Link to="/actualites" className="btn btn-ghost btn-sm">
                  Voir toutes les actualités
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
            <div className="news-grid">
              {articles.map((article, i) => (
                <ScrollReveal key={article.id} delay={i * 100}>
                  <div className="news-card">
                    {article.cover_image ? (
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="news-card-img"
                        loading="lazy"
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
                      <p className="news-card-date">{formatDate(article.published_at || article.created_at)}</p>
                      <h3 className="news-card-title">{article.title}</h3>
                      {article.excerpt && <p className="news-card-excerpt">{article.excerpt}</p>}
                      <Link to={`/actualites/${article.slug}`} className="news-card-link">
                        Lire la suite
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="section section--light">
          <div className="container">
            <ScrollReveal>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <div>
                  <span className="section-label">Ce que disent nos clients</span>
                  <h2 className="section-title" style={{ marginBottom: 0 }}>Avis Google</h2>
                </div>
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Laisser un avis
                </a>
              </div>
            </ScrollReveal>
            <div className="features-grid">
              {reviews.map((review, i) => (
                <ScrollReveal key={review.id} delay={i * 100}>
                  <div className="card card--light" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {review.logo_url ? (
                        <img
                          src={review.logo_url}
                          alt=""
                          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          loading="lazy"
                        />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(20,110,243,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>{review.author_name}</p>
                        {review.author_company && (
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{review.author_company}</p>
                        )}
                      </div>
                    </div>
                    <StarDisplay rating={review.rating} />
                    <p className="card-text" style={{ flex: 1 }}>{review.content}</p>
                    {review.review_date && (
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {new Date(review.review_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      <section className="section section--primary">
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>
              Prêt à optimiser votre énergie ?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Contactez-nous pour un audit gratuit et sans engagement.
              Nous vous répondons sous 24h ouvrées.
            </p>
            <Link to="/contact" className="btn btn-ghost btn-lg">
              Prendre contact
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
