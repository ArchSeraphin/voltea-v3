import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function SkeletonCard() {
  return (
    <div className="news-card" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div className="news-card-img-placeholder" />
      <div className="news-card-body">
        <div style={{ height: '12px', background: 'var(--color-border)', borderRadius: '4px', width: '30%', marginBottom: '0.75rem' }} />
        <div style={{ height: '20px', background: 'var(--color-border)', borderRadius: '4px', width: '80%', marginBottom: '0.5rem' }} />
        <div style={{ height: '16px', background: 'var(--color-border)', borderRadius: '4px', width: '60%', marginBottom: '1rem' }} />
        <div style={{ height: '14px', background: 'var(--color-border)', borderRadius: '4px', width: '25%' }} />
      </div>
    </div>
  );
}

export default function News() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/articles?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles || []);
        setPagination(data.pagination || null);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [page]);

  function goToPage(p) {
    setSearchParams({ page: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = pagination ? pagination.totalPages : 1;

  return (
    <>
      <SEO
        title="Actualités | Voltea Énergie"
        description="Suivez l'actualité des marchés de l'énergie, les conseils de Voltea Énergie pour optimiser votre budget et les dernières évolutions réglementaires."
        canonical="/actualites"
      />
      <Header />

      <div className="page-header">
        <div className="container">
          <span className="section-label">Blog & actualités</span>
          <h1>Actualités énergétiques</h1>
          <p>Marchés, réglementation, conseils pratiques : restez informé sur l'énergie des professionnels.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="news-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
              <p>Aucun article pour le moment. Revenez bientôt !</p>
            </div>
          ) : (
            <>
              <div className="news-grid">
                {articles.map((article) => (
                  <article key={article.id} className="news-card">
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
                      <p className="news-card-date">
                        {formatDate(article.published_at || article.created_at)}
                      </p>
                      <h2 className="news-card-title">{article.title}</h2>
                      {article.excerpt && (
                        <p className="news-card-excerpt">{article.excerpt}</p>
                      )}
                      <Link to={`/actualites/${article.slug}`} className="news-card-link">
                        Lire la suite
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                    aria-label="Page précédente"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) {
                        acc.push('...');
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === '...' ? (
                        <span key={`dots-${idx}`} style={{ padding: '0 0.5rem', color: 'var(--color-text-muted)' }}>…</span>
                      ) : (
                        <button
                          key={p}
                          className={`page-btn${p === page ? ' active' : ''}`}
                          onClick={() => goToPage(p)}
                          aria-label={`Page ${p}`}
                          aria-current={p === page ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    className="page-btn"
                    disabled={page >= totalPages}
                    onClick={() => goToPage(page + 1)}
                    aria-label="Page suivante"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
