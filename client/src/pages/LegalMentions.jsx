import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';

export default function LegalMentions() {
  return (
    <>
      <SEO title="Mentions légales | Voltea Énergie" noindex canonical="/mentions-legales" />
      <Header />

      <div className="page-header">
        <div className="container">
          <h1>Mentions légales</h1>
          <p>Informations légales relatives au site voltea-energie.fr</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--color-text)' }}>1. Éditeur du site</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                <p><strong style={{ color: 'var(--color-text)' }}>Raison sociale :</strong> Voltea Énergie</p>
                <p><strong style={{ color: 'var(--color-text)' }}>Responsable de publication :</strong> Jérémy Lozzi</p>
                <p><strong style={{ color: 'var(--color-text)' }}>Qualité :</strong> Courtier en énergies</p>
                <p><strong style={{ color: 'var(--color-text)' }}>SIRET :</strong> [Numéro SIRET à renseigner]</p>
                <p><strong style={{ color: 'var(--color-text)' }}>Adresse :</strong> Bourgoin-Jallieu, 38300 Isère, France</p>
                <p><strong style={{ color: 'var(--color-text)' }}>Téléphone :</strong> <a href="tel:+33642170251" style={{ color: 'var(--color-primary)' }}>06 42 17 02 51</a></p>
                <p><strong style={{ color: 'var(--color-text)' }}>Email :</strong> <a href="mailto:contact@voltea-energie.fr" style={{ color: 'var(--color-primary)' }}>contact@voltea-energie.fr</a></p>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>2. Hébergement</h2>
              <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                <p><strong style={{ color: 'var(--color-text)' }}>Hébergeur :</strong> OVH SAS</p>
                <p><strong style={{ color: 'var(--color-text)' }}>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
                <p><strong style={{ color: 'var(--color-text)' }}>Site :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>www.ovhcloud.com</a></p>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>3. Propriété intellectuelle</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                L'ensemble du contenu de ce site (textes, images, vidéos, logo, graphismes, etc.) est protégé
                par le droit d'auteur et appartient à Voltea Énergie ou à ses partenaires. Toute reproduction,
                représentation, modification, publication, adaptation ou transmission de tout ou partie du site,
                quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.
              </p>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>4. Limitation de responsabilité</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                Voltea Énergie s'efforce de fournir des informations aussi précises que possible sur ce site.
                Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des carences
                dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui
                fournissent ces informations. Les informations présentes sur ce site sont non contractuelles
                et peuvent être modifiées à tout moment.
              </p>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>5. Liens hypertextes</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                Le site voltea-energie.fr peut contenir des liens vers d'autres sites. Voltea Énergie n'est
                pas responsable du contenu de ces sites externes et ne peut être tenu responsable des dommages
                résultant de leur utilisation. La création de liens vers ce site est autorisée sous réserve
                qu'ils ne portent pas atteinte aux intérêts de Voltea Énergie.
              </p>
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)' }} />

            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>6. Loi applicable</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.9' }}>
                Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut
                de résolution amiable, les tribunaux français seront seuls compétents.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem' }}>
              <Link to="/politique-de-confidentialite" className="btn btn-outline btn-sm">
                Politique de confidentialité
              </Link>
              <Link to="/" className="btn btn-ghost btn-sm">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
