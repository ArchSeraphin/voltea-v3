import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://voltea-energie.fr';

export default function Breadcrumb({ items, variant = 'default' }) {
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.to ? `${BASE_URL}${item.to}` : undefined,
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <nav aria-label="Fil d'Ariane" className={`breadcrumb${variant === 'light' ? ' breadcrumb--light' : ''}`}>
        <ol>
          {items.map((item, i) => (
            <li key={i}>
              {item.to && i < items.length - 1 ? (
                <Link to={item.to}>{item.label}</Link>
              ) : (
                <span aria-current={i === items.length - 1 ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {i < items.length - 1 && <span className="breadcrumb-sep" aria-hidden="true">/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
