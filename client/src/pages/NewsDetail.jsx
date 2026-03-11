import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
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

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/articles/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setArticle(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-screen">
          <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
        </div>
        <Footer />
      </>
    );
  }

  if (notFound || !article) {
    return (
      <>
        <SEO title="Article introuvable" noindex />
        <Header />
        <div className="page-header">
          <div className="container">
            <h1>Article introuvable</h1>
            <p>Cet article n'existe pas ou a été supprimé.</p>
          </div>
        </div>
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <Link to="/actualites" className="btn btn-primary">
              ← Retour aux actualités
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const publishedDate = article.published_at || article.created_at;
  const cleanContent = DOMPurify.sanitize(article.content || '');

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || '',
    image: article.cover_image ? `https://voltea-energie.fr${article.cover_image}` : undefined,
    datePublished: publishedDate,
    dateModified: article.updated_at || publishedDate,
    author: {
      '@type': 'Person',
      name: 'Jérémy Lozzi',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Voltea Énergie',
      logo: {
        '@type': 'ImageObject',
        url: 'https://voltea-energie.fr/img/logo/logo-clair.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://voltea-energie.fr/actualites/${article.slug}`,
    },
  };

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt || `${article.title} — Voltea Énergie`}
        canonical={`/actualites/${article.slug}`}
        ogImage={article.cover_image}
        ogType="article"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>
      <Header />

      <div className="page-header">
        <div className="container">
          <Link
            to="/actualites"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour aux actualités
          </Link>
          <p style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            {formatDate(publishedDate)}
          </p>
          <h1 style={{ maxWidth: '760px' }}>{article.title}</h1>
          {article.excerpt && (
            <p style={{ marginTop: '1rem', fontSize: '1.1rem', color: 'var(--color-text-muted)', maxWidth: '700px' }}>
              {article.excerpt}
            </p>
          )}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="article-content">
            {article.cover_image && (
              <img
                src={article.cover_image}
                alt={article.title}
                className="article-cover"
                loading="lazy"
              />
            )}
            <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
          </div>

          <div style={{ maxWidth: '760px', margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Link
              to="/actualites"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Retour aux actualités
            </Link>
            <Link to="/contact" className="btn btn-primary btn-sm">
              Contactez-nous
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
