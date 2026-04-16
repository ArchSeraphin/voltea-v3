import React from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';

export default function MarketPage() {
  return (
    <>
      <SEO
        title="Comprendre le marché de l'énergie | Voltea Énergie"
        description="Actualités du marché de l'énergie et guide des fournisseurs. Restez informé des évolutions des prix du gaz et de l'électricité en France."
        canonical="/marche-energie"
      />
      <Header />
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Page en cours de construction…</p>
      </main>
      <Footer />
    </>
  );
}
