// Politique de Cookies — version française.

export default {
  meta: {
    title: 'Politique de Cookies | Virtuous Leadership',
    description: 'Politique de Cookies de Virtuous Leadership : types de cookies utilisés, finalité, durée et comment les gérer ou les désactiver.',
    path: '/cookies',
  },
  eyebrow: 'Informations légales',
  pageTitle: 'Politique de Cookies',
  lastUpdatedLabel: 'Dernière mise à jour',
  lastUpdated: '14/06/2026',
  body: [
    { type: 'h2', text: '1. Que sont les cookies ?' },
    { type: 'p',  text: 'Un cookie est un petit fichier texte qu\'un site web installe sur le navigateur ou l\'appareil de l\'utilisateur (ordinateur, smartphone, tablette) lors de sa visite. Les cookies permettent au site web de se souvenir d\'informations sur la visite, telles que la langue préférée, la session ouverte ou les préférences de navigation, facilitant la prochaine visite et rendant le site plus utile.' },
    { type: 'p',  text: 'En plus des cookies, d\'autres technologies de stockage et de suivi à fonctionnalité équivalente sont également utilisées, comme les pixels, les web beacons, le local storage, le session storage ou les balises. Toutes sont soumises à la présente politique, bien que par simplicité elles soient désignées génériquement comme « cookies ».' },
    { type: 'p',  text: 'L\'utilisation des cookies est réglementée en Espagne par l\'article 22.2 de la Loi 34/2002, sur les Services de la Société de l\'Information et du Commerce Électronique (LSSI-CE), ainsi que par le Règlement (UE) 2016/679 (RGPD) et la Loi Organique 3/2018 (LOPDGDD), conformément au Guide sur l\'utilisation des cookies de l\'Agence Espagnole de Protection des Données (AEPD).' },

    { type: 'h2', text: '2. Responsable de l\'utilisation des cookies' },
    { type: 'contactBox', lines: [
      { label: 'Titulaire :', value: 'CSO Digital' },
      { label: 'CIF :', value: 'B44568756' },
      { label: 'Adresse :', value: 'C/ Playa Calafell, nº 9, 28290' },
      { label: 'Email :', html: '<a href="mailto:info@csodigital.tech">info@csodigital.tech</a>' },
      { label: 'Site web :', html: '<a href="http://virtuousleadership.com">virtuousleadership.com</a>' },
    ]},

    { type: 'h2', text: '3. Typologie des cookies utilisés' },

    { type: 'h3', text: '3.1. Selon l\'entité qui les gère' },
    { type: 'ul', items: [
      { strong: 'Cookies propres :', text: ' envoyés à l\'équipement terminal de l\'utilisateur depuis un équipement ou domaine géré par CSO Digital.' },
      { strong: 'Cookies tiers :', text: ' envoyés depuis un équipement ou domaine non géré par CSO Digital, mais par une autre entité qui traite les données obtenues via les cookies.' },
    ]},

    { type: 'h3', text: '3.2. Selon leur finalité' },
    { type: 'ul', items: [
      { strong: 'Cookies techniques ou strictement nécessaires :', text: ' permettent la navigation et l\'utilisation des fonctions de base du site web (connexion, sécurité, gestion du panier, stockage du consentement aux cookies, etc.). Ils ne requièrent pas de consentement conformément à l\'art. 22.2 LSSI-CE.' },
      { strong: 'Cookies de préférences ou personnalisation :', text: ' permettent de se souvenir d\'informations afin que l\'utilisateur accède au service avec certaines caractéristiques (langue, région, etc.).' },
      { strong: 'Cookies d\'analyse ou de mesure :', text: ' permettent de quantifier le nombre d\'utilisateurs et d\'analyser leur comportement de manière agrégée afin d\'améliorer le site.' },
      { strong: 'Cookies de publicité comportementale :', text: ' stockent des informations sur le comportement de l\'utilisateur pour afficher de la publicité personnalisée.' },
    ]},

    { type: 'h3', text: '3.3. Selon leur durée' },
    { type: 'ul', items: [
      { strong: 'Cookies de session :', text: ' supprimés à la fermeture du navigateur.' },
      { strong: 'Cookies persistants :', text: ' stockés pendant une période définie, pouvant être consultés par le responsable.' },
    ]},

    { type: 'h2', text: '4. Cookies utilisés sur ce site web' },
    { type: 'p',  html: 'Les cookies actuellement utilisés sur virtuousleadership.com sont détaillés ci-dessous. La liste est tenue à jour ; si vous constatez une divergence, merci de nous le signaler à <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.' },

    { type: 'h3', text: '4.1. Cookies techniques (exemptés de consentement)' },
    { type: 'table', headers: ['Cookie', 'Fournisseur', 'Finalité', 'Durée'], rows: [
      ['cookie_consent', 'virtuousleadership.com (propre)', 'Stocker les préférences de l\'utilisateur concernant les cookies', '12 mois'],
      ['sb-access-token / sb-refresh-token', 'Supabase (propre, gérée par Supabase)', 'Maintenir la session authentifiée de l\'utilisateur sur la plateforme et les tests', 'Session / jusqu\'à déconnexion'],
      ['__cf_bm / cf_clearance', 'Hostinger / Cloudflare', 'Sécurité, détection de bots et protection contre les accès abusifs', '30 minutes / 1 an'],
      ['PHPSESSID ou équivalent', 'Hostinger', 'Maintien de la session technique du serveur', 'Session'],
    ]},

    { type: 'h3', text: '4.2. Cookies d\'analyse (requièrent un consentement)' },
    { type: 'table', headers: ['Cookie', 'Fournisseur', 'Finalité', 'Durée'], rows: [
      ['_ga, _ga_*', 'Google Analytics (Google Ireland Ltd.)', 'Distinguer anonymement utilisateurs et sessions pour mesurer l\'usage du site', 'Jusqu\'à 2 ans'],
      ['_gid', 'Google Analytics', 'Distinguer les utilisateurs', '24 heures'],
    ]},

    { type: 'h3', text: '4.3. Cookies de marketing et communications (requièrent un consentement)' },
    { type: 'table', headers: ['Cookie / pixel', 'Fournisseur', 'Finalité', 'Durée'], rows: [
      ['Pixel de suivi d\'ouvertures et de clics', 'Brevo (Sendinblue SAS)', 'Mesurer l\'interaction avec les communications email (ouvertures, clics)', 'Variable'],
    ]},

    { type: 'h3', text: '4.4. Cookies de réseaux sociaux (le cas échéant)' },
    { type: 'p',  text: 'Si à un moment donné des boutons ou contenus intégrés de réseaux sociaux (YouTube, Instagram, LinkedIn, X, Facebook, etc.) sont intégrés, ces plateformes pourront installer leurs propres cookies sur le navigateur de l\'utilisateur, régis par leurs politiques de confidentialité respectives. Actuellement, aucune intégration de réseaux sociaux installant des cookies sans consentement préalable n\'est utilisée.' },

    { type: 'h2', text: '5. Transferts internationaux de données' },
    { type: 'p',  text: 'Certains fournisseurs de cookies (en particulier Google Analytics et, le cas échéant, Supabase Inc.) peuvent impliquer un transfert international de données personnelles aux États-Unis. Ces transferts sont effectués sous les garanties prévues au Chapitre V du RGPD, y compris, selon le cas, l\'EU–U.S. Data Privacy Framework et/ou les Clauses Contractuelles Types approuvées par la Commission Européenne.' },
    { type: 'p',  html: 'Plus d\'informations : voir la section correspondante de la <a href="/fr/politique-de-confidentialite">Politique de Confidentialité</a>.' },

    { type: 'h2', text: '6. Consentement' },
    { type: 'p',  text: 'La première fois que vous accédez au site, une bannière de cookies s\'affiche grâce à laquelle vous pouvez :' },
    { type: 'ul', items: [
      { text: 'Accepter tous les cookies.' },
      { text: 'Refuser tous les cookies non strictement nécessaires (avec la même facilité et visibilité que l\'option d\'acceptation).' },
      { text: 'Configurer votre préférence par catégorie (techniques, analyse, marketing, etc.).' },
    ]},
    { type: 'p',  text: 'Tant que vous ne manifestez pas votre choix, seuls les cookies techniques strictement nécessaires seront installés. Le consentement donné expire 24 mois après son octroi ou renouvellement, conformément au Guide des cookies de l\'AEPD, moment auquel il sera redemandé.' },
    { type: 'p',  text: 'Vous pouvez modifier ou retirer votre consentement à tout moment en accédant au panneau de configuration des cookies disponible en pied de page du site (lien « Configurer les cookies ») ou en supprimant les cookies stockés dans votre navigateur conformément à la section 7.' },

    { type: 'h2', text: '7. Comment gérer et désactiver les cookies dans votre navigateur' },
    { type: 'p',  text: 'En plus du panneau de configuration du site, vous pouvez gérer, bloquer ou supprimer les cookies directement depuis les paramètres de votre navigateur. Ci-dessous, les liens officiels :' },
    { type: 'ul', items: [
      { strong: 'Google Chrome :', html: ' <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">support.google.com/chrome/answer/95647</a>' },
      { strong: 'Mozilla Firefox :', html: ' <a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox-ordinateur" target="_blank" rel="noopener noreferrer">support.mozilla.org</a>' },
      { strong: 'Microsoft Edge :', html: ' <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">support.microsoft.com</a>' },
      { strong: 'Safari (macOS / iOS) :', html: ' <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">support.apple.com</a>' },
      { strong: 'Opera :', html: ' <a href="https://help.opera.com/en/latest/web-preferences/#cookies" target="_blank" rel="noopener noreferrer">help.opera.com</a>' },
    ]},
    { type: 'p',  html: 'Vous pouvez aussi utiliser des outils tiers spécifiques pour contrôler l\'usage des cookies, comme le <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">module de désactivation Google Analytics pour navigateurs</a>.' },
    { type: 'p',  html: '<strong>Important :</strong> la désactivation des cookies techniques peut empêcher le bon fonctionnement du site ou des tests de tempérament (par exemple, ne pas se souvenir des réponses ou ne pas permettre la connexion).' },

    { type: 'h2', text: '8. Mises à jour de la politique de cookies' },
    { type: 'p',  text: 'CSO Digital pourra modifier cette Politique de Cookies en fonction des exigences législatives ou réglementaires, ou afin d\'adapter cette politique aux instructions émises par l\'Agence Espagnole de Protection des Données, ainsi que lorsque les outils ou cookies utilisés sont modifiés. C\'est pourquoi il est recommandé à l\'utilisateur de la consulter à chaque accès au site web.' },
    { type: 'p',  text: 'Lors de changements significatifs, l\'utilisateur sera notifié par un avis sur le site web et/ou le consentement sera demandé à nouveau.' },

    { type: 'h2', text: '9. Plus d\'informations' },
    { type: 'p',  html: 'Pour toute question sur l\'utilisation des cookies sur ce site web, vous pouvez contacter CSO Digital à <a href="mailto:info@csodigital.tech">info@csodigital.tech</a>.' },
    { type: 'p',  html: 'Pour plus d\'informations, vous pouvez consulter le <a href="https://www.aepd.es/guias/guia-cookies.pdf" target="_blank" rel="noopener noreferrer">Guide sur l\'utilisation des cookies</a> publié par l\'Agence Espagnole de Protection des Données.' },
  ],
};
