import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import News from './pages/News.jsx';
import NewsDetail from './pages/NewsDetail.jsx';
import MarketPage from './pages/MarketPage.jsx';
import GuideIndex from './pages/GuideIndex.jsx';
import ProviderPage from './pages/ProviderPage.jsx';
import Contact from './pages/Contact.jsx';
import LegalMentions from './pages/LegalMentions.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ArticleEditor from './pages/admin/ArticleEditor.jsx';
import Analytics from './pages/admin/Analytics.jsx';
import Reviews from './pages/admin/Reviews.jsx';
import CookieBanner from './components/CookieBanner.jsx';

export const AuthContext = createContext(null);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

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
  '@type': ['LocalBusiness', 'ProfessionalService'],
  '@id': 'https://voltea-energie.fr/#business',
  name: 'Voltea Énergie',
  legalName: 'Voltea Énergie',
  description:
    "Courtier indépendant en énergie pour professionnels, copropriétés et particuliers en Isère. Négociation d'offres électricité et gaz auprès de plus de 20 fournisseurs, audit sans frais.",
  url: 'https://voltea-energie.fr',
  logo: 'https://voltea-energie.fr/img/logo/logo-clair.png',
  image: 'https://voltea-energie.fr/img/og-default.jpg',
  telephone: '+33642170251',
  email: 'contact@voltea-energie.fr',
  priceRange: 'Gratuit pour le client — rémunération par les fournisseurs',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bourgoin-Jallieu',
    postalCode: '38300',
    addressRegion: 'Isère',
    addressCountry: 'FR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 45.5836,
    longitude: 5.2703,
  },
  areaServed: [
    { '@type': 'State', name: 'Auvergne-Rhône-Alpes' },
    { '@type': 'AdministrativeArea', name: 'Isère' },
    { '@type': 'City', name: 'Bourgoin-Jallieu' },
    { '@type': 'City', name: 'Villefontaine' },
    { '@type': "City", name: "L'Isle-d'Abeau" },
    { '@type': 'City', name: 'La Tour-du-Pin' },
    { '@type': 'City', name: 'Grenoble' },
    { '@type': 'City', name: 'Lyon' },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  founder: {
    '@type': 'Person',
    name: 'Jérémy Lozzi',
  },
  knowsAbout: [
    'Courtage en énergie',
    'Électricité professionnelle',
    'Gaz naturel professionnel',
    'Audit énergétique',
    'Optimisation tarifaire CSPE TICGN',
    'ARENH',
    'Efficacité énergétique',
  ],
  sameAs: [
    'https://www.facebook.com/voltea.energie',
    'https://www.instagram.com/voltea.energie38',
    'https://www.linkedin.com/company/voltea-energie',
  ],
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
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/marche-energie" element={<MarketPage />} />
            <Route path="/guide-energie" element={<GuideIndex />} />
            <Route path="/guide-energie/:slug" element={<ProviderPage />} />
            <Route path="/actualites" element={<News />} />
            <Route path="/actualites/:slug" element={<NewsDetail />} />
            <Route path="/contact" element={<Contact />} />
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
              path="/admin/avis"
              element={
                <ProtectedRoute>
                  <Reviews />
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
