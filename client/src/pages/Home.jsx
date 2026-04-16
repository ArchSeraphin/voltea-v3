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
          stroke={star <= rating ? '#facc15' : '#d1d5db'}
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
  const [gnewsArticles, setGnewsArticles] = useState([]);

  useEffect(() => {
    fetch('/api/articles?page=1')
      .then((r) => r.json())
      .then((data) => setArticles((data.articles || []).slice(0, 3)))
      .catch(() => {});
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => setGnewsArticles(data.articles || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <SEO
        title="Voltea Énergie | Courtier en énergie Bourgoin-Jallieu"
        description="Voltea Énergie, courtier en énergie indépendant à Bourgoin-Jallieu. Négociation de contrats d'électricité et de gaz pour professionnels en Isère. Audit sans frais."
        canonical="/"
      />
      <Header />

      {/* ── HERO ── */}
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
            <h1 className="hero-headline">Voltea Énergie</h1>
            <p className="hero-tagline">
              Courtier en énergie<br />à Bourgoin-Jallieu &amp; Isère.
            </p>
            <p className="hero-description">
              Optimisez vos contrats d'électricité et de gaz avec Voltea Énergie,
              votre courtier expert basé à Bourgoin-Jallieu. Réduction de coûts
              et accompagnement sur-mesure pour les pros en Isère.
            </p>
            <div className="hero-actions">
              <Link to="/services" className="btn btn-primary btn-lg">
                Espaces Pro / Industrie
              </Link>
              <Link to="/contact" className="btn btn-outline-white btn-lg">
                Achat groupé particuliers
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true">
          <span>Défiler</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* ── REPRENEZ LE CONTRÔLE ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <div className="section-split">
              <div className="section-split__img">
                <img
                  src="/assets/images/voltea-energie-jeremy-lozzi.png"
                  alt="Jérémy Lozzi, conseiller Voltea Énergie"
                  loading="lazy"
                />
              </div>
              <div className="section-split__content">
                <h2>Reprenez le contrôle de votre budget énergétique avec Voltea Energie</h2>
                <p>
                  Courtier expert en électricité et gaz naturel pour les entreprises
                  et copropriétés en Isère. Basés à Bourgoin-Jallieu, nous négocions pour vous les
                  meilleures offres du marché.
                </p>
                <Link to="/contact" className="btn btn-primary">
                  Demander une étude sans frais
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── NOS CHIFFRES CLÉS ── */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <h2 className="section-title section-title--center">Nos chiffres clés</h2>
          </ScrollReveal>
          <div className="stats-featured">
            <ScrollReveal delay={0}>
              <div className="stat-card">
                <div className="stat-number-lg">+20</div>
                <div className="stat-label-lg">Fournisseurs partenaires</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="stat-card">
                <div className="stat-number-lg">100%</div>
                <div className="stat-label-lg">Indépendant et transparent</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="stat-card">
                <div className="stat-number-lg stat-number-lg--blue">Jusqu'à 20%</div>
                <div className="stat-label-lg">d'économie sur votre facture</div>
              </div>
            </ScrollReveal>
          </div>
          <p className="stats-caption">
            Voltea Énergie — Votre expert dédié à Bourgoin-Jallieu et dans toute l'Isère.
          </p>
        </div>
      </section>

      {/* ── NE LAISSEZ PLUS L'ÉNERGIE PESER ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <div className="section-split section-split--reverse">
              <div className="section-split__content">
                <h2>Ne laissez plus l'énergie peser sur votre rentabilité</h2>
                <p>
                  Le marché de l'énergie est complexe et volatil. Entre les taxes, les
                  différents fournisseurs et les fluctuations de prix, il est difficile d'y voir
                  clair.
                </p>
                <p>Voltea Énergie simplifie vos démarches :</p>
                <ul>
                  <li>Analyse sans frais de vos factures actuelles.</li>
                  <li>Mise en concurrence de plus de 20 fournisseurs partenaires.</li>
                  <li>Économies garanties sans changer vos installations.</li>
                </ul>
                <Link to="/contact" className="btn btn-primary">
                  Obtenir un audit sans frais
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
              <div className="section-split__img">
                <div style={{
                  width: '100%',
                  height: '100%',
                  minHeight: 320,
                  background: 'linear-gradient(135deg, #e8f0fe 0%, #c6daf2 40%, #a8c4e8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-xl)',
                }}>
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.35 }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07C8.99 16.53 7 14.9 7 13h2c0 1.1 1.34 2 3 2s3-.9 3-2c0-1.13-.84-1.6-3.36-2.23-2.71-.67-4.64-1.6-4.64-4.27C7 4.93 8.99 3.47 11 3.07V2h2v1.07c2.01.4 3 1.83 3 3.43h-2c0-1.1-.89-2-2.5-2-1.64 0-2.5.89-2.5 2 0 1.09.79 1.56 3.22 2.2C14.15 9.36 16 10.16 16 13c0 2.16-1.99 3.53-3 3.93z" fill="#146ef3"/>
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section section--light">
        <div className="container">
          <ScrollReveal>
            <h2 className="section-title section-title--center">
              Un accompagnement global pour votre performance énergétique
            </h2>
          </ScrollReveal>
          <div className="services-photo-grid">
            <ScrollReveal delay={0}>
              <div className="service-photo-card">
                <div className="service-photo-card__img">
                  <div className="service-photo-card__img-placeholder" style={{
                    background: 'linear-gradient(135deg, #0f3080 0%, #146ef3 100%)',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                </div>
                <div className="service-photo-card__body">
                  <h3 className="service-photo-card__title">Courtage en Électricité &amp; Gaz</h3>
                  <p className="service-photo-card__text">
                    Trouver le contrat le plus adapté à votre profil de consommation (TPE, PME, Industriels).
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="service-photo-card">
                <div className="service-photo-card__img">
                  <div className="service-photo-card__img-placeholder" style={{
                    background: 'linear-gradient(135deg, #0a4a8f 0%, #1a7dd4 100%)',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                </div>
                <div className="service-photo-card__body">
                  <h3 className="service-photo-card__title">Optimisation de la Fiscalité</h3>
                  <p className="service-photo-card__text">
                    Vérification et réduction des taxes énergétiques (CSPE, TICGN).
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="service-photo-card">
                <div className="service-photo-card__img">
                  <div className="service-photo-card__img-placeholder" style={{
                    background: 'linear-gradient(135deg, #1a6080 0%, #22a89a 100%)',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
                      <path d="M8 12s1.5 2 4 2 4-2 4-2"/>
                      <path d="M9 9h.01M15 9h.01"/>
                    </svg>
                  </div>
                </div>
                <div className="service-photo-card__body">
                  <h3 className="service-photo-card__title">Efficacité Énergétique</h3>
                  <p className="service-photo-card__text">
                    Conseil pour réduire votre consommation globale et transition vers les énergies vertes.
                  </p>
                </div>
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

      {/* ── PROXIMITÉ NORD-ISÈRE ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <div className="local-section">
              <span className="section-label">Voltea Énergie</span>
              <h2>Votre partenaire de proximité en Nord-Isère</h2>
              <p>
                Installé à Bourgoin-Jallieu, Voltea Énergie intervient physiquement dans vos locaux
                pour comprendre vos besoins. Que vous soyez à Villefontaine, L'Isle-d'Abeau, La
                Tour-du-Pin ou Grenoble, nous sommes votre relais local pour une gestion sereine de
                vos contrats.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── POURQUOI CHOISIR VOLTEA ── */}
      <section className="section section--white">
        <div className="container">
          <ScrollReveal>
            <div className="why-voltea-card">
              <h2>Pourquoi choisir Voltea Energie ?</h2>
              <div className="why-grid">
                <div className="why-item">
                  <div className="why-number">1</div>
                  <h3>Gain de temps</h3>
                  <p>
                    En charge de toute la partie administrative.
                  </p>
                </div>
                <div className="why-item">
                  <div className="why-number">2</div>
                  <h3>Transparence</h3>
                  <p>
                    Un service sans frais pour vous (nous sommes rémunérés par les fournisseurs).
                  </p>
                </div>
                <div className="why-item">
                  <div className="why-number">3</div>
                  <h3>Expertise</h3>
                  <p>
                    Une veille constante sur les prix du marché pour vous faire signer au meilleur moment.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── ACTUALITÉS ── */}
      {articles.length > 0 && (
        <section className="section section--light">
          <div className="container">
            <ScrollReveal>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <div>
                  <span className="section-label">Blog</span>
                  <h2 className="section-title" style={{ marginBottom: 0 }}>Actualités énergétiques</h2>
                </div>
                <Link to="/actualites" className="btn btn-outline btn-sm">
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

      {/* ── AVIS CLIENTS ── */}
      {reviews.length > 0 && (
        <section className="section section--white">
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
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(20,110,243,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight: 600, margin: 0, fontSize: '0.95rem', color: 'var(--color-text-dark)' }}>{review.author_name}</p>
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

      {/* ── ACTUALITÉS MARCHÉ ── */}
      {gnewsArticles.length > 0 && (
        <section className="section section--light">
          <div className="container">
            <ScrollReveal>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <div>
                  <span className="section-label">Marché de l'énergie</span>
                  <h2 className="section-title" style={{ marginBottom: 0 }}>Actualités énergétiques</h2>
                </div>
                <Link to="/marche-energie" className="btn btn-outline btn-sm">
                  Voir toutes les actualités
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
            <div className="news-grid">
              {gnewsArticles.slice(0, 3).map((article, i) => (
                <ScrollReveal key={article.url} delay={i * 100}>
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
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="section section--white" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ marginBottom: '1.5rem', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              Prêt à réduire vos factures ?
            </h2>
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
