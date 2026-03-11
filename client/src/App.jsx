import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import News from './pages/News.jsx';
import NewsDetail from './pages/NewsDetail.jsx';
import Contact from './pages/Contact.jsx';
import Collectivites from './pages/Collectivites.jsx';
import LegalMentions from './pages/LegalMentions.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ArticleEditor from './pages/admin/ArticleEditor.jsx';
import Analytics from './pages/admin/Analytics.jsx';
import CookieBanner from './components/CookieBanner.jsx';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/connexion" replace />;
  }
  return children;
}

function GAInjector() {
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent !== 'accepted') return;

    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const gaId = data.ga_measurement_id;
        if (gaId && /^G-[A-Z0-9]+$/.test(gaId)) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          document.head.appendChild(script);

          window.dataLayer = window.dataLayer || [];
          function gtag() { window.dataLayer.push(arguments); }
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', gaId);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}

const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Voltea Énergie',
  description: 'Courtier en énergie pour professionnels et collectivités à Bourgoin-Jallieu',
  url: 'https://voltea-energie.fr',
  telephone: '+33642170251',
  email: 'contact@voltea-energie.fr',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bourgoin-Jallieu',
    addressRegion: 'Isère',
    addressCountry: 'FR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 45.5836,
    longitude: 5.2703,
  },
  areaServed: {
    '@type': 'State',
    name: 'Rhône-Alpes',
  },
  sameAs: ['https://www.instagram.com/voltea.energie38'],
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <HelmetProvider>
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
        />
        <GAInjector />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/actualites" element={<News />} />
            <Route path="/actualites/:slug" element={<NewsDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/collectivites" element={<Collectivites />} />
            <Route path="/mentions-legales" element={<LegalMentions />} />
            <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
            <Route path="/admin/connexion" element={<Login />} />
            <Route
              path="/admin/tableau-de-bord"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/articles/nouveau"
              element={
                <ProtectedRoute>
                  <ArticleEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/articles/:id/modifier"
              element={
                <ProtectedRoute>
                  <ArticleEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieBanner />
        </BrowserRouter>
      </AuthContext.Provider>
    </HelmetProvider>
  );
}
