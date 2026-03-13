import React, { useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

export default function Contact() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://webforms.pipedrive.com/f/loader';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <SEO
        title="Contact | Voltea Énergie - Courtier en énergie"
        description="Contactez Jérémy Lozzi, courtier en énergies à Bourgoin-Jallieu. Demandez votre audit gratuit et sans engagement. Réponse sous 24h ouvrées."
        canonical="/contact"
      />
      <Header />

      <div className="page-header">
        <div className="container">
          <span className="section-label">Parlons de votre énergie</span>
          <h1>Contactez-nous</h1>
          <p>Un audit gratuit et sans engagement pour découvrir votre potentiel d'économies. Réponse sous 24h ouvrées.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* FORM */}
            <ScrollReveal>
              <div className="admin-card">
                <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Envoyez-nous un message</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Remplissez le formulaire et nous vous répondrons très rapidement.
                </p>

                <div
                  id="pipedrive-form"
                  className="pipedriveWebForms"
                  data-pd-webforms="https://webforms.pipedrive.com/f/cts8JGGoDnMuwKR7rbRXbi7SeSZHjKcmYantsciQcULlHEtqyedH3otOPobbBLGEzp"
                />
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
                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.55 6.82 19.79 19.79 0 01.49 2.18 2 2 0 012.47 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
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
                        value: 'Bourgoin-Jallieu, Isère (38)',
                        href: null,
                      },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                        <div style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                        <div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                          {item.href ? (
                            <a href={item.href} style={{ color: 'white', fontWeight: 500, fontSize: '0.95rem' }}>{item.value}</a>
                          ) : (
                            <p style={{ color: 'white', fontWeight: 500, fontSize: '0.95rem', margin: 0 }}>{item.value}</p>
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
                  <a
                    href="https://www.instagram.com/voltea.energie38"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    @voltea.energie38
                  </a>
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
