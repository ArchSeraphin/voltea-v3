import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO title="Politique de confidentialité | Voltea Énergie" noindex canonical="/politique-de-confidentialite" />
      <Header />

      <div className="page-header">
        <div className="container">
          <h1>Politique de confidentialité</h1>
          <p>Comment nous collectons, utilisons et protégeons vos données personnelles.</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>1. Responsable du traitement</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                <p><strong style={{ color: 'var(--color-text)' }}>Responsable :</strong> Jérémy Lozzi — Voltea Énergie</p>
                <p><strong style={{ color: 'var(--color-text)' }}>Adresse :</strong> Bourgoin-Jallieu, Isère (38), France</p>
                <p><strong style={{ color: 'var(--color-text)' }}>Contact DPO :</strong> <a href="mailto:contact@voltea-energie.fr" style={{ color: 'var(--color-primary)' }}>contact@voltea-energie.fr</a></p>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>2. Données collectées</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                <p>Nous collectons les données suivantes :</p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem', lineHeight: '2' }}>
                  <li><strong style={{ color: 'var(--color-text)' }}>Formulaire de contact :</strong> nom, email, téléphone (optionnel), entreprise (optionnel), message.</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Données de navigation :</strong> adresse IP, pages visitées, durée de visite (via Google Analytics, avec consentement).</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Cookies :</strong> voir section dédiée ci-dessous.</li>
                </ul>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>3. Finalités et bases légales</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                <p>Vos données sont traitées pour les finalités suivantes :</p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem', lineHeight: '2' }}>
                  <li><strong style={{ color: 'var(--color-text)' }}>Traitement de votre demande de contact</strong> — Base légale : intérêt légitime / exécution d'un contrat</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Amélioration du site</strong> via Google Analytics — Base légale : consentement</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Envoi d'informations commerciales</strong> (si vous l'avez demandé) — Base légale : consentement</li>
                </ul>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>4. Cookies</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                <p>Nous utilisons les cookies suivants :</p>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    {
                      name: 'Cookies essentiels',
                      desc: 'Nécessaires au fonctionnement du site (authentification, sécurité). Pas de consentement requis.',
                      type: 'Essentiel',
                    },
                    {
                      name: 'Google Analytics',
                      desc: 'Mesure d\'audience anonymisée. Chargé uniquement avec votre consentement via la bannière cookie.',
                      type: 'Analytique',
                    },
                  ].map((cookie) => (
                    <div key={cookie.name} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <strong style={{ color: 'var(--color-text)' }}>{cookie.name}</strong>
                        <span className="badge badge-gray">{cookie.type}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>{cookie.desc}</p>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: '1rem' }}>
                  Vous pouvez retirer votre consentement à tout moment en effaçant les données locales
                  de votre navigateur ou en cliquant sur "Refuser" dans la bannière cookie.
                </p>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>5. Durée de conservation</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                <ul style={{ marginLeft: '1.5rem', lineHeight: '2' }}>
                  <li>Données de contact : 3 ans à compter du dernier contact</li>
                  <li>Données analytiques Google Analytics : 14 mois (paramétrage par défaut)</li>
                  <li>Logs de sécurité : 12 mois</li>
                </ul>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>6. Vos droits (RGPD)</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem', lineHeight: '2' }}>
                  <li><strong style={{ color: 'var(--color-text)' }}>Droit d'accès</strong> : obtenir une copie de vos données</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Droit de rectification</strong> : corriger des données inexactes</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Droit à l'effacement</strong> : demander la suppression de vos données</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Droit d'opposition</strong> : s'opposer au traitement de vos données</li>
                  <li><strong style={{ color: 'var(--color-text)' }}>Droit de retrait du consentement</strong> : à tout moment pour les traitements basés sur le consentement</li>
                </ul>
                <p style={{ marginTop: '1rem' }}>
                  Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@voltea-energie.fr" style={{ color: 'var(--color-primary)' }}>contact@voltea-energie.fr</a>
                </p>
                <p>
                  En cas de réclamation, vous pouvez saisir la CNIL à l'adresse :{' '}
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>www.cnil.fr</a>
                </p>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>7. Sécurité</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
                vos données contre tout accès non autorisé, modification, divulgation ou destruction.
                Le site utilise le protocole HTTPS (TLS) pour toutes les communications.
              </p>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Dernière mise à jour : mars 2026
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/mentions-legales" className="btn btn-outline btn-sm">Mentions légales</Link>
              <Link to="/" className="btn btn-ghost btn-sm">Retour à l'accueil</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
