// FAQ — structured content re-used in FAQPage schema + UI.
// Keep answers as plain text (≥ 40 words recommended for AI citation pickup).

export const faqCategories = [
  {
    id: 'courtage',
    label: 'Le courtage en énergie',
    items: [
      {
        q: "Qu'est-ce qu'un courtier en énergie ?",
        a: "Un courtier en énergie est un intermédiaire indépendant entre les consommateurs d'électricité ou de gaz et les fournisseurs. Il analyse votre profil de consommation, met en concurrence les fournisseurs du marché et négocie en votre nom le contrat le plus adapté. Contrairement à un comparateur en ligne, le courtier vous accompagne de bout en bout : audit initial, appel d'offres, signature, puis suivi sur toute la durée du contrat.",
      },
      {
        q: "Voltea Énergie est-il réellement indépendant ?",
        a: "Oui. Voltea Énergie ne détient aucun capital chez un fournisseur et n'a pas d'accord d'exclusivité. Nous travaillons avec plus de 20 fournisseurs partenaires et nos recommandations reposent uniquement sur l'intérêt du client — meilleur prix, meilleures conditions, meilleure qualité de service. Notre modèle de rémunération est transparent et communiqué avant toute signature.",
      },
      {
        q: "Combien coûte le service de Voltea Énergie ?",
        a: "Le service est 100% gratuit pour le client, sans aucun frais caché. Voltea Énergie est rémunéré par les fournisseurs via une commission contractuelle, indépendante du prix proposé au client. Cela signifie que la négociation reste tirée vers le bas — nous n'avons aucun intérêt à vous faire signer un contrat plus cher.",
      },
      {
        q: "Quelle est la différence avec un comparateur en ligne ?",
        a: "Un comparateur affiche des offres standards accessibles au grand public. Un courtier négocie des offres sur-mesure, souvent non publiques, en s'appuyant sur votre volume de consommation réel. De plus, le courtier gère l'appel d'offres, la relation contractuelle, les éventuels litiges et le renouvellement — un comparateur s'arrête à la mise en relation.",
      },
    ],
  },
  {
    id: 'processus',
    label: 'Le déroulement',
    items: [
      {
        q: "Combien de temps dure un audit énergétique ?",
        a: "L'audit initial prend généralement entre 48h et 5 jours ouvrés, selon la complexité de votre situation (nombre de sites, type d'énergie, historique disponible). Nous analysons vos dernières factures, vérifions la cohérence de vos contrats en cours, identifions les optimisations fiscales possibles (CSPE, TICGN) et chiffrons votre potentiel d'économies avant tout appel d'offres.",
      },
      {
        q: "Dois-je résilier mon contrat actuel avant de vous contacter ?",
        a: "Non, surtout pas. Nous examinons d'abord les conditions de votre contrat en cours, notamment les clauses de résiliation et les éventuels frais associés. Dans la majorité des cas, nous coordonnons la fin du contrat actuel et la prise d'effet du nouveau contrat pour éviter toute coupure ou frais de résiliation anticipée.",
      },
      {
        q: "Que se passe-t-il une fois le contrat signé ?",
        a: "Notre accompagnement ne s'arrête pas à la signature. Nous gérons les démarches administratives avec votre ancien et nouveau fournisseur, vérifions les premières factures pour détecter d'éventuelles erreurs, puis assurons un suivi mensuel ou trimestriel de votre consommation et des prix du marché pour anticiper le prochain renouvellement.",
      },
      {
        q: "Faut-il changer d'installation pour économiser ?",
        a: "Non. Le changement de fournisseur est purement administratif : votre compteur reste le même, votre raccordement au réseau (Enedis pour l'électricité, GRDF pour le gaz) est inchangé, il n'y a ni coupure ni intervention technique. Vous recevez simplement une nouvelle facture avec des tarifs renégociés.",
      },
    ],
  },
  {
    id: 'cible',
    label: 'Qui peut en bénéficier',
    items: [
      {
        q: "Voltea Énergie s'adresse-t-il aux particuliers ?",
        a: "Notre cœur de métier est le professionnel — TPE, PME, industriels, commerçants, copropriétés, collectivités. Nous proposons également un dispositif d'achat groupé pour les particuliers d'une même zone, permettant de bénéficier de conditions tarifaires proches de celles négociées pour les pros. Contactez-nous pour savoir si un achat groupé est ouvert près de chez vous.",
      },
      {
        q: "Quel volume de consommation faut-il pour que cela vaille le coup ?",
        a: "Dès environ 6 000 kWh annuels d'électricité ou de gaz, un appel d'offres a du sens. Pour les très petits consommateurs, les tarifs réglementés (TRV) ou les offres standards restent parfois compétitifs. Notre audit initial vous le dit gratuitement — si la négociation n'apporte rien, nous vous le disons franchement.",
      },
      {
        q: "Intervenez-vous partout en France ?",
        a: "Nous sommes physiquement implantés à Bourgoin-Jallieu et intervenons en priorité dans toute l'Isère et la région Auvergne-Rhône-Alpes (Lyon, Grenoble, Villefontaine, L'Isle-d'Abeau, La Tour-du-Pin). Pour des comptes multi-sites ou des clients en dehors de la région, nous travaillons à distance avec des rendez-vous visio et sur site sur demande.",
      },
    ],
  },
  {
    id: 'marche',
    label: 'Le marché de l\'énergie',
    items: [
      {
        q: "Les tarifs réglementés vont-ils disparaître ?",
        a: "Les tarifs réglementés du gaz (TRV gaz) ont été supprimés pour les professionnels fin 2023. Les tarifs réglementés de l'électricité (TRV élec) restent accessibles uniquement aux sites de moins de 36 kVA et aux TPE de moins de 10 salariés avec un chiffre d'affaires inférieur à 2 M€. Le reste du marché fonctionne en offres de marché négociées.",
      },
      {
        q: "Qu'est-ce que l'ARENH ?",
        a: "L'ARENH (Accès Régulé à l'Électricité Nucléaire Historique) est un dispositif qui permet aux fournisseurs alternatifs d'acheter à EDF une partie de sa production nucléaire à un prix fixé par l'État (42 €/MWh en 2025). Ce mécanisme, qui a maintenu des prix compétitifs pendant des années, prendra fin au 31 décembre 2025 et sera remplacé par un nouveau cadre post-ARENH.",
      },
      {
        q: "Faut-il signer en prix fixe ou en prix indexé ?",
        a: "Tout dépend de votre profil de risque et de la situation du marché. Le prix fixe offre une visibilité totale sur 1 à 3 ans mais coûte plus cher en période de marché haussier. Le prix indexé suit l'évolution des marchés de gros, potentiellement avantageux en période baissière mais volatil. Notre rôle est de vous aider à trancher selon votre trésorerie et votre tolérance au risque.",
      },
    ],
  },
];
