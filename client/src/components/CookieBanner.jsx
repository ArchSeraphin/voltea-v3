import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
    // Trigger GA injection if not already done
    window.dispatchEvent(new Event('cookieConsentUpdated'));
  }

  function decline() {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consentement aux cookies">
      <p className="cookie-text">
        Nous utilisons des cookies analytiques (Google Analytics) pour améliorer votre expérience.
        Consultez notre{' '}
        <Link to="/politique-de-confidentialite">politique de confidentialité</Link>.
      </p>
      <div className="cookie-actions">
        <button className="btn btn-ghost btn-sm" onClick={decline}>
          Refuser
        </button>
        <button className="btn btn-primary btn-sm" onClick={accept}>
          Accepter
        </button>
      </div>
    </div>
  );
}
