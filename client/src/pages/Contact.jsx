import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';

const FORM_PARTICULIER = 'https://webforms.pipedrive.com/f/5VHzLbaDCRLbDcWKBL16zVeJYOwAdSJOXkVCR6YhUdWbRxdi4LvVI3K4c0nbUjaNzl';
const FORM_ENTREPRISE = 'https://webforms.pipedrive.com/f/cts8JGGoDnMuwKR7rbRXbi7SeSZHjKcmYantsciQcULlHEtqyedH3otOPobbBLGEzp';

export default function Contact() {
  const [audience, setAudience] = useState('entreprise');
  // Mount the Pipedrive form containers (and the loader script) only AFTER
  // hydration, so the prerendered HTML and the client's first hydration
  // render are byte-identical. Otherwise Pipedrive's async loader can
  // inject iframes into the .pipedriveWebForms divs before React finishes
  // hydrating, triggering hydration mismatches (#418/#423/#425).
  const [hydrated, setHydrated] = useState(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Don't flip to hydrated during the build-time prerender pass — the
    // snapshot must reflect the deterministic hydrated=false initial render
    // so the client's first hydration tree matches.
    if (typeof navigator !== 'undefined' && /VolteaPrerender/i.test(navigator.userAgent)) return;

    setHydrated(true);
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;
    const script = document.createElement('script');
    script.src = 'https://webforms.pipedrive.com/f/loader';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <SEO
        title="Contact | Voltea Énergie - Courtier en énergie"
        description="Contactez Jérémy Lozzi, courtier en énergies à Bourgoin-Jallieu. Demandez votre audit sans frais et sans engagement. Réponse sous 24h ouvrées."
        canonical="/contact"
      />
      <Header />

      <div className="page-header">
        <div className="container">
          <Breadcrumb items={[{ to: '/', label: 'Accueil' }, { label: 'Contact' }]} />
          <span className="section-label">Parlons de votre énergie</span>
          <h1>Contactez-nous</h1>
          <p>Un audit sans frais et sans engagement pour découvrir votre potentiel d'économies. Réponse sous 24h ouvrées.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* FORM */}
            <ScrollReveal>
              <div
                className="admin-card"
                style={{
                  background: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  color: '#fff',
                }}
              >
                <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#fff' }}>Envoyez-nous un message</h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Choisissez votre profil pour accéder au formulaire adapté.
                </p>

                <div className="audience-toggle" role="tablist" aria-label="Type de profil">
                  <button
                    type="button"
                    role="tab"
                    id="audience-tab-particulier"
                    aria-selected={audience === 'particulier'}
                    aria-controls="audience-form-particulier"
                    className={`audience-toggle__btn${audience === 'particulier' ? ' is-active' : ''}`}
                    onClick={() => setAudience('particulier')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Particulier
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="audience-tab-entreprise"
                    aria-selected={audience === 'entreprise'}
                    aria-controls="audience-form-entreprise"
                    className={`audience-toggle__btn${audience === 'entreprise' ? ' is-active' : ''}`}
                    onClick={() => setAudience('entreprise')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 21h18" />
                      <path d="M5 21V7l8-4v18" />
                      <path d="M19 21V11l-6-4" />
                      <path d="M9 9v.01" />
                      <path d="M9 12v.01" />
                      <path d="M9 15v.01" />
                      <path d="M9 18v.01" />
                    </svg>
                    Entreprise
                  </button>
                </div>

                {hydrated ? (
                  <>
                    <div
                      id="audience-form-particulier"
                      role="tabpanel"
                      aria-labelledby="audience-tab-particulier"
                      hidden={audience !== 'particulier'}
                    >
                      <div className="pipedriveWebForms" data-pd-webforms={FORM_PARTICULIER} />
                    </div>

                    <div
                      id="audience-form-entreprise"
                      role="tabpanel"
                      aria-labelledby="audience-tab-entreprise"
                      hidden={audience !== 'entreprise'}
                    >
                      <div className="pipedriveWebForms" data-pd-webforms={FORM_ENTREPRISE} />
                    </div>
                  </>
                ) : (
                  // Skeleton placeholder until hydration mounts the real iframes
                  <div
                    aria-hidden="true"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: 'var(--radius-md)',
                      minHeight: '380px',
                    }}
                  />
                )}
              </div>
            </ScrollReveal>

            {/* CONTACT INFO */}
            <ScrollReveal delay={150}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="admin-card">
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Informations de contact</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {[
                      {
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                        label: 'Téléphone',
                        value: '06 42 17 02 51',
                        href: 'tel:+33642170251',
                      },
                      {
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                        label: 'Email',
                        value: 'contact@voltea-energie.fr',
                        href: 'mailto:contact@voltea-energie.fr',
                      },
                      {
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                        label: 'Adresse',
                        value: '8 rue Joseph Cugnot, 38510 Bourgoin-Jallieu',
                        href: null,
                      },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                        <div style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                          {item.href ? (
                            <a href={item.href} style={{ color: 'var(--color-text-dark)', fontWeight: 500, fontSize: '0.95rem' }}>{item.value}</a>
                          ) : (
                            <p style={{ color: 'var(--color-text-dark)', fontWeight: 500, fontSize: '0.95rem', margin: 0 }}>{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-card" style={{ background: 'rgba(20,110,243,0.06)', borderColor: 'rgba(20,110,243,0.2)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Réponse sous 24h ouvrées</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
                        Jérémy Lozzi, Courtier en énergies, vous répond personnellement dans les meilleurs délais.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Nous suivre</h3>
                  <div className="social-icons">
                    <a
                      href="https://www.facebook.com/profile.php?id=61586736881744"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook Voltea Énergie"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/volteaenergie/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram Voltea Énergie"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.linkedin.com/company/voltea-%C3%A9nergie/posts/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn Voltea Énergie"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                        <circle cx="4" cy="4" r="2"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
