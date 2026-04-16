// Logos: Wikipedia Commons (SVG→PNG) for EDF, Engie, TotalEnergies, Vattenfall, ENI, Alpiq.
// For Ekwateur and Primeo, logoUrl is null → styled initials shown in UI.

export const providers = [
  {
    slug: 'edf',
    name: 'EDF',
    fullName: 'Électricité de France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/EDF_logo.svg/240px-EDF_logo.svg.png',
    tagline: 'Le fournisseur historique français, solide et reconnu',
    category: 'Historique',
    description: [
      "EDF (Électricité de France) est le fournisseur d'énergie historique en France et l'un des plus grands producteurs d'électricité en Europe. Fondé en 1946, il s'appuie sur un parc de production massif — notamment nucléaire — qui couvre environ 70 % de la production électrique nationale.",
      "Pour les professionnels, EDF propose des contrats adaptés à toutes les tailles d'entreprises, des TPE aux grands industriels, avec une gamme allant des tarifs réglementés (pour les sites éligibles) aux offres de marché à prix fixes ou indexés.",
    ],
    offers: [
      { label: 'Électricité', description: "Offres aux tarifs réglementés (TRV) et contrats de marché indexés ou à prix fixes" },
      { label: 'Gaz naturel', description: "Offres de marché depuis la fin des tarifs réglementés en 2023" },
      { label: 'Énergie verte', description: "Options « Vertiss » avec garanties d'origine renouvelable certifiées" },
    ],
    pros: [
      "Solidité financière et pérennité garantie",
      "Réseau d'agences physiques sur tout le territoire",
      "Offres adaptées aux grands consommateurs industriels",
      "Facturation claire avec historique détaillé en ligne",
    ],
    cons: [
      "Tarifs souvent moins compétitifs que les fournisseurs alternatifs pour les PME",
      "Service client parfois difficile à joindre pour les professionnels",
      "Moins de flexibilité commerciale que les nouveaux entrants du marché",
    ],
    profiles: ['TPE', 'PME', 'Industrie'],
  },
  {
    slug: 'engie',
    name: 'Engie',
    fullName: 'Engie (ex-GDF Suez)',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Engie_logo.svg/240px-Engie_logo.svg.png',
    tagline: "L'acteur de référence sur le marché du gaz professionnel",
    category: 'Historique',
    description: [
      "Engie, anciennement GDF Suez, est le deuxième grand fournisseur historique français. Issu de la fusion entre Gaz de France et Suez en 2008, il est historiquement le leader du gaz naturel en France. Aujourd'hui, il a largement diversifié son offre vers l'électricité et les énergies renouvelables à l'échelle mondiale.",
      "Pour les professionnels, Engie propose des contrats gaz et électricité adaptés à chaque profil, avec une expertise reconnue sur les sites multi-installations et les volumes importants. Sa filiale Engie Pro se consacre spécifiquement aux entreprises.",
    ],
    offers: [
      { label: 'Gaz naturel', description: "Contrats à prix fixes ou indexés PEG, avec garantie de volume possible" },
      { label: 'Électricité', description: "Offres de marché compétitives pour PME, ETI et multi-sites" },
      { label: 'Énergies renouvelables', description: "Offres vertes certifiées, contrats PPA (Power Purchase Agreement) pour grandes entreprises" },
    ],
    pros: [
      "Expertise historique incomparable sur le gaz naturel",
      "Offres multi-énergie attractives pour les sites combinant gaz et électricité",
      "Forte présence sur les contrats de grande consommation",
      "Solutions de transition énergétique (biométhane, hydrogène vert)",
    ],
    cons: [
      "Prix parfois moins compétitifs sur les petits volumes de gaz",
      "Processus contractuels parfois longs pour les PME",
      "Service client variable selon les régions et les interlocuteurs",
    ],
    profiles: ['PME', 'ETI', 'Industrie', 'Multi-sites'],
  },
  {
    slug: 'totalenergies',
    name: 'TotalEnergies',
    fullName: 'TotalEnergies Electricité & Gaz France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/TotalEnergies_logo.svg/240px-TotalEnergies_logo.svg.png',
    tagline: "Le challenger dynamique issu d'une major pétrolière mondiale",
    category: 'Alternatif',
    description: [
      "TotalEnergies Electricité & Gaz France est la filiale de fourniture d'énergie du groupe TotalEnergies, née de l'acquisition de Direct Énergie en 2018. Elle a rapidement gagné des parts de marché grâce à des offres compétitives et un fort investissement commercial.",
      "Le groupe investit massivement dans les énergies renouvelables (solaire, éolien) et les mobilités décarbonées. Pour les professionnels, TotalEnergies propose des contrats flexibles — indexés ou à prix fixes — souvent inférieurs aux tarifs des fournisseurs historiques.",
    ],
    offers: [
      { label: 'Électricité', description: "Offres à prix fixes ou indexés SPOT, contrats de 1 à 3 ans" },
      { label: 'Gaz naturel', description: "Contrats à prix fixes ou indexés PEG pour tous profils" },
      { label: 'Électricité verte', description: "100% renouvelable avec garanties d'origine sur demande" },
    ],
    pros: [
      "Tarifs très compétitifs, surtout en période de marché favorable",
      "Offres innovantes avec options d'indexation SPOT pour les consommateurs avertis",
      "Interlocuteurs commerciaux réactifs et disponibles",
      "Forte capacité de production renouvelable propre en Europe",
    ],
    cons: [
      "Offres SPOT exposées à la volatilité des marchés de l'énergie",
      "Moins implanté localement que les fournisseurs historiques",
      "Gestion des litiges parfois complexe pour les PME",
    ],
    profiles: ['TPE', 'PME', 'ETI'],
  },
  {
    slug: 'ekwateur',
    name: 'Ekwateur',
    fullName: 'Ekwateur',
    logoUrl: null,
    tagline: "L'énergie verte indépendante, engagée et transparente",
    category: 'Vert & Indépendant',
    description: [
      "Ekwateur est un fournisseur d'énergie 100% indépendant, fondé en 2015, positionné sur les énergies renouvelables. Il se distingue par une transparence totale sur l'origine de l'électricité (éolien, solaire, hydraulique français) et par une politique tarifaire lisible.",
      "Pour les professionnels souhaitant valoriser leur engagement environnemental auprès de leurs clients et partenaires, Ekwateur est un choix cohérent : les contrats garantissent une fourniture certifiée, avec un bilan carbone réduit et communicable.",
    ],
    offers: [
      { label: 'Électricité verte', description: "100% renouvelable avec garanties d'origine françaises certifiées par GRDF et RTE" },
      { label: 'Biogaz', description: "Offres gaz vert issu de la méthanisation agricole française" },
      { label: 'Contrats pros', description: "Contrats 12 à 24 mois adaptés aux TPE et PME" },
    ],
    pros: [
      "Transparence totale sur l'origine de l'énergie fournie",
      "Engagement environnemental réel, certifié par des organismes indépendants",
      "Tarifs compétitifs sur le segment de l'énergie verte",
      "Service client reconnu et réactif",
    ],
    cons: [
      "Principalement adapté aux petits et moyens sites de consommation",
      "Offres biogaz moins développées que le portefeuille électricité",
      "Moins de flexibilité pour les très grands consommateurs industriels",
    ],
    profiles: ['TPE', 'PME', 'Copropriétés'],
  },
  {
    slug: 'vattenfall',
    name: 'Vattenfall',
    fullName: 'Vattenfall Energy Trading France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Vattenfall_logo.svg/240px-Vattenfall_logo.svg.png',
    tagline: "L'expert nordique du marché d'énergie B2B",
    category: 'Alternatif',
    description: [
      "Vattenfall est un groupe énergétique suédois d'envergure européenne, présent en France principalement sur le segment B2B. Il est reconnu pour son expertise sur les marchés de gros de l'énergie et sa capacité à proposer des contrats sophistiqués aux consommateurs professionnels avec des volumes significatifs.",
      "En France, Vattenfall se concentre sur les clients professionnels, offrant des produits d'achat structurés (contrats profilés, achats fractionnés) permettant de sécuriser les prix sur les marchés à terme.",
    ],
    offers: [
      { label: 'Électricité B2B', description: "Contrats sur mesure pour PME, ETI et industriels (sites > 36 kVA)" },
      { label: 'Produits structurés', description: "Achats fractionnés et contrats profilés pour sécuriser les prix sur les marchés à terme" },
      { label: 'Énergie renouvelable', description: "Offres vertes avec garanties d'origine européennes certifiées" },
    ],
    pros: [
      "Expertise reconnue sur les produits d'achat d'énergie complexes",
      "Idéal pour les sites avec forte consommation (> 500 MWh/an)",
      "Solidité financière d'un groupe nordique coté",
      "Interlocuteurs spécialisés en marchés de gros de l'électricité",
    ],
    cons: [
      "Non adapté aux TPE et petites PME (volumes insuffisants)",
      "Offres gaz moins développées que le portefeuille électricité",
      "Présence commerciale terrain limitée en France hors grandes agglomérations",
    ],
    profiles: ['PME', 'ETI', 'Industrie'],
  },
  {
    slug: 'eni',
    name: 'ENI',
    fullName: 'ENI Gas & Power France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/ENI_logo.svg/240px-ENI_logo.svg.png',
    tagline: 'La major italienne avec des offres compétitives sur le marché français',
    category: 'Alternatif',
    description: [
      "ENI Gas & Power est la filiale de fourniture d'énergie du groupe pétrolier et gazier italien ENI, présente sur le marché français depuis 2012. Acteur alternatif reconnu, ENI propose des offres gaz et électricité aux professionnels à des tarifs généralement inférieurs aux fournisseurs historiques.",
      "Sa force réside dans sa capacité à proposer des prix attractifs grâce aux synergies avec ses activités de production et de négoce énergétique à l'échelle internationale.",
    ],
    offers: [
      { label: 'Gaz naturel', description: "Contrats à prix fixes ou indexés pour tous profils de consommation professionnelle" },
      { label: 'Électricité', description: "Offres de marché compétitives pour PME et ETI" },
      { label: 'Énergie verte', description: "Options électricité renouvelable avec garanties d'origine disponibles" },
    ],
    pros: [
      "Tarifs compétitifs, notamment sur le gaz naturel",
      "Offres adaptées aux sites multi-installations",
      "Processus de souscription relativement simplifié",
      "Groupe international financièrement solide",
    ],
    cons: [
      "Service client moins accessible que les fournisseurs historiques",
      "Moins de solutions sur-mesure pour les très grands industriels",
      "Présence commerciale terrain limitée en France",
    ],
    profiles: ['TPE', 'PME', 'ETI', 'Multi-sites'],
  },
  {
    slug: 'alpiq',
    name: 'Alpiq',
    fullName: 'Alpiq Energie France',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Alpiq_logo.svg/240px-Alpiq_logo.svg.png',
    tagline: "Le spécialiste suisse des contrats d'énergie pour industriels",
    category: 'Alternatif',
    description: [
      "Alpiq est un groupe énergétique suisse actif sur les marchés européens de l'électricité. En France, Alpiq Energie France cible principalement les clients industriels et les ETI avec des volumes de consommation importants, en proposant des produits d'achat structurés.",
      "Alpiq est reconnu pour ses solutions de gestion du risque prix : contrats en tranches, produits caps/floors, achats sur les marchés à terme. C'est un interlocuteur de choix pour les entreprises souhaitant piloter activement leur budget énergie.",
    ],
    offers: [
      { label: 'Électricité industrielle', description: "Contrats sur mesure pour sites > 500 MWh/an" },
      { label: 'Achats structurés', description: "Contrats en tranches, produits caps/floors pour sécuriser les prix sur les marchés à terme" },
      { label: 'Énergie verte', description: "Contrats PPA (Power Purchase Agreement) et garanties d'origine renouvelables" },
    ],
    pros: [
      "Expertise de haut niveau sur les produits d'achat d'énergie complexes",
      "Idéal pour les industriels souhaitant optimiser leur stratégie d'achat",
      "Solidité financière d'un groupe suisse de référence",
      "Accompagnement dédié sur la gestion du risque prix",
    ],
    cons: [
      "Non adapté aux TPE et PME (seuils de consommation élevés)",
      "Contrats complexes nécessitant un accompagnement spécialisé (courtier recommandé)",
      "Offres gaz moins développées que le portefeuille électricité",
    ],
    profiles: ['Industrie', 'ETI', 'Grands comptes'],
  },
  {
    slug: 'primeo-energie',
    name: 'Primeo Énergie',
    fullName: 'Primeo Énergie France',
    logoUrl: null,
    tagline: "L'alternatif simple et compétitif pour les PME françaises",
    category: 'Alternatif',
    description: [
      "Primeo Énergie est un fournisseur alternatif d'électricité et de gaz naturel, filiale du groupe suisse Primeo AG. Présent sur le marché français, il se positionne sur le segment des TPE et PME avec des offres simples, des tarifs compétitifs et une démarche commerciale transparente.",
      "Sa proposition de valeur repose sur la clarté contractuelle : pas de frais d'entrée, pas de pénalité de sortie anticipée hors engagement, et des prix fixes garantissant la maîtrise du budget énergie sur la durée du contrat.",
    ],
    offers: [
      { label: 'Électricité', description: "Offres à prix fixes sur 1 ou 2 ans pour TPE et PME" },
      { label: 'Gaz naturel', description: "Contrats à prix fixes pour maîtriser le budget énergie sans mauvaise surprise" },
      { label: 'Énergie verte', description: "Option électricité 100% renouvelable avec garanties d'origine disponible" },
    ],
    pros: [
      "Tarifs compétitifs avec engagement de prix fixe sur la durée",
      "Offres simples, sans frais cachés ni engagement abusif",
      "Processus de souscription rapide, adapté aux structures sans direction énergie",
      "Interlocuteurs commerciaux accessibles",
    ],
    cons: [
      "Notoriété encore limitée en France comparée aux grands acteurs",
      "Non adapté aux grands comptes et industriels avec volumes importants",
      "Réseau d'agences physiques absent sur le territoire",
    ],
    profiles: ['TPE', 'PME'],
  },
];

export function getProviderBySlug(slug) {
  return providers.find((p) => p.slug === slug) || null;
}
