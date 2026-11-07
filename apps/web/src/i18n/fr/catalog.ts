import type { Messages } from '../messages.ts'

export const catalog: Messages['catalog'] = {
  achievements: {
    'hello-world': { name: 'Bonjour le monde', condition: 'Servir la première requête' },
    'works-on-my-machine': {
      name: 'Cela fonctionne sur ma machine',
      condition: 'Livrer un déploiement défectueux',
    },
    'split-brain': {
      name: 'Cerveau divisé',
      condition: 'Diviser la base de données sur son propre nœud',
    },
    'averages-lie': {
      name: 'Les moyennes mentent',
      condition: 'Recherchez les centiles alors que p99 est supérieur à 5 fois la moyenne',
    },
    'shared-nothing': {
      name: 'Rien de partagé',
      condition:
        'Atteignez l’amorçage avec uniquement des serveurs PHP-FPM et aucun incident de mémoire',
    },
    blocked: {
      name: 'Bloqué',
      condition:
        'Ayez un service Node.js dont le p99 augmente de 100 ms à cause d’un seul type de requête',
    },
    'off-by-one-region': {
      name: 'Une région de trop',
      condition: 'Servez un utilisateur d’une région à plus de 150 ms',
    },
    'littles-law': {
      name: 'Loi de Little',
      condition:
        'Corrigez un goulot d’étranglement de serveur d’application en corrigeant la base de données',
    },
    metastable: { name: 'Métastable', condition: 'Se remettre d’une tempête de tentatives' },
    'big-rewrite': {
      name: 'Grande réécriture',
      condition: 'Migrez chaque service vers un nouveau langage dans une même entreprise',
    },
    strangler: {
      name: 'Étrangleur',
      condition:
        'Terminez une migration en quatre étapes de trafic avec des erreurs inférieures à 1 %',
    },
    quorum: {
      name: 'Quorum',
      condition: 'Exécutez un stockage à colonnes larges avec R + W > N sur trois régions',
    },
    eventually: {
      name: 'À terme',
      condition: 'Exécutez R = 1, W = 1 avec un milliard d’utilisateurs',
    },
    polyglot: { name: 'Polyglotte', condition: 'Exécutez cinq langues en production à la fois' },
    'zero-gc': { name: 'Zéro GC', condition: 'Exécutez un service Rust à 100 000 rps' },
    'no-cache': { name: 'Pas de cache', condition: 'Atteignez la série A sans cache et sans CDN' },
    celebrity: {
      name: 'Célébrité',
      condition: 'Servez une publication à 10 millions d’abonnés sans erreur de clé chaude',
    },
    'follow-the-sun': {
      name: 'Suivre le soleil',
      condition: 'Servez quatre régions sans nœud au-dessus de 70 % à son pic local',
    },
    'postgres-for-everything': {
      name: 'Postgres pour tout',
      condition: 'Atteignez la série B avec uniquement les composants de données Postgres',
    },
    'hug-of-death': {
      name: 'Câlin de la mort',
      condition: "Survivez à un pic ×10 sans perdre d'utilisateurs",
    },
    'egress-shock': {
      name: 'Choc d’egress',
      condition: 'Faites de l’egress la plus grosse ligne de la facture',
    },
    'chaos-monkey': { name: 'Singe du Chaos', condition: 'Survivre à 100 arrêts aléatoires' },
    blameless: { name: 'Irréprochable', condition: 'Rédiger 50 analyses post-incident' },
    nines: { name: 'Neuf', condition: 'Maintenir 99,99% pendant une semaine du jeu' },
    'five-nines': { name: 'Cinq neuf', condition: 'Terminez le défi Cinq neuf' },
    monoglot: {
      name: 'Monoglotte',
      condition: 'Atteignez l’introduction en bourse avec une seule langue',
    },
    'default-alive': {
      name: 'Viable sans financement',
      condition: 'Atteindre la bourse sans lever de fonds',
    },
    unicorn: { name: 'Unicorn', condition: 'Atteignez une valorisation de 1 milliard de dollars' },
    decacorn: {
      name: 'Décacorne',
      condition: 'Atteindre une valorisation de 10 milliards de dollars',
    },
    'everyone-online': {
      name: 'Tout le monde en ligne',
      condition: 'Atteignez 6 milliards d’utilisateurs',
    },
    'warm-start': {
      name: 'Démarrage à chaud',
      condition: 'Mettez à l’échelle un service JVM pendant un pic sans dégradation du p99',
    },
    'rule-of-40': {
      name: 'Règle des 40',
      condition: "Atteindre une règle de 40 avec un score de 80 en tant qu'société cotée",
    },
    'beat-and-raise': {
      name: 'Battre et relancer',
      condition: 'Battre les prévisions huit trimestres de suite',
    },
    'serial-founder': {
      name: 'Fondateur de la série',
      condition: 'Réaliser une cession avec chaque activité',
    },
    'two-hard-things': {
      name: 'Deux choses difficiles',
      condition: 'Vivre un incident de lecture périmée sur un cache',
    },
    'conways-law': {
      name: 'Loi de Conway',
      condition: 'Avoir plus de services que d’équipes, puis corriger',
    },
    fallacies: {
      name: 'Sophismes',
      condition: 'Vivre les huit idées reçues de l’informatique distribuée dans des incidents',
    },
    'thundering-herd': {
      name: 'Troupeau tonitruant',
      condition: 'Survivre à une tempête de reconnexions sans erreur',
    },
    runbook: {
      name: 'Procédure',
      condition: 'Faire résoudre un incident de lui-même, sans action du joueur',
    },
    finops: {
      name: 'FinOps',
      condition: 'Exploiter une flotte avec des nœuds réservés, à la demande et spot à la fois',
    },
    'spot-the-difference': {
      name: 'Cherchez la différence',
      condition: 'Survivre à une reprise de nœud spot sans erreur',
    },
    'let-it-crash': {
      name: 'Laissez-le planter',
      condition: 'Faire survivre un service Elixir à 1 000 plantages sans requête en échec',
    },
  },
  backups: {
    none: { name: 'Aucun' },
    nightly: { name: 'Tous les soirs' },
    pitr: { name: 'PITR' },
  },
  buildGroups: {
    edge: { label: 'Bord' },
    compute: { label: 'Calcul' },
    data: { label: 'Données' },
    ops: { label: 'Opérations' },
  },
  cacheKeys: {
    full: { name: 'Chemin, requête et cookies' },
    query: { name: 'Chemin et requête' },
    path: { name: 'Chemin seul' },
  },
  cacheStrategies: {
    aside: { name: 'Cache-aside' },
    'read-through': { name: 'Lecture traversante' },
    'write-through': { name: 'Écriture traversante' },
    'write-behind': { name: 'Écriture différée' },
  },
  collectors: {
    g1: { label: 'G1' },
    parallel: { label: 'Parallèle' },
    zgc: { label: 'ZGC' },
  },
  components: {
    users: {
      name: 'Utilisateurs',
      product: 'Internet',
      blurb:
        'Là où commence le trafic. Un domaine est résolu en un seul hôte, les utilisateurs prennent donc un seul lien.',
    },
    payments: {
      name: 'Paiements',
      product: 'Factures',
      blurb: 'Les revenus attendent ici. Le tiroir en contient environ une minute.',
    },
    analytics: {
      name: 'Analytique',
      product: 'OpenTelemetry',
      blurb:
        'Liez-y n’importe quel nœud. Il échantillonne ce trafic et le transforme en connaissances.',
    },
    server: {
      name: 'Serveur applicatif',
      product: 'Machine virtuelle',
      blurb: 'Exécute votre code. Répond aux demandes et envoie des requêtes à la base de données.',
    },
    database: {
      name: 'Base de données',
      product: 'PostgreSQL ou MySQL',
      blurb:
        'La source de vérité. Postgres crée un processus par connexion ; MySQL donne un thread à chacune.',
    },
    dns: {
      name: 'DNS',
      product: 'Route 53',
      blurb:
        "Tournoi à la ronde sur jusqu'à 8 hôtes. Pas de contrôle de santé : un hôte mort garde sa part.",
    },
    lb: {
      name: 'Répartiteur de charge',
      product: 'NGINX',
      blurb:
        'Répartit le trafic entre les serveurs applicatifs et supprime un hôte mort lors de son prochain contrôle de santé.',
    },
    pooler: {
      name: 'Pool de connexions',
      product: 'PgBouncer',
      blurb: "De nombreuses connexions d'applications partagent 20 connexions de base de données.",
    },
    cache: {
      name: 'Cache',
      product: 'Redis',
      blurb:
        "Les réponses lisent les requêtes de la mémoire pendant que les données chaudes s'adaptent. Les écritures passent et invalident.",
    },
    replica: {
      name: 'Réplique en lecture',
      product: 'Réplique PostgreSQL',
      blurb:
        'Les réponses sont lues. En retard sur les écritures, certaines lectures API reviennent obsolètes.',
    },
    auth: {
      name: "Fournisseur d'authentification",
      product: 'Auth0',
      blurb: 'Hache les mots de passe pour vous. Facturé par utilisateur.',
    },
    search: {
      name: 'Moteur de recherche',
      product: 'Elasticsearch',
      blurb: 'Répond aux requêtes de recherche. 400 par seconde par pas de taille.',
    },
    storage: {
      name: 'Stockage objet',
      product: 'Amazon S3',
      blurb: "Contient les fichiers téléchargés. Aucune limite. Payez ce qu'il stocke.",
    },
    doc: {
      name: 'Base documentaire',
      product: 'MongoDB, Firestore',
      blurb:
        'Stocke des documents plutôt que des lignes. Pas de jointures ni de connexions à mutualiser : un débit unique pour les lectures et les écritures, et chaque requête a besoin de son propre index.',
    },
    queue: {
      name: 'File d’attente',
      product: 'RabbitMQ',
      blurb:
        "Cela demande du travail maintenant pour que les processus puissent le faire plus tard. Les utilisateurs attendent uniquement la mise en file d'attente.",
    },
    worker: {
      name: 'Processus',
      product: 'Sidekiq',
      blurb:
        "Exécute votre code sur les tâches d'une file d'attente. Les utilisateurs ne l'attendent jamais. Liez-le aux données lues par une exportation.",
    },
    log: {
      name: 'Flux d’événements',
      product: 'Apache Kafka',
      blurb:
        'Un journal, pas une file : les événements restent après lecture, donc un consommateur peut les rejouer. Chaque consommateur lit une partition et prend son propre retard.',
    },
    fn: {
      name: 'Fonction serverless',
      product: 'AWS Lambda',
      blurb:
        'Exécute votre code à la requête, sans machine à payer : rien quand il dort, un démarrage à froid quand il se réveille, et 1 000 exécutions à la fois.',
    },
    cdn: {
      name: 'CDN',
      product: 'Cloudflare',
      blurb:
        "Répond aux pages pouvant être mises en cache à proximité de l'utilisateur. La sortie depuis le bord coûte moins cher.",
    },
    waf: {
      name: 'WAF',
      product: 'ModSecurity',
      blurb:
        "Bloque les robots avant qu'ils n'atteignent l'application, ainsi que certains utilisateurs réels avec eux.",
    },
    gw: {
      name: 'Passerelle API',
      product: 'Kong',
      blurb:
        'Limite le débit et achemine les appels API. Au-delà de sa limite, les requêtes échouent en throttled, et chaque requête est facturée.',
    },
    ws: {
      name: 'Hub temps réel',
      product: 'Socket.IO',
      blurb:
        'Garde une connexion ouverte pour chaque message temps réel. Le nombre qui tient dépend du runtime.',
    },
    psp: {
      name: 'Fournisseur de paiement',
      product: 'Stripe',
      blurb: 'Cartes de frais pour les caisses. 2,9 % plus 0,30 $ par paiement.',
    },
    autoscaler: {
      name: "Mise à l'échelle automatique",
      product: 'Groupe d’autoscaling',
      blurb:
        "Associez-y des serveurs applicatifs ou des processus. Il ajoute des copies lorsqu'elles fonctionnent à chaud et les supprime lorsqu'elles sont inactives.",
    },
    ci: {
      name: 'Pipeline CI/CD',
      product: 'GitHub Actions',
      blurb:
        "Livre ce qui attend. Sa stratégie de déploiement fixe la durée d'un déploiement, son coût, et la gravité d'un mauvais déploiement.",
    },
    cluster: {
      name: 'Grappe Kubernetes',
      product: 'Kubernetes',
      blurb:
        'Associez-y des serveurs applicatifs ou des processus. Ils sont regroupés sur des nœuds partagés : 15 % de dépenses en moins, copies en 30 s.',
    },
    warehouse: {
      name: 'Entrepôt de données',
      product: 'BigQuery',
      blurb:
        'Les réponses rapportent les analyses en colonnes. 1,5 s chacun, sans limite, payé par scan.',
    },
    vec: {
      name: 'Index vectoriel',
      product: 'pgvector, Pinecone, Qdrant',
      blurb:
        'Répond aux recherches de plus proches voisins sur vos plongements. L’index tient en mémoire, et une requête qui l’atteint rapporte plus.',
    },
    gpu: {
      name: 'Nœud GPU',
      product: 'vLLM sur NVIDIA',
      blurb: 'Sert les requêtes IA en jetons par seconde. Chaque étape de taille double les GPU.',
    },
    edge: {
      name: 'Fonction Edge',
      product: 'Cloudflare Workers',
      blurb:
        'Exécute de petits gestionnaires au plus près de l’utilisateur : 5 ms, pas de démarrage à froid, et un plafond de CPU au lieu d’une machine.',
    },
    llm: {
      name: 'LLM API',
      product: 'Un modèle hébergé',
      blurb: 'Sert les requêtes IA sans GPU. Payé par jeton et tarif limité.',
    },
    msgp: {
      name: 'Fournisseur Push',
      product: 'Amazon SNS',
      blurb: 'Envoie des notifications push et des e-mails. Payé par message, 10 000 par seconde.',
    },
    wide: {
      name: 'Magasin à larges colonnes',
      product: 'Apache Cassandra',
      blurb: 'Réplique chaque clé sur N nœuds. Lit, demande à R, écrit, attend W.',
    },
    dsql: {
      name: 'Distribué SQL',
      product: 'CockroachDB',
      blurb: 'SQL sur Raft. Chaque écriture attend la majorité de ses répliques.',
    },
    cdc: {
      name: 'Connecteur CDC',
      product: 'Debezium',
      blurb:
        'Reliez-lui une base de données. Il lit chaque modification dans le journal d’écriture et la publie dans un flux d’événements, donc l’application n’écrit jamais deux fois.',
    },
    mesh: {
      name: 'Maillage de services',
      product: 'Istio',
      blurb:
        'Reliez-lui des serveurs applicatifs et des workers. Un proxy à côté de chacun réessaie et coupe ses appels, et les surveille : +1 ms par saut, et 5 % de son CPU.',
    },
    ff: {
      name: 'Drapeaux de fonctionnalités',
      product: 'LaunchDarkly',
      blurb:
        'Déploie une fonctionnalité auprès de 5 %, 25 %, 50 % ou de tous les utilisateurs, et la coupe en un clic. Un mauvais déploiement n’atteint que la part qui l’a.',
    },
    pki: {
      name: 'Secrets et certificats',
      product: 'Let’s Encrypt',
      blurb:
        'Garde les clés et renouvelle les certificats TLS avant leur expiration. Sans lui en marche, le certificat expire au calendrier et le site tombe.',
    },
  },
  dbRetentions: {
    keep: { name: 'Tout conserver' },
    archive: { name: 'Archiver après 30 j' },
    delete: { name: 'Supprimer après 30 j' },
  },
  deployStrategies: {
    recreate: { name: 'Recréation' },
    rolling: { name: 'Progressive' },
    'blue-green': { name: 'Bleu-vert' },
    canary: { name: 'Canari' },
  },
  deviceInfo: {
    desktop: { name: 'Ordinateur' },
    mobile: { name: 'Mobile' },
    tablet: { name: 'Tablette' },
  },
  dockGroups: {
    edge: { label: 'Bord' },
    compute: { label: 'Calcul' },
    data: { label: 'Données' },
    messaging: { label: 'Messagerie' },
    platform: { label: 'Plateforme' },
    insight: { label: 'Observabilité' },
    managed: { label: 'Géré' },
  },
  eras: [
    {
      name: 'Garage',
      question: 'Jusqu’où va une boîte ?',
      arrivals: 'Pages vues et lectures API.',
    },
    {
      name: 'Pré-amorçage',
      question: "Que se passe-t-il lorsque la base de données constitue le goulot d'étranglement ?",
      arrivals:
        "Écrit en concurrence pour la base de données. Les recrutements s'ouvrent. Les incidents commencent.",
    },
    {
      name: 'Amorçage',
      question:
        "Que se passe-t-il lorsqu'un type de serveur d'applications ne peut pas servir tous les types ?",
      arrivals:
        "Recherche, téléchargements et robots. Files d'attente, processus, un CDN et un WAF.",
    },
    {
      name: 'Série A',
      question: "Que se passe-t-il lorsqu'une zone entière tombe en panne ?",
      arrivals:
        "Vidéo, chat, paiement et enchères. Zones, mise à l'échelle automatique et budget d'erreur.",
    },
    {
      name: 'Série B',
      question:
        "Que se passe-t-il lorsque l'analyse et l'IA partagent une base de données conçue pour les caisses ?",
      arrivals: 'Exportations, rapports et invites IA. Entrepôts, GPU, tentatives et disjoncteurs.',
    },
    {
      name: 'Série C',
      question: 'Que se passe-t-il lorsque vos utilisateurs vivent sur quatre continents ?',
      arrivals: 'Flux, webhooks et push. Régions, GeoDNS, quorums et consensus.',
    },
    {
      name: 'Pré-IPO',
      question: 'Pouvez-vous prouver que l’entreprise est prête à entrer en bourse ?',
      arrivals:
        'La liste de contrôle IPO : fiabilité, SOC 2, un exercice DR, résidence des données, la règle des 40.',
    },
    {
      name: 'Cotée en bourse',
      question: 'Pouvez-vous battre vos prévisions chaque trimestre ?',
      arrivals: 'Trimestres, guidance et multiple boursier. Le jeu est sans fin.',
    },
  ],
  exits: {
    'acqui-hire': { name: 'Acquérir-embaucher' },
    acquisition: { name: 'Acquisition' },
    ipo: { name: 'Introduction en bourse' },
    'step-down': { name: 'Descendez' },
  },
  families: {
    burstable: {
      name: 'À capacité extensible',
      blurb:
        "Pas cher. Gagne des crédits CPU lorsqu'ils sont inactifs et tombe à 20 % CPU lorsqu'ils sont épuisés.",
    },
    general: { name: 'Généraliste', blurb: '1 processeur virtuel : 4 Go.' },
    compute: { name: 'Calcul', blurb: '1 processeur virtuel : 2 Go.' },
    memory: { name: 'Mémoire', blurb: '1 processeur virtuel : 8 Go.' },
    arm: {
      name: 'ARM',
      blurb:
        'Comme General pour 20 % de moins. Certains runtimes et bibliothèques demandent un travail de portage.',
    },
  },
  features: {
    'landing-page': { name: 'Page de présentation', effect: 'Marché +20%, pages vues +10%' },
    'signup-flow': {
      name: 'Parcours d’inscription',
      effect: 'Croissance +15%, les écritures arrivent tôt',
    },
    pagination: {
      name: 'Pagination',
      effect: 'Les lectures API envoient la moitié des octets',
      hidden: 'Ajoute une forme de requête sans index',
    },
    'password-login': {
      name: 'Connexion par mot de passe',
      effect: 'Les connexions arrivent : 80 ms de CPU chacune',
    },
    'paid-plans': {
      name: 'Forfaits payants',
      effect: 'Les écritures rapportent 30 % de plus, plus les abonnements',
    },
    'email-digests': {
      name: 'Résumés par e-mail',
      effect:
        'Attrition −10 %. Les résumés partent en une rafale de tâches : deux fois plus d’exportations, 400 ms de CPU et 50 lectures chacune',
      hidden: 'L’envoi est une rafale de tâches',
    },
    'search-filters': {
      name: 'Filtres de recherche',
      effect: 'Les recherches rapportent 25 % de plus',
      hidden: 'Chaque requête de recherche coûte 40 % de plus',
    },
    'profile-photos': {
      name: 'Photos de profil',
      effect: 'Croissance +10%, les uploads arrivent : 120 ms de CPU chacun',
    },
    'public-api': {
      name: 'API publique',
      effect: 'Marché +25%, API lit +30%',
      hidden: 'Bots +50 %',
    },
    'infinite-scroll': {
      name: 'Défilement infini',
      effect: 'Les lectures API rapportent 10 % de plus et les utilisateurs envoient 40 % de plus',
    },
    video: { name: 'Vidéo', effect: 'Marché +40%, la vidéo arrive : 5 Mo chacune' },
    chat: {
      name: 'Messagerie',
      effect: 'Churn −20 %, les messages en temps réel maintiennent les connexions ouvertes',
    },
    checkout: {
      name: 'Commander',
      effect: 'Arrivée des caisses : 25 $ chacune, via le fournisseur de paiement',
    },
    'notifications-center': {
      name: 'Centre de notifications',
      effect: 'Croissance +10%, temps réel +20%',
    },
    'mobile-app': { name: 'Application mobile', effect: 'Marché +60%, API lit +50%' },
    'data-export': {
      name: 'Exportation de données',
      effect:
        'Les écritures rapportent 20 % de plus. Les exportations arrivent : 400 ms de CPU et 50 lectures chacune',
    },
    dashboards: {
      name: 'Tableaux de bord',
      effect: 'Marché +10%. Les rapports arrivent : un tableau scanné chacun',
    },
    'ai-assistant': {
      name: 'Assistant IA',
      effect: 'Les invites IA arrivent : 8 $ chacune, servies par un nœud GPU ou le LLM API',
    },
    recommendations: {
      name: 'Recommandations',
      effect: 'Vidéo +30%',
      hidden: 'Exportations +30% : les trains miniatures en batch',
    },
    'audit-log': {
      name: "Journal d'audit",
      effect: 'Marché +10% : les entreprises peuvent acheter',
      hidden: "Chaque requête d'écriture coûte 20 % de plus",
    },
    'activity-feed': {
      name: "Flux d'activité",
      effect:
        'Marché +50%. Les flux arrivent : 20 lectures chacun, ou une chronologie avec répartition en écriture',
    },
    webhooks: {
      name: 'Webhooks',
      effect: 'Marché +20%. Arrivée des webhooks : appels de 800 ms vers les serveurs clients',
    },
    'push-notifications': {
      name: 'Notifications push',
      effect: 'Croissance +15%. Les notifications arrivent, via le fournisseur Push',
      hidden: 'Attrition +5% : les utilisateurs s’en lassent',
    },
    localization: { name: 'Localisation', effect: 'Marché +40% hors Amérique du Nord' },
    'offline-mode': {
      name: 'Mode hors ligne',
      effect: 'Attrition −10%',
      hidden: 'Écrit +10 % : les appareils se synchronisent en rafale lors de la reconnexion',
    },
    'single-sign-on': {
      name: 'Authentification unique',
      effect: 'Marché +10 % : les entreprises se connectent avec SAML',
    },
    'data-residency': {
      name: 'Résidence des données',
      effect:
        "Requis pour le marché européen : les données de l'UE restent dans une région de l'UE",
    },
    'status-page': {
      name: "Page d'état",
      effect: 'Attrition −10% : les utilisateurs voient que vous intervenez',
    },
    'usage-pricing': {
      name: "Tarification basée sur l'utilisation",
      effect: 'Les exportations, écritures, invites et webhooks rapportent 15 % de plus',
    },
  },
  frameworks: {
    none: {
      name: 'Sans framework',
      blurb: 'Rapide à l’exécution, lent pour développer des fonctionnalités.',
    },
    laravel: {
      name: 'Laravel',
      blurb:
        "Livre des fonctionnalités vite, et le travail d'arrière-plan coûte 20 % d'heures de dev en moins. 1,8× le CPU (1,1× en mode worker), et Eloquent fait 3 requêtes de lecture là où 1 suffirait.",
    },
    rails: {
      name: 'Rails',
      blurb:
        'Expédie les fonctionnalités rapidement, les pages vues rapportent 20 % de plus. 1,5× CPU et requêtes N+1.',
    },
    express: {
      name: 'Express',
      blurb:
        'Minimal et partout. 1,1× le CPU, et la prolifération des middlewares fait croître la dette technique 10 % plus vite.',
    },
    django: {
      name: 'Django',
      blurb:
        "Livre des fonctionnalités vite, et les outils internes coûtent 30 % d'heures de dev en moins grâce au site d'administration. 1,4× le CPU et des requêtes N+1.",
    },
    symfony: {
      name: 'Symfony',
      blurb:
        'Structure stricte : 30 % de coordination en moins et une dette technique 30 % plus lente. 1,5× le CPU et aucune requête N+1.',
    },
    sinatra: { name: 'Sinatra', blurb: 'Léger. CPU ×1,1.' },
    flask: { name: 'Flask', blurb: 'Léger. CPU ×1,1.' },
    gin: { name: 'Gin', blurb: 'Un routeur léger. CPU ×1,05.' },
    'spring-boot': {
      name: 'Spring Boot',
      blurb:
        'Structure pour les grandes équipes : 30 % de coordination en moins. 1,3× le CPU, 200 Mo de plus et 15 s de plus au démarrage.',
    },
    aspnet: { name: 'ASP.NET Core', blurb: 'Rapide et complet. CPU ×1,05.' },
    phoenix: { name: 'Phoenix', blurb: 'Les pages LiveView gagnent 30 % de plus. 1,1 × CPU.' },
    axum: { name: 'Axum', blurb: 'Construit sur Tokio et Tower. Pas de CPU supplémentaire.' },
    actix: { name: 'Actix Web', blurb: 'Parmi les plus rapides des benchmarks. 0,95 × CPU.' },
    fastapi: {
      name: 'FastAPI',
      blurb:
        'Validation avec Pydantic et le meilleur écosystème pour relier les modèles : les requêtes `ai` rapportent 15 % de plus. 1,15× le CPU, uniquement sur un serveur ASGI. 10 Mo.',
    },
    fastify: {
      name: 'Fastify',
      blurb:
        'Sérialisation basée sur des schémas : les lectures coûtent 20 % de CPU en moins. Aucun surcoût propre. 5 Mo.',
    },
    nextjs: {
      name: 'Next.js',
      blurb:
        'Rendu côté serveur et régénération statique incrémentale : les pages rapportent 50 % de plus, pour 1,6× leur CPU, et un CDN peut en servir 40 %. 30 Mo par processus.',
    },
    nestjs: {
      name: 'NestJS',
      blurb:
        'Structure pour les grandes équipes : 30 % de coordination en moins. 1,3× le CPU et 20 Mo par processus.',
    },
    fiber: {
      name: 'Fiber',
      blurb:
        'Une API de style Express sur fasthttp : aucun surcoût CPU et pas de HTTP/2. 5 Mo par processus.',
    },
    quarkus: {
      name: 'Quarkus',
      blurb:
        'Conçu pour les images natives : un build GraalVM prend moitié moins de temps. 1,1× le CPU et 100 Mo par processus.',
    },
    hono: {
      name: 'Hono',
      blurb: 'Un petit routeur sur les standards du Web : aucun surcoût CPU. 2 Mo par processus.',
    },
    elysia: {
      name: 'Elysia',
      blurb:
        'Conçu pour Bun, avec des types vérifiés du serveur au client : la dette technique croît 15 % moins vite. Aucun surcoût CPU. 5 Mo par processus.',
    },
    koa: {
      name: 'Koa',
      blurb:
        'Le successeur d’Express, bâti sur les fonctions async : 1,05× le CPU. 5 Mo par processus.',
    },
    adonis: {
      name: 'AdonisJS',
      blurb:
        'Les idées de Laravel sur Node.js : livre vite des fonctionnalités. 1,4× le CPU, 25 Mo par processus, et l’ORM Lucid fait des requêtes N+1.',
    },
    codeigniter: {
      name: 'CodeIgniter',
      blurb: 'Un petit framework PHP qui ne gêne pas : 1,1× le CPU. 4 Mo par processus.',
    },
    sanic: {
      name: 'Sanic',
      blurb: 'Asynchrone de bout en bout : 1,05× le CPU. 10 Mo par processus.',
    },
    rocket: {
      name: 'Rocket',
      blurb:
        'Un routage typé avec peu de code répétitif : le plus rapide à écrire en Rust. 1,05× le CPU. 3 Mo par processus.',
    },
  },
  glossary: {
    annotation: {
      term: 'Annotation',
      definition:
        "Marqueur sur un graphique de série chronologique pour un événement, tel qu'un déploiement, un changement de configuration ou un incident. Cela donne à un changement dans un graphique une cause visible.",
      inGame:
        "Chaque série temporelle sur le tableau de bord trace des lignes verticales étiquetées pour cinq types d’événements : modifications d’architecture (bleu, une par modification que vous pouvez encore annuler), déploiements (violet), incidents (rouge), recherche (vert) et événements de l’entreprise (rose). Un interrupteur par groupe dans la barre de variables le masque. Utilisez ces lignes pour vérifier qu'un graphique a bougé après votre correctif, et non avant.",
      links: [{ label: 'Documents Grafana : Annoter des visualisations' }],
      design: [{ label: 'Annotations du tableau de bord' }],
    },
    anycast: {
      term: 'Anycast',
      definition:
        "Une méthode de routage où de nombreux serveurs situés à différents endroits annoncent la même adresse IP. Le routage Internet (BGP) envoie chaque utilisateur vers le serveur le plus proche, de sorte que les utilisateurs se connectent à un serveur proche et qu'un flot se propage à tous.",
      inGame:
        "L'Anycast retire 20 ms du saut de l'utilisateur dans chaque région. C'est une recherche de Série C qui nécessite d'abord GeoDNS. GeoDNS envoie les utilisateurs de chaque région vers leur propre région, ou vers la région la plus proche encore disponible.",
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce que Anycast ?" },
        { label: 'RFC 4786 : Fonctionnement des services Anycast' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    apdex: {
      term: 'Apdex',
      definition:
        "Indice de performance des applications : un score de 0 à 1 indiquant le degré de satisfaction des utilisateurs concernant le temps de réponse. Les requêtes plus rapides qu'une cible T sont satisfaites et comptent entièrement, les requêtes jusqu'à 4T tolèrent et comptent la moitié, et les requêtes plus lentes ou échouées comptent zéro.",
      inGame:
        "Chaque type de requête a son propre T : 400 ms pour une vue de page, 200 ms pour une lecture API, 800 ms pour une connexion. Une requête gagne sa valeur multipliée par son Apdex, donc une requête tolérante en rapporte la moitié. Les utilisateurs grandissent tandis que Apdex dépasse l'objectif de l'étape (0,85 en garage, jusqu'à 0,94 en public) et partent lorsqu'il tombe en dessous.",
      links: [
        { label: 'Wikipédia' },
        { label: 'Nouveaux documents Relic : Apdex' },
        { label: "Le groupe d'utilisateurs Apdex" },
      ],
      design: [{ label: 'Apdex et revenus' }],
    },
    'async-io': {
      term: 'Entrées-sorties asynchrones',
      definition:
        "Un moyen de démarrer une opération réseau ou disque et d'effectuer d'autres tâches jusqu'à ce qu'elle soit terminée, au lieu de bloquer un thread pendant qu'il attend. Un thread peut alors conserver de nombreuses requêtes en cours. Node.js, .NET async et Tokio de Rust sont construits dessus.",
      inGame:
        "Node.js, Kestrel (C#) et Tokio (Rust) ne disposent d'aucun emplacement de travail pendant qu'une requête attend la base de données, donc une requête lente n'utilise pas leur capacité. Un processus PHP-FPM ou Gunicorn est retenu pendant toute l'attente. Les runtimes asynchrones maintiennent également les connexions en temps réel ouvertes pendant quelques Ko chacune (Tokio 5 Ko, Node.js 20 Ko), tandis que PHP et Gunicorn les refusent.",
      links: [
        { label: 'Node.js : bloquant ou non bloquant' },
        { label: 'Documents Python : asyncio' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Modèles de concurrence' }],
    },
    'at-least-once-delivery': {
      term: 'Livraison au moins une fois',
      definition:
        "Une garantie de livraison où le système renvoie un message ou un appel jusqu'à ce qu'il soit accusé de réception. Rien ne se perd, mais certains messages arrivent plusieurs fois, les consommateurs doivent donc être idempotents.",
      inGame:
        "Un nouvel appel peut arriver deux fois. Dans l'incident de double facturation, les frais expirent et réessayent, et certains clients paient deux fois jusqu'à ce que vous recherchiez les clés d'idempotence ou que vous arrêtiez les tentatives sur le lien de facturation. Dans l'incident de message empoisonné, une tâche qui échoue toujours revient sans cesse et les processus y consacrent 90 % de leur temps. Activez la file d'attente de messages non traités de la file d'attente pour l'empêcher ou supprimez le message pour y mettre fin.",
      links: [
        { label: 'Documents AWS : Livraison au moins une fois SQS' },
        { label: 'RabbitMQ : Remerciements des consommateurs' },
        { label: 'RabbitMQ : Guide de fiabilité' },
      ],
      design: [{ label: 'Sémantique de livraison' }],
    },
    autoscaling: {
      term: "Mise à l'échelle automatique",
      definition:
        "Ajout et suppression automatique de machines afin que la capacité suive la demande. Un contrôleur surveille un signal tel que l'utilisation du CPU, le compare à une cible et modifie le nombre de copies. Le démarrage d'une nouvelle capacité prend du temps, c'est pourquoi l'autoscaling suit bien les changements lents de charge et mal les pics soudains.",
      inGame:
        'L’autoscaler (recherche Mise à l’échelle automatique) contrôle les serveurs applicatifs et les workers que vous lui reliez. Quand un nœud dépasse sa cible (40 %, 60 % ou 80 % du CPU ou de toute sa charge), il demande plus de copies, jusqu’à un maximum de 4, 8, 16 ou aucune limite. Les nouvelles copies servent après 180 s sur VM ou 30 s dans un cluster Kubernetes, et elles démarrent à froid. Il retire une copie quand la charge passe sous 60 % de la cible, et il agit au plus une fois toutes les 30 s : gardez de la marge pour un pic soudain. La recherche Mise à l’échelle planifiée lui fait prévoir le pic connu : deux heures calendaires avant l’heure de pointe de la venture, il dimensionne pour la charge du pic, afin que les copies soient chaudes à son arrivée.',
      links: [
        { label: "AWS : Qu'est-ce qu'Amazon EC2 Auto Scaling ?" },
        { label: "Kubernetes : mise à l'échelle automatique des pods horizontaux" },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'availability-zone': {
      term: 'Zone de disponibilité',
      definition:
        "Un centre de données isolé, ou un groupe de centres de données, au sein d'une région cloud, avec sa propre alimentation, son propre système de refroidissement et son propre réseau. Les zones d'une région sont suffisamment proches pour des liaisons rapides et suffisamment éloignées les unes des autres pour qu'une panne en entraîne rarement deux.",
      inGame:
        "Le jeu appelle ces zones. Après une recherche sur plusieurs zones, vous pouvez placer chaque nœud zoné dans la zone a, b ou c et donner à une base de données, un pooler, un cache, un moteur de recherche ou une file d'attente une veille dans une autre zone à deux fois sa gravure. Un appel entre zones coûte 1 ms de plus et 0,01 $ par Go de sortie dans les deux sens. Une panne de zone supprime tous les nœuds d'une zone ; un Standby prend le relais au bout d'environ 20 s et les copies dans une autre zone continuent à fonctionner.",
      links: [
        { label: 'AWS : régions et zones' },
        {
          label:
            "Bibliothèque des constructeurs AWS : stabilité statique à l'aide des zones de disponibilité",
        },
        { label: 'Google Cloud : régions et zones' },
      ],
      design: [],
    },
    backpressure: {
      term: 'Contre-pression',
      definition:
        "Signal provenant d'un consommateur lent qui indique aux producteurs de ralentir ou de s'arrêter, de sorte qu'un tampon ou une file d'attente ne s'allonge pas sans limite. Sans cela, le retard s’accumule jusqu’à épuisement de la mémoire ou de la latence.",
      inGame:
        "La longueur max. de la file d'attente est ce qui se rapproche le plus de la contre-pression : au-delà, la file refuse les nouvelles tâches, et l'envoi ou l'export qui en a envoyé une échoue. Sans limite, la profondeur de la file augmente lorsque les Workers drainent les tâches plus lentement qu'elles n'arrivent. Une nouvelle tâche attend derrière l'arriéré, et les utilisateurs jugent un envoi ou un export au moment où son résultat est prêt : au-delà de 40 s pour un envoi, ou de 4 minutes pour un export, ils sont frustrés. Ajoutez des Workers ou agrandissez-les pour réduire la profondeur.",
      links: [
        {
          label: "Bibliothèque AWS Builders : éviter les retards de file d'attente insurmontables",
        },
        { label: 'Node.js : Contre-pression dans les ruisseaux' },
      ],
      design: [{ label: 'File d’attente' }],
    },
    bcrypt: {
      term: 'bcrypt',
      definition:
        'Une fonction de hachage de mot de passe de 1999, basée sur le chiffre Blowfish, avec un sel intégré et un coût réglable. Chaque étape de coût double le travail, de sorte que les hachages stockés restent lents à se fissurer à mesure que le matériel devient plus rapide. La même lenteur coûte au serveur CPU à chaque connexion.',
      inGame:
        "Une connexion coûte 80 ms de CPU pour le hachage, et un temps d'exécution plus rapide ne le raccourcit pas. Dans le bloc de boucle d'événement Incident, le coût passe de 10 à 12 tours, soit 4 × le CPU par connexion. Dans le Credential stuffing, les robots envoient 20 fois les connexions. Un fournisseur d'authentification (identité gérée) supprime le hachage de vos serveurs applicatifs moyennant un prix par utilisateur.",
      links: [
        {
          label:
            "Provos et Mazieres : un système de mot de passe adaptable à l'avenir (USENIX 1999)",
        },
        { label: 'OWASP : aide-mémoire pour le stockage des mots de passe' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Types de requêtes' }],
    },
    'binary-rpc': {
      term: 'RPC binaire',
      definition:
        'Un appel de procédure à distance qui encode ses messages dans un format binaire, comme Protocol Buffers sur gRPC, plutôt qu’en texte comme JSON. La charge utile est plus petite et moins coûteuse à analyser, au prix d’un schéma que les deux côtés doivent partager.',
      inGame:
        'La recherche RPC binaire entre services divise par deux le CPU qu’un serveur applicatif ou un worker consacre à sérialiser chaque appel interne : 0,02 ms de référence par appel deviennent 0,01. Cela se voit sur la jauge CPU des nœuds qui émettent les appels : une conception à court de CPU sert davantage sur les mêmes machines.',
      links: [{ label: 'Documentation gRPC : introduction à gRPC' }],
      design: [{ label: 'Recherche en performance' }],
    },
    'bgp-border-gateway-protocol': {
      term: 'BGP (protocole de routage interdomaines)',
      definition:
        "Protocole utilisé par les réseaux sur Internet pour se communiquer les adresses IP qu'ils peuvent atteindre. Si un réseau retire ses routes par erreur, le reste d’Internet ne peut plus le trouver, même si ses serveurs fonctionnent toujours.",
      inGame:
        "L'incident de mauvaise configuration BGP peut démarrer en série C. Un changement de routage retire votre entreprise d'Internet : chaque demande des utilisateurs échoue comme étant indisponible, dans chaque région, pendant 120 s maximum. Aucune recherche ne l'empêche, et le réalisateur le choisit rarement. Appuyez sur Revenir en arrière sur l'incident pour y mettre fin immédiatement.",
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce que BGP ?" },
        { label: 'RFC 4271 : BGP-4' },
        { label: 'Meta Engineering : Plus de détails sur la panne du 4 octobre' },
      ],
      design: [],
    },
    'blast-radius': {
      term: 'Rayon d’impact',
      definition:
        "La part d'un système, de ses utilisateurs ou de son trafic affectée par une panne. L'isolation des défauts, tels que les zones, les cellules et les petits déploiements, maintient le rayon d'explosion petit.",
      inGame:
        "Une panne de zone supprime tous les nœuds de cette zone. Avec plusieurs zones, vous pouvez répartir les copies sur trois zones et donner à un nœud de données une veille qui prend le relais en quelques secondes. Un déploiement incorrect échoue dans 8 % des requêtes du serveur d'applications pour chaque élément expédié, jusqu'à 40 %, donc des déploiements plus petits cassent moins, et il ne casse que le trafic du service qui l'a livré. Sur Node.js, une requête lente bloque chaque requête sur sa boucle d'événements, tandis que BEAM sépare chaque requête.",
      links: [
        { label: "AWS Well-Architected : Utiliser l'isolation des pannes" },
        { label: 'Livre blanc AWS : Architecture basée sur les cellules' },
      ],
      design: [{ label: 'Profils de langage' }, { label: 'Pipeline CI/CD' }],
    },
    'blue-green-deployment': {
      term: 'Déploiement bleu-vert',
      definition:
        "Une méthode de release avec deux environnements de production identiques. Vous déployez la nouvelle version sur la version inactive, y basculez tout le trafic en même temps et revenez en arrière en cas d'échec, la restauration est donc rapide.",
      inGame:
        "Le Pipeline CI/CD propose le bleu-vert comme stratégie de déploiement. L'ancienne flotte continue de servir pendant que la nouvelle démarre et est vérifiée : un mauvais déploiement casse au plus 10 % des requêtes des serveurs applicatifs. Un déploiement prend 7 minutes et coûte le double du Pipeline.",
      links: [
        { label: 'Martin Fowler : BlueGreenDéploiement' },
        { label: 'Livre blanc AWS : Déploiements bleu/vert' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Pipeline CI/CD' }],
    },
    'bot-management': {
      term: 'Gestion des robots',
      definition:
        'Distinguer le trafic automatisé des personnes et le traiter à sa façon : mettre au défi un client suspect, le limiter en débit ou le bloquer, plutôt que faire échouer chaque correspondance de règle.',
      inGame:
        'La recherche Gestion des robots divise par deux les faux positifs d’un WAF et conserve son taux de blocage : un client suspect reçoit un défi, donc un vrai utilisateur signalé charge quand même la page. Les robots ne rapportent toujours rien et coûtent toujours de la capacité quand ils passent, donc le WAF reste la première barrière.',
      links: [
        { label: 'Centre d’apprentissage Cloudflare : qu’est-ce que la gestion des robots ?' },
      ],
      design: [{ label: 'WAF' }],
    },
    'brookss-law': {
      term: 'Loi de Brooks',
      definition:
        '"Ajouter de la main d\'œuvre à un projet logiciel tardif permet d\'y parvenir plus tard", extrait du livre de Fred Brooks de 1975, The Mythical Man-Month. Les nouvelles personnes ont besoin de temps pour monter en puissance, et les voies de communication augmentent plus vite que les effectifs.',
      inGame:
        "La taille effective d'une équipe est n / (1 + 0,08(n − 1) + 0,0004·n(n − 1)), donc 8 personnes travaillent comme environ 5, et au-delà d'environ 48 personnes, une équipe devient plus lente. Une nouvelle recrue travaille également à 30 % pendant sa première semaine civile. La pénalité compte à l'intérieur de chaque équipe, donc diviser les personnes en 4 équipes maximum est utile, et Symfony la réduit de 30 %.",
      links: [
        { label: 'Wikipédia : loi de Brooks' },
        { label: 'Wikipédia : le mois-homme mythique' },
      ],
      design: [{ label: 'Coordination des équipes' }],
    },
    bulkhead: {
      term: 'Cloisonnement',
      definition:
        "Limite de la capacité d'un appelant, telle que les threads, les connexions ou les emplacements, qu'une dépendance peut utiliser. Lorsque cette dépendance ralentit, elle ne remplit que sa propre part et les appels vers d'autres dépendances continuent de fonctionner. Le nom vient des murs qui divisent la coque d'un navire en compartiments.",
      inGame:
        'La recherche Cloisons ajoute un interrupteur à chaque lien. Un lien cloisonné laisse un appel courir 1 000 ms ; au-delà, l’appelant l’abandonne, libère son créneau et la requête échoue en `timeout`, donc une dépendance lente ne peut pas remplir tous les créneaux. C’est un plafond de temps plutôt que d’appels simultanés, ce qui revient au même à charge fixe (loi de Little). Sans elle, chaque appel garde le créneau de l’appelant jusqu’à la réponse ou le délai du lien, 30 s par défaut.',
      links: [
        { label: 'Azure Architecture Center : modèle de cloison' },
        { label: 'Wikipédia : cloison (cloison)' },
      ],
      design: [{ label: 'Réglages des liens' }],
    },
    'burn-rate': {
      term: 'Rythme de consommation',
      definition:
        'À quelle vitesse un service dépense son budget d’erreurs, par rapport au SLO. Un rythme de consommation de 1 dépense exactement tout le budget dans la fenêtre SLO ; un rythme de consommation de 10 le dépense dans un dixième de la fenêtre. Page des équipes sur un rythme de consommation élevé plutôt que sur des erreurs uniques.',
      inGame:
        "Avec les tableaux de bord SLO recherchés, le tableau de bord (D) trace le rythme de consommation du budget d'erreurs au fil du temps : votre taux d'échec divisé par la part d'échecs permise par le SLO. Les lignes marquent 1× et 10× ; au-dessus de 10×, le budget est épuisé bien avant la fin du week-end. Corrigez la cause ou ralentissez vos déploiements jusqu'à ce que la ligne descende en dessous de 1×.",
      links: [{ label: 'Classeur Google SRE : alertes sur les SLO' }],
      design: [{ label: 'Graphiques du tableau de bord' }],
    },
    'bytecode-cache': {
      term: 'Cache de bytecode',
      definition:
        "Un cache qui conserve la forme compilée d'un script afin que l'interpréteur n'analyse pas et ne compile pas la source à chaque exécution. L'OPcache de PHP conserve le bytecode précompilé dans la mémoire partagée et Python écrit des fichiers .pyc pour la même raison.",
      inGame:
        "Sans cache de bytecode, PHP compile chaque script à chaque requête. OPcache recherche (d'après PHP-FPM) multiplie la vitesse CPU des serveurs applicatifs PHP par 2,5. Une boîte PHP qui redémarre fonctionne sans OPcache au début et atteint la valeur maximale de 2,5 × à mesure qu'elle se réchauffe.",
      links: [
        { label: 'Manuel PHP : OPcache' },
        { label: 'PEP 3147 : répertoires du référentiel PYC' },
      ],
      design: [],
    },
    'cache-hit-rate': {
      term: 'Taux de succès du cache',
      definition:
        "La part des recherches auxquelles un cache répond à partir de sa propre copie, sans interroger le système plus lent derrière lui. Un échec va à l'origine ou à la base de données. Un petit changement dans le taux de réussite peut considérablement modifier la charge sur l'origine : passer de 90 % à 80 % double les échecs.",
      inGame:
        "Un cache ou un nœud CDN affiche son taux de réussite sur sa carte. Le taux de réussite d'un cache est la racine carrée de (sa mémoire/données chaudes, environ 200 Ko par utilisateur) × un facteur TTL (60 % à 10 s, 85 % à 60 s, 97 % à 1 h) × une pénalité d'écriture allant jusqu'à 50 % × sa chaleur. Un CDN répond à 70 % des requêtes page et 75 % des médias en 300 s TTL, × 0,8 à 60 s ou × 1,2 à 1 h, au maximum 95 %. Donnez au cache plus de mémoire ou un TTL plus long pour augmenter le taux, mais un TTL plus long sert des lectures plus obsolètes.",
      links: [
        { label: "Cloudflare : Qu'est-ce qu'un taux d'accès au cache ?" },
        { label: 'AWS : bonnes pratiques de mise en cache' },
        { label: 'Bibliothèque des constructeurs AWS : défis et stratégies de mise en cache' },
      ],
      design: [],
    },
    'cache-stampede': {
      term: 'Avalanche de défauts de cache',
      definition:
        'De nombreuses requêtes manquent les mêmes données mises en cache au même moment, par exemple après un redémarrage du cache ou une expiration, et toutes vont ensemble dans la base de données. La charge supplémentaire peut tellement ralentir la base de données que le cache ne se remplit jamais.',
      inGame:
        "Lors de l'incident de bousculade du cache, un cache redémarre vide et chaque échec est envoyé simultanément à la base de données. Lorsque la base de données est occupée à 90 % ou plus, les recharges expirent et le cache reste froid. La protection contre le Stampede permet à un Cache froid d'envoyer seulement 25 % de ses échecs supplémentaires. Le réchauffement du cache le ramène à 80 % après un redémarrage.",
      links: [
        { label: 'Wikipédia' },
        { label: "Nishtala et al. : Mise à l'échelle de Memcache sur Facebook (NSDI 2013)" },
      ],
      design: [{ label: 'Bousculades de cache' }, { label: 'Incident de bousculade du cache' }],
    },
    'cache-warming': {
      term: 'Préchauffage du cache',
      definition:
        "Remplir un cache avec des données probables avant qu'il ne prenne du trafic, afin que les premières requêtes ne manquent pas toutes. Les équipes réchauffent un cache après un redémarrage, un déploiement ou lorsqu'elles ajoutent un nouveau nœud de cache, souvent en chargeant un instantané ou en rejouant les clés récentes.",
      inGame:
        "Un cache qui redémarre revient à froid et chaque échec va à la base de données. Redis recharge lui-même la moitié de ses données et Memcached n'en recharge aucune. Après la Recherche sur le Réchauffement du Cache, vous pouvez activer le Réchauffement sur une carte Cache : le Cache revient alors réchauffé à 80% après un redémarrage ou une bousculade du Cache. La protection contre la bousculade est l’étape qui la précède et gère les échecs qui restent.",
      links: [
        { label: 'Netflix TechBlog : réchauffement du cache' },
        { label: 'Documents Redis : Persistance' },
      ],
      design: [],
    },
    'cache-aside': {
      term: 'Cache-aside',
      definition:
        "Un modèle de mise en cache dans lequel l'application vérifie d'abord le cache. En cas d'échec, il lit la base de données et place le résultat dans le cache, et en cas d'écriture, il met à jour la base de données et invalide l'entrée mise en cache.",
      inGame:
        "Un cache répond aux requêtes de lecture qu'il détient et envoie les erreurs à la base de données. Son taux de réussite est de √ (mémoire / données chaudes) × facteur TTL × chaleur, avec environ 200 Ko de données chaudes par utilisateur. Les écritures sont transmises et invalidées, donc un mixage intensif en écriture réduit le nombre de hits. Un TTL plus long (10 s, 60 s ou 1 h) conserve plus d'accès mais sert davantage de lectures obsolètes.",
      links: [
        { label: 'Azure Architecture Center : modèle de mise en cache' },
        { label: 'AWS : bonnes pratiques de mise en cache' },
      ],
      design: [{ label: 'Stratégies de cache' }],
    },
    'canary-deployment': {
      term: 'Déploiement canari',
      definition:
        "Une méthode de publication qui envoie d'abord une petite part du trafic vers une nouvelle version et compare ses erreurs et sa latence avec l'ancienne version. Si le canari semble en bonne santé, le déploiement se poursuit ; sinon, il est annulé avant que la plupart des utilisateurs ne le voient.",
      inGame:
        "Le Pipeline CI/CD propose le canari comme stratégie de déploiement. Un déploiement envoie d'abord 5 % du trafic vers la nouvelle version : un mauvais déploiement casse donc jusqu'à 5 % des requêtes des serveurs applicatifs jusqu'à ce que vous annuliez. C'est la stratégie la plus lente et la plus chère : déploiements de 10 minutes et 1,5 fois le coût du Pipeline.",
      links: [
        { label: 'Martin Fowler : CanaryRelease' },
        { label: 'Classeur Google SRE : versions Canarying' },
      ],
      design: [{ label: 'Pipeline CI/CD' }],
    },
    'cascading-failure': {
      term: 'Défaillance en cascade',
      definition:
        'Une défaillance qui saute d’une partie d’un système à une autre : un composant lent ou en panne surcharge ses appelants, dont les retries et les files d’attente surchargent à leur tour les leurs. La première défaillance est le déclencheur, et les suivantes transforment un petit incident en un long incident.',
      inGame:
        'À partir de la série A, un incident que personne ne traite peut en déclencher un autre à sa fin, et le second enregistre le premier comme sa cause. Une requête lente laissée seule déclenche une tempête de retries, une tempête de retries déclenche l’épuisement des connexions, et une fuite mémoire déclenche une tempête de pauses GC. Le second incident ne démarre que si la conception y est vulnérable. Le bip nomme la chaîne et la fiche post-mortem dit ce qu’il a suivi. Toute réponse, même un simple accusé de réception, l’empêche de se propager, et une chaîne s’arrête après un saut.',
      links: [
        { label: 'AWS: Automating safe, hands-off deployments' },
        { label: 'Google SRE book: Cascading failures' },
      ],
      design: [{ label: 'Cascades d’incidents' }],
    },
    'cdc-change-data-capture': {
      term: 'CDC (capture des modifications de données)',
      definition:
        "Lecture du journal des modifications d'une base de données, tel que le journal d'écriture anticipée PostgreSQL, et publication de chaque insertion, mise à jour et suppression en tant qu'événement. D'autres systèmes, tels qu'un entrepôt de données ou un index de recherche, restent synchronisés sans interroger la source.",
      inGame:
        'Il existe un connecteur CDC, débloqué par Capture des modifications de données en série B. Reliez-lui une base de données, et lui à un flux d’événements : il lit chaque écriture dans le journal et publie chaque modification comme un événement, à 20 000 modifications par seconde, donc un moteur de recherche ou un entrepôt suit la base sans que l’application écrive deux fois. Il ajoute du retard plutôt que de la latence : l’écriture n’attend jamais la copie.',
      links: [
        { label: 'Wikipédia' },
        { label: 'Documents PostgreSQL : Concepts de décodage logique' },
        { label: 'Documentation Débézium' },
      ],
      design: [{ label: 'Connecteur CDC' }],
    },
    'cdn-content-delivery-network': {
      term: 'CDN (réseau de diffusion de contenu)',
      definition:
        'Un réseau de serveurs de cache répartis dans de nombreux emplacements qui stockent des copies de contenu à proximité des utilisateurs. Une requête à laquelle le edge le plus proche peut répondre n’atteint jamais l’origine, elle est donc plus rapide et ne coûte rien à l’origine.',
      inGame:
        "La recherche sur la diffusion de contenu déverrouille le composant CDN. À la vitesse par défaut de 300 s TTL, il répond à 70 % des pages et à 75 % des requêtes multimédias en périphérie ; un TTL de 60 s le réduit de 20 % et un TTL de 3 600 s l'augmente de 20 %, jusqu'à 95 %. Edge Egress coûte 0,02 $ par Go, contre 0,09 $ par Go pour les serveurs applicatifs. La mise en cache à plusieurs niveaux augmente le taux de réussite des médias à 92 %.",
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce qu'un CDN ?" },
        { label: 'MDN : CDN' },
      ],
      design: [],
    },
    'chaos-engineering': {
      term: 'Ingénierie du chaos',
      definition:
        'Injecter des pannes volontairement et de façon contrôlée pour découvrir le comportement réel d’un système : tuer un nœud, ajouter de la latence, couper une dépendance. Une supposition sur un point faible devient une mesure.',
      inGame:
        'La recherche Ingénierie du chaos ajoute un interrupteur Chaos au panneau Équipe. Tant qu’il est actif, toutes les 120 s le nœud le plus faible de la conception fait échouer 20 % de ses appels pendant 10 s, et l’entreprise gagne 1 intuition d’échec par seconde grâce à l’expérience. L’interrupteur nomme le nœud que la prochaine expérience frappera, et ses erreurs `refused` injectées apparaissent dans la ligne Erreurs du tableau de bord, à côté des pannes qu’il doit faire comprendre.',
      links: [{ label: 'Principes de l’ingénierie du chaos' }],
      design: [{ label: 'Recherche en fiabilité' }],
    },
    'circuit-breaker': {
      term: 'Coupe-circuit',
      definition:
        "Un commutateur sur un chemin d'appel qui surveille les échecs. Lorsque trop d'appels échouent, il ouvre et échoue de nouveaux appels en même temps pendant un certain temps, de sorte que les appelants cessent d'attendre et que le service en difficulté puisse récupérer. Ensuite, il laisse passer quelques appels pour tester si le service est de retour.",
      inGame:
        "Après la recherche des disjoncteurs, vous pouvez activer un disjoncteur pour chaque lien. Lorsque plus de la moitié des appels du Link échouent, celui-ci s'ouvre pendant 5 s : il n'envoie rien, et ses appels échouent aussitôt car refusés. Puis il se ferme et réessaye. Les disjoncteurs sont l’une des trois mesures de prévention contre une tempête de nouvelle tentative.",
      links: [
        { label: 'Martin Fowler : Disjoncteur' },
        { label: 'Azure Architecture Center : modèle de disjoncteur' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Réglages des liens' }, { label: 'Tempête de tentatives' }],
    },
    'code-review': {
      term: 'Revue de code',
      definition:
        'Pratique dans laquelle un autre ingénieur lit une modification avant sa fusion, pour détecter des défauts, maintenir la cohérence du code et partager ses connaissances. La révision de code moderne est généralement légère et effectuée dans un outil sur de petites modifications.',
      inGame:
        'La recherche Revue de code réduit de 20 % le risque qu’un déploiement livre un bogue, et elle se cumule avec les Tests automatisés (30 %). Elle montre aussi le coût caché de chaque Fonctionnalité sur sa tuile avant sa livraison, par exemple « Chaque requête d’écriture coûte 20 % de plus ». La dette technique augmente le risque de mauvais déploiement : la revue compte donc davantage à mesure que la dette grandit.',
      links: [
        { label: "Pratiques d'ingénierie de Google : révision du code" },
        { label: 'Revue de code moderne : une étude de cas chez Google' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'cold-start': {
      term: 'Démarrage à froid',
      definition:
        "Le retard et la lenteur des premières requêtes lorsqu'un nouveau processus, conteneur ou instance de fonction démarre. Il doit démarrer, charger le code et les données, et remplir les caches ou compiler le code à chaud JIT avant d'atteindre sa pleine vitesse.",
      inGame:
        "Un serveur applicatif nouveau ou redémarré démarre, puis se réchauffe. Une copie Java (Tomcat) démarre à une vitesse de 30 % et a besoin de 30 s pour atteindre la pleine vitesse, tandis que la copie Go démarre à pleine vitesse. Une nouvelle copie d'un Autoscaler est diffusée après 180 s sur les machines virtuelles ou 30 s dans un cluster Kubernetes. Un cache redémarré revient vide avec Memcached ou à moitié chaud avec Redis, et une base de données froide exécute ses requêtes jusqu'à deux fois celle de CPU. Une fonction sans serveur ne garde aucun environnement quand elle dort : la requête qui suit une pause démarre à froid, en 50 ms en Rust ou Go et jusqu'à 2 000 ms sur la JVM.",
      links: [
        { label: "Documents AWS Lambda : Cycle de vie de l'environnement d'exécution" },
        { label: 'Wikipédia : Démarrage à froid (informatique)' },
      ],
      design: [{ label: 'Fonction serverless' }, { label: 'Comportements d’exécution' }],
    },
    compression: {
      term: 'Compression',
      definition:
        "Encoder une réponse en moins d'octets avant qu'elle ne transite sur le réseau, par exemple avec gzip ou Brotli. Le client le décode. Il permet d'économiser de la bande passante et du temps de transfert et coûte CPU aux deux extrémités.",
      inGame:
        "La recherche de compression vous permet d'activer gzip pour chaque serveur d'applications. Ses réponses de page, de lecture, de recherche, de rapport, de flux et de robot sont réduites à 30 % de leur taille, et ces requêtes coûtent 10 % de plus. CPU. Les réponses plus petites parviennent aux utilisateurs plus tôt, utilisent moins la carte réseau du boîtier et réduisent la sortie d'origine. Les autres types, tels que le téléchargement et les médias, conservent la même taille.",
      links: [
        { label: 'MDN : Compression dans HTTP' },
        { label: 'RFC 1952 : format de fichier GZIP' },
      ],
      design: [],
    },
    'connection-pooling': {
      term: 'Mutualisation des connexions',
      definition:
        "Conserver un ensemble de connexions de base de données ouvertes et les partager entre de nombreux clients, au lieu d'en ouvrir une par client ou par demande. Il permet d'économiser du temps de configuration de la connexion et de maintenir la base de données sous sa limite de connexion.",
      inGame:
        "La Base de données accepte 100 connexions et refuse le reste. Chaque processus serveur applicatif possède son propre pool : 1 connexion par processus PHP ou Gunicorn, 5 par processus Puma, 10 pour Node.js ou Go. Un pooleur de connexions en mode transaction partage 20 connexions serveur entre elles, mais échoue 5 % des requêtes regroupées jusqu'à ce que vous corrigiez l'état de session du code. L’incident d’épuisement de la connexion double chaque pool.",
      links: [
        { label: 'PgBouncer : fonctionnalités et modes de pooling' },
        { label: 'Documents PostgreSQL : connexions (max_connections)' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Pool de connexions' }],
    },
    'consistent-hashing': {
      term: 'Hachage cohérent',
      definition:
        "Un moyen de mapper les clés aux serveurs sur un anneau de hachage, de sorte que l'ajout ou la suppression d'un serveur ne déplace qu'environ 1/n des clés. Karger et d'autres l'ont décrit en 1997 pour les caches Web, et Dynamo d'Amazon et Apache Cassandra l'utilisent pour placer des données.",
      inGame:
        "Avec la recherche des algorithmes d'équilibrage, un répartiteur de charge peut diviser par hachage cohérent : chaque cible prend une part égale des clés quelle que soit sa charge, et une cible qui part ne déplace que ses propres clés. Le magasin à colonnes larges place chaque clé sur N répliques, et l'incident de clé très sollicitée est le fragment d'une clé qui sature.",
      links: [
        { label: 'Karger et al. : Hachage cohérent et arbres aléatoires (STOC 1997)' },
        { label: 'DeCandia et coll. : Dynamo (SOSP 2007)' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Répartiteur de charge' }],
    },
    'container-orchestration': {
      term: 'Orchestration de conteneurs',
      definition:
        'Logiciel qui place des conteneurs sur un pool partagé de machines, les redémarre en cas de panne et les fait évoluer vers le haut ou vers le bas. Kubernetes est l’exemple courant. Le regroupement de nombreuses charges de travail sur des nœuds partagés utilise mieux les machines, mais les voisins peuvent se ralentir mutuellement.',
      inGame:
        "La recherche sur l'orchestration de conteneurs déverrouille le cluster Kubernetes. Les serveurs applicatifs et les Workers que vous y connectez fonctionnent comme des pods : ils coûtent 15 % de moins en Burn, un Autoscaler ajoute leurs copies en 30 s au lieu de 180 s, un mauvais déploiement s’arrête après son premier quart de pods, et un pod dont l’hôte meurt revient en 30 s. Chaque cluster prend la moitié d’un ingénieur en heures de dev sauf si une équipe Plateforme le gère, et une version laissée hors support pendant un trimestre risque une mise à niveau forcée qui fait échouer 30 % des requêtes des pods. Les voisins bruyants ajoutent 10 ms à 0,5 % à 2 % des requêtes à mesure que les pods sont plus occupés.",
      links: [
        { label: 'Kubernetes : Présentation' },
        { label: 'Kubernetes : Gestion des ressources pour les pods et les conteneurs' },
        { label: 'Gestion de cluster à grande échelle chez Google avec Borg' },
      ],
      design: [],
    },
    'continuous-batching': {
      term: 'Traitement par lots continu',
      definition:
        'Une technique de service des modèles de langue qui ajoute chaque nouvelle requête au lot en cours dès qu’une place se libère, au lieu d’attendre la fin du lot entier. Le débit monte et l’attente du premier jeton reste courte.',
      inGame:
        'La recherche Traitement par lots continu ajoute les lots 8 et 32 à un nœud GPU : 1,6× et 2,2× les invites par seconde, sans changer le délai avant le premier jeton. Sans elle, les grands lots augmentent quand même le débit, mais ajoutent 150 ms ou 500 ms à cette attente.',
      links: [{ label: 'Documentation vLLM : traitement par lots continu' }],
      design: [{ label: 'Nœud GPU' }],
    },
    'continuous-delivery': {
      term: 'Livraison continue',
      definition:
        'Une pratique qui maintient le logiciel dans un état où toute modification peut être publiée en toute sécurité à tout moment, via un pipeline automatisé qui le construit, le teste et le déploie. Cela rend les versions petites, fréquentes et faciles à annuler.',
      inGame:
        "Avant la recherche sur la livraison continue, un déploiement prend 30 minutes manuellement. Après cela, un pipeline se déploie en 5 minutes, donc davantage de déploiements s'intègrent dans la journée de travail de 8 heures avec la construction et la vérification de 15 minutes. Il vous permet également d'annuler un mauvais déploiement, ce qui met fin à l'incident et remet ses fonctionnalités en ligne pour le prochain déploiement, et il débloque le Pipeline CI/CD : placez-en un et sa stratégie de déploiement fixe la durée du déploiement et le plafond de ce qu'un mauvais déploiement casse.",
      links: [
        { label: 'Martin Fowler : Livraison continue' },
        { label: 'DORA : Livraison continue' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'conways-law': {
      term: 'Loi de Conway',
      definition:
        '"Les organisations qui conçoivent des systèmes sont contraintes de produire des architectures qui sont des copies des structures de communication de ces organisations", extrait de l\'article de Melvin Conway de 1968. Les équipes qui parlent rarement ont tendance à construire des parties avec des interfaces étroites entre elles.',
      inGame:
        "À partir du pré-amorçage, vous pouvez créer jusqu'à 4 équipes, chacune avec sa propre politique, et chacune paie son propre coût de coordination, donc diviser un grand groupe augmente le total d'heures de développement. Avoir plus de services que d'équipes est le déséquilibre que marque le succès « Loi de Conway » : corrigez-le en donnant une équipe à chaque service. Le propriétaire d'un service construit son carnet de commandes et est appelé quand il tombe.",
      links: [
        { label: 'Mel Conway : la loi de Conway' },
        { label: 'Martin Fowler : ConwaysLoi' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Services et équipes responsables' }],
    },
    'credential-stuffing': {
      term: 'Bourrage d’identifiants',
      definition:
        "Une attaque où des robots tentent des paires de nom d'utilisateur et de mot de passe provenant d'autres sites contre un formulaire de connexion. Cela fonctionne parce que de nombreuses personnes réutilisent leurs mots de passe. Chaque essai coûte également au site un hachage de mot de passe lent.",
      inGame:
        "L’incident de bourrage d’informations d’identification peut démarrer à partir d’amorçage lorsque votre entreprise se connecte. Les robots envoient 19 fois votre taux de connexion normal, et chacun coûte à un serveur d'applications un hachage bcrypt complet, donc CPU sature. Un WAF bloque la plupart des robots : 80 % au niveau de paranoïa par défaut 2. Un fournisseur d'authentification hache le reste, donc une connexion coûte à votre serveur d'applications environ 2 ms de CPU.",
      links: [
        { label: "OWASP : bourrage d'informations d'identification" },
        { label: "Aide-mémoire OWASP : Prévention du bourrage d'informations d'identification" },
        { label: 'Centre de formation Cloudflare : Qu’est-ce que le credential stuffing ?' },
      ],
      design: [],
    },
    'data-residency': {
      term: 'Résidence des données',
      definition:
        "Règle, issue de la loi ou d'un contrat, selon laquelle certaines données doivent être stockées et traitées dans un pays ou une région donnée. Le RGPD de l'UE, par exemple, limite les transferts de données personnelles hors de l'UE.",
      inGame:
        "La résidence des données est un élément de la liste de contrôle d'introduction en bourse pré-IPO. Il est satisfait lorsque vous possédez des contrôles de résidence de données et GeoDNS, que vous disposez d'un nœud d'utilisateurs de l'UE en direct et que chaque nœud de données qu'il atteint se trouve dans la région de l'UE ou est un magasin à colonnes larges ou un nœud SQL distribué. Construisez un chemin européen complet et conservez ses données locales pour le cocher.",
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce que la localisation des données ?" },
        { label: 'Wikipédia : souveraineté des données' },
      ],
      design: [],
    },
    'ddos-distributed-denial-of-service': {
      term: 'DDoS (déni de service distribué)',
      definition:
        'Une attaque qui inonde un service avec du trafic provenant de plusieurs machines à la fois, souvent un botnet, afin que les vrais utilisateurs ne puissent pas passer. Les défenses filtrent les déchets en périphérie et répartissent la charge sur de nombreux endroits.',
      inGame:
        "L'incident DDoS peut démarrer à partir d’amorçage. Il ajoute 50 fois votre demande normale en tant que trafic de robots pendant 60 s maximum. Un WAF filtre les robots à son niveau de paranoïa ; activez le mode Sous-attaque pour en bloquer 99%, au prix de 1% des utilisateurs réels et 40 ms de latence en plus. Le directeur sélectionne moins souvent un DDoS lorsque vous exécutez un WAF.",
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce qu'une attaque DDoS ?" },
        { label: 'CISA : Comprendre les attaques par déni de service' },
        { label: 'Documents Cloudflare : en mode Attaque' },
      ],
      design: [],
    },
    'dead-letter-queue': {
      term: 'File des messages non traités',
      definition:
        "File d'attente distincte contenant les messages qu'un consommateur ne peut pas traiter après un nombre défini de tentatives infructueuses. Il empêche un mauvais message de bloquer la file d'attente et conserve le message pour que les gens puissent l'inspecter ou le rejouer.",
      inGame:
        "Une carte de file d'attente comporte un paramètre Tâches en échec : Réessayer sans limite ou File des messages non traités, avec 1, 3, 10 ou 25 tentatives. Une tentative échouée revient 30 s plus tard et repasse sur le Worker ; une tâche qui échoue à chaque tentative est perdue. L'incident de message empoisonné ne peut toucher qu'une file d'attente qui réessaye indéfiniment : une tâche qui échoue toujours revient sans cesse et ses Workers y consacrent 90 % de leur temps. Activez la file des messages non traités pour la rendre immunisée ou supprimez le message pour mettre fin à l'incident.",
      links: [
        { label: "AWS : Utilisation des files d'attente de messages non traités dans Amazon SQS" },
        { label: 'RabbitMQ : Échanges de messages non traités' },
        { label: "Modèles d'intégration d'entreprise : canal de message non traité" },
      ],
      design: [],
    },
    denormalization: {
      term: 'Dénormalisation',
      definition:
        'Stocker le même fait à plusieurs endroits, ou garder une copie pré-jointée, pour qu’une lecture n’ait ni à joindre ni à calculer. Les lectures coûtent moins, et chaque écriture doit mettre à jour chaque copie.',
      inGame:
        'La recherche Dénormalisation fait coûter 30 % de CPU en moins à chaque lecture de base et 20 % de plus à chaque écriture (10). Elle paie sur une conception à dominante de lectures et pénalise une conception à dominante d’écritures : c’est l’arbitrage que l’aperçu de la carte Compromis montre avant de le prendre.',
      links: [{ label: 'Wikipédia : dénormalisation' }],
      design: [{ label: 'Voie Performance' }],
    },
    'dependency-scanning': {
      term: 'Analyse des dépendances',
      definition:
        'Une vérification automatisée des bibliothèques tierces utilisées par un projet par rapport aux bases de données de vulnérabilités connues. Il s’exécute généralement dans le pipeline de construction et signale les versions qui nécessitent une mise à niveau.',
      inGame:
        "L'analyse des dépendances est une recherche de sécurité de Série A qui nécessite la livraison continue. Elle détecte une porte dérobée publiée avant que le build ne l'installe et réduit la faiblesse que trouve l'incident de compromission de la chaîne d'approvisionnement. C'est aussi l'un des trois prérequis, avec TLS partout et le chiffrement au repos, du programme SOC 2, dont la liste de contrôle de l'introduction en bourse a besoin.",
      links: [
        { label: 'OWASP Top 10 : composants vulnérables et obsolètes' },
        { label: 'Vérification des dépendances OWASP' },
        { label: 'Documents GitHub : À propos des alertes Dependabot' },
      ],
      design: [],
    },
    'distributed-tracing': {
      term: 'Traçage distribué',
      definition:
        'Suite à une demande pour chaque service concerné. Chaque saut enregistre une période avec son heure de début et de fin, et les périodes qui partagent un ID de trace se rejoignent en une seule trace. Les traces montrent où passe le temps et quelle dépendance est lente.',
      inGame:
        "La recherche de traçage distribué (après les centiles) montre le temps de chaque type de requête, nœud par nœud, dans le tableau des services du tableau de bord et sa cascade. Le nœud Analytics échantillonne le trafic des nœuds que vous y reliez et le transforme en Insight. Les centiles affichent p50, p95 et p99, et le plateau marque le goulot d'étranglement.",
      links: [
        { label: "Dapper : l'infrastructure de traçage de Google" },
        { label: 'OpenTelemetry : Traces' },
      ],
      design: [],
    },
    'diurnal-traffic': {
      term: 'Trafic diurne',
      definition:
        "L'augmentation et la diminution quotidiennes de la demande qui surviennent lorsque les gens sont éveillés et actifs. Les services aux consommateurs atteignent souvent leur pointe le soir et sont plus calmes tôt le matin. La planification de la capacité doit couvrir le pic quotidien, et le creux constitue un moment sûr pour la maintenance.",
      inGame:
        "La demande suit un cycle quotidien sur le Calendrier : par défaut elle culmine à 20h00 à 1,45× la moyenne et descend à 0,55× à 08h00. Chaque entreprise définit sa propre courbe ; par exemple, la Fintech culmine à 14h00 et oscille à ±60 %. Lorsque vous ouvrez plusieurs régions, chaque région culmine à 20h00, son propre local. Une seconde sim équivaut à une minute calendaire, donc une journée complète s'écoule en 24 minutes à 1× : taille pour le pic du soir, ou laissez un Autoscaler suivre la courbe.",
      links: [
        { label: 'USENIX 1997 : Cycle diurne dans une trace client' },
        { label: "AWS : mise à l'échelle prédictive pour EC2 Auto Scaling" },
      ],
      design: [],
    },
    'dns-round-robin': {
      term: 'Répartition DNS par tourniquet',
      definition:
        "Répartition de la charge par DNS : un nom renvoie plusieurs adresses IP et le serveur alterne leur ordre afin que les clients se répartissent sur les hôtes. DNS ne sait pas si un hôte est actif et les clients mettent en cache les réponses pour le TTL de l'enregistrement.",
      inGame:
        "La recherche circulaire DNS déverrouille le composant DNS, qui répartit les utilisateurs de manière égale sur jusqu'à 8 hôtes. Sans contrôle de santé, un hôte mort conserve sa part et ces requêtes échouent. Après la recherche des contrôles de santé, DNS abandonne un hôte mort une fois que son TTL est épuisé : 30, 300 ou 3 600 s. Un Load Balancer remarque un hôte mort plus rapidement, lors de son prochain bilan de santé.",
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce que le DNS à tour de rôle ?" },
        { label: "RFC 1794 : prise en charge de DNS pour l'équilibrage de charge" },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'dora-metrics': {
      term: 'Métriques DORA',
      definition:
        "Cinq mesures de livraison de logiciels issues du programme de recherche DORA : délai de modification, fréquence de déploiement, temps de récupération du déploiement en cas d'échec, taux d'échec des modifications et taux de reprise. Les trois premiers montrent le débit et les deux derniers montrent l'instabilité.",
      inGame:
        "Deux d’entre eux conduisent le jeu. La fréquence de déploiement est d'au plus 480 minutes de travail/(construction + déploiement + 15 vérifications) par jour, plafonnée à 16, 8 ou 4 par la politique de l'équipe. La livraison continue réduit le déploiement de 30 à 5 minutes. Chaque déploiement a une chance de base de 10 % de générer un bug, augmentée par Move fast et la dette technique et réduite par les tests automatisés (-30 %) et la révision du code (-20 %) ; la carte de déploiement le montre.",
      links: [
        { label: 'DORA : mesures de performances de livraison de logiciels' },
        { label: 'DORA : un historique des métriques de DORA' },
      ],
      design: [{ label: 'Fréquence de déploiement' }],
    },
    downsampling: {
      term: 'Sous-échantillonnage',
      definition:
        "Stockage des anciennes métriques à une résolution plus grossière, par exemple un point toutes les 5 minutes ou par heure au lieu de par seconde. Les longues portées restent bon marché à conserver et rapides à dessiner. Chaque point grossier conserve le min, le max, la somme et le nombre des points qu'il remplace.",
      inGame:
        "Le tableau de bord lit des échantillons d'une minute pour les plages de 1 h et 6 h, des blocs de 15 minutes (conservés pendant 7 jours) pendant 1 jour et 7 jours, et des blocs d'une heure (conservés pendant 30 jours) pendant 30 jours. Chaque graphique dessine un bloc comme moyenne. La ligne p99 dessine à la place la pire minute de chaque bloc, car une moyenne masquerait le pic.",
      links: [
        { label: 'Documents Thanos : Compacteur et sous-échantillonnage' },
        { label: 'Documents Prometheus : Stockage' },
        { label: 'Wikipédia : sous-échantillonnage' },
      ],
      design: [{ label: 'Plages de temps du tableau de bord' }],
    },
    drift: {
      term: 'Dérive',
      definition:
        'La différence entre l’infrastructure qu’un outil comme Terraform ou Pulumi a déployée la dernière fois et ce qui tourne maintenant. La dérive vient de modifications faites hors de l’outil, comme un redimensionnement dans une console cloud, et de modifications du code pas encore appliquées.',
      inGame:
        'Un Miroir dérive de deux façons : il est en retard quand sa région source a changé, et il a une modification manuelle quand vous avez modifié le Miroir directement. Appliquer ramène le Miroir à sa source et annule les modifications manuelles que son plan voit. Les plans Terraform voient toute modification manuelle tout de suite. Pulumi et Alchemy comparent à l’état qu’ils ont enregistré, donc une modification manuelle n’apparaît qu’après Relire ou Vérifier la dérive. Gardez une différence régionale voulue comme exception.',
      links: [
        {
          label:
            'Tutoriel Terraform : utiliser le mode refresh-only pour synchroniser l’état Terraform',
        },
        { label: 'Documentation Pulumi : détecter et réconcilier la dérive' },
        { label: 'Documentation Alchemy : dérive' },
      ],
      design: [{ label: 'Garder un Miroir synchronisé' }],
    },
    egress: {
      term: 'Trafic sortant',
      definition:
        "Données qui quittent le réseau d'un fournisseur de cloud, vers Internet ou vers une autre zone ou région. Les fournisseurs facturent ce service au Go, alors que les données entrantes sont généralement gratuites.",
      inGame:
        "À partir de l’amorçage, dépenses inclut la sortie : 0,09 $ par Go que les serveurs applicatifs envoient aux utilisateurs et 0,02 $ par Go pour les pages auxquelles un CDN répond en périphérie. Un appel entre zones coûte 0,01 $ par Go dans chaque sens, et un appel entre régions 0,02 $ par Go, le tout calculé selon l'indice de coût de l’étape. La compression rend les réponses de page et de lecture 70 % plus petites pour 10 % de plus CPU.",
      links: [
        { label: 'Centre de formation Cloudflare : Que sont les frais de sortie de données ?' },
        { label: "Blog sur l'architecture AWS : Coûts de transfert de données" },
      ],
      design: [{ label: 'Trafic sortant' }],
    },
    'edge-side-includes': {
      term: 'Inclusions côté edge',
      definition:
        'Une technique de cache où la périphérie stocke la partie commune d’une page et n’assemble que les fragments personnels de chaque utilisateur, afin qu’une page connectée soit surtout servie depuis le cache.',
      inGame:
        'La recherche Inclusions côté edge ajoute 20 points au taux de succès `page` d’un CDN, de 70 % à 90 % (10), car la périphérie met désormais en cache la coquille d’une page connectée. Le TTL le multiplie toujours, et le taux plafonne toujours à 95 %.',
      links: [{ label: 'Documentation Fastly : Edge Side Includes' }],
      design: [{ label: 'CDN' }],
    },
    'encryption-at-rest': {
      term: 'Chiffrement au repos',
      definition:
        "Chiffrer les données stockées, telles que les disques, les fichiers de base de données et les sauvegardes, afin que quiconque obtient le support de stockage ne puisse pas le lire sans les clés. Il protège contre les disques volés et les fuites de sauvegardes, et non contre un attaquant susceptible d'interroger le système actif.",
      inGame:
        "Le chiffrement au repos est une recherche de sécurité de Série B. Il n'a aucun effet direct sur le trafic, le coût ou les incidents. C'est l'un des trois prérequis, avec TLS partout et l'analyse des dépendances, du programme SOC 2, dont la liste de contrôle de l'introduction en bourse a besoin.",
      links: [
        { label: 'Google Cloud : chiffrement par défaut au repos' },
        { label: 'Aide-mémoire OWASP : stockage cryptographique' },
        { label: 'Documents PostgreSQL : Options de chiffrement' },
      ],
      design: [],
    },
    'error-budget': {
      term: 'Budget d’erreur',
      definition:
        "Le nombre d'échecs qu'un SLO autorise sur une fenêtre : avec un SLO à 99,9 %, 0,1 % des requêtes peuvent échouer. Les équipes dépensent cet argent en risques, comme des versions plus rapides, et ralentissent et corrigent la fiabilité lorsqu'elles sont épuisées.",
      inGame:
        "Depuis la série A, le jeu compte les demandes échouées au cours de la derniétape semaine civile contre le SLO de l’étape, 99,9 % en série A et jusqu'à 99,99 % lorsqu'il est public. Les robots et les blocs WAF ne comptent pas. Après la recherche des budgets d'erreur, plus de la moitié du budget restant accélétape vos équipes de 10 %, et un budget dépensé réduit de moitié leur vitesse. Les tableaux de bord SLO mettent le budget sur le HUD. Les tableaux de bord SLO indiquent également le taux d'utilisation du budget sur le tableau de bord.",
      links: [
        { label: 'Livre Google SRE : Accepter le risque' },
        { label: "Classeur Google SRE : politique budgétaire d'erreur" },
      ],
      design: [{ label: 'SLO et budgets d’erreur' }],
    },
    'event-loop': {
      term: 'Boucle d’événements',
      definition:
        'Un seul thread qui attend les événements I/O et exécute leurs rappels un par un. Il dessert de nombreuses connexions en attente à moindre coût, mais un rappel qui utilise le CPU pendant une longue période bloque toutes les autres requêtes sur cette boucle.',
      inGame:
        "Node.js exécute une boucle d'événements et utilise un noyau ; Le cluster Node.js exécute une boucle par cœur. Une requête lourde en CPU, telle qu'un hachage de mot de passe de 80 ms lors de la connexion, bloque les requêtes derrière elle et le décrochage atterrit sur le p99. Dans le bloc de boucle d'événement Incident, chaque connexion coûte 4 × le CPU. La recherche du pool de threads libuv ou un fournisseur d'authentification supprime le hachage de la boucle.",
      links: [
        { label: "Node.js : La boucle d'événements Node.js" },
        { label: "Node.js : Ne bloquez pas la boucle d'événements" },
        { label: "MDN : modèle d'exécution JavaScript" },
      ],
      design: [{ label: 'Boucles d’événements et blocage' }],
    },
    'eventual-consistency': {
      term: 'Cohérence éventuelle',
      definition:
        "Un modèle de cohérence dans lequel les réplicas peuvent renvoyer d'anciennes données pendant un certain temps après une écriture. Si aucune nouvelle écriture n’arrive, toutes les répliques convergent vers la même dernière valeur.",
      inGame:
        "Un réplica en lecture est en retard sur les écritures, de sorte que jusqu'à 15 % de ses lectures reviennent obsolètes, et jusqu'à 50 % lors d'un incident de retard de réplication. Un magasin à colonnes larges dont R + W n'est pas supérieur à N sert également des lectures obsolètes. Une lecture obsolète fait échouer une lecture API et une extraction qui lit sa propre écriture. Le routage de lecture-écriture envoie ces lectures au serveur principal à la place.",
      links: [
        { label: "Werner Vogels : finalement cohérent (file d'attente ACM)" },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Magasin à larges colonnes' }],
    },
    'expand-and-contract': {
      term: 'Élargir puis contracter',
      definition:
        'Une façon de changer un schéma sans verrouiller une table : ajouter la nouvelle colonne ou table, écrire dans les deux, remplir, basculer les lectures, puis supprimer l’ancienne. Chaque étape est rétrocompatible, donc l’ancien et le nouveau code tournent côte à côte.',
      inGame:
        'La recherche Élargir puis contracter supprime totalement l’incident Verrou de migration de schéma : avec seulement les migrations de schéma en ligne l’incident est environ huit fois moins probable, et avec Élargir puis contracter il ne peut pas arriver. Les deux coûtent des heures de développement : sur une base relationnelle, une fonctionnalité qui ajoute une forme de requête coûte 10% de plus avec les migrations en ligne et 25% de plus avec Élargir puis contracter.',
      links: [{ label: 'Martin Fowler : Parallel change' }],
      design: [{ label: 'Migrations de schéma' }],
    },
    'fallacies-of-distributed-computing': {
      term: 'Idées reçues sur les systèmes distribués',
      definition:
        "Huit fausses hypothèses que font souvent les programmeurs qui débutent dans les systèmes distribués, recueillies par L. Peter Deutsch et d'autres chez Sun Microsystems : le réseau est fiable, la latence est nulle, la bande passante est infinie, le réseau est sécurisé, la topologie ne change pas, il y a un administrateur, le coût de transport est nul et le réseau est homogène.",
      inGame:
        "Plusieurs incidents et coûts brisent ces hypothèses. Lors d'un incident de partition réseau, les appels entre les régions expirent jusqu'à ce que la partition soit guérie ou que vous clôturez l'ancien leader. Un appel vers une autre zone ajoute 1 ms et coûte la sortie dans les deux sens, et un appel vers une autre région paie l'aller-retour. Jusqu'à l'expiration du délai d'attente et aux tentatives, chaque lien attend 30 s pour une réponse.",
      links: [
        { label: 'Wikipédia' },
        { label: "Rotem-Gal-Oz : explication des erreurs de l'informatique distribuée (PDF)" },
      ],
      design: [{ label: 'Succès' }],
    },
    'fan-out': {
      term: 'Diffusion',
      definition:
        "Une requête qui se transforme en de nombreux appels vers d’autres services ou magasins de données. Plus une requête attend d'appels, plus l'un d'entre eux est susceptible d'être lent, donc une large diffusion augmente la latence et la charge de la queue.",
      inGame:
        "Une vue de page effectue 2 requêtes de lecture et les frameworks ORM (Laravel, Rails, Django) effectuent 3 lectures là où 1 ferait jusqu'au chargement impatient. La fonctionnalité Flux d'activité ajoute des flux : extrait, un flux effectue 20 lectures. Avec la diffusion lors de l'écriture, un flux effectue 1 lecture, mais chaque écriture remplit les chronologies de 20 abonnés. La diffusion hybride réduit cela à 2 lectures et 10 écritures sur la chronologie.",
      links: [
        { label: 'Dean et Barroso : La queue à grande échelle (CACM 2013)' },
        { label: 'Wikipédia : Fan-out (logiciel)' },
      ],
      design: [{ label: 'Diffusion' }],
    },
    'fan-out-on-write': {
      term: 'Diffusion à l’écriture',
      definition:
        "Créer le flux de chaque utilisateur lorsqu'une publication est rédigée : la publication est copiée dans la chronologie de chaque abonné, donc la lecture d'un flux est une recherche bon marché. Cela déplace le travail des lectures vers les écritures, et cela coûte cher pour les comptes comptant de nombreux abonnés. De nombreux systèmes utilisent une méthode hybride : pousser pour les comptes normaux et tirer pour les célébrités au moment de la lecture.",
      inGame:
        "À partir de la série C, la fonctionnalité de flux d'activité ajoute le type de flux et chaque carte serveur applicatif propose des flux : Pull ou Push. Avec Pull, un flux lit 20 publications. Avec Push, un flux lit une chronologie précalculée, mais chaque écriture génère 20 écritures sur la chronologie. La recherche hybride réduit ce nombre à 10 écritures et 2 lectures par flux, et permet à un cache ou à un magasin à colonnes larges de diviser une clé très sollicitée sur ses fragments.",
      links: [
        { label: 'InfoQ : Chronologies à grande échelle (Twitter)' },
        { label: "Haute évolutivité : l'architecture utilisée par Twitter" },
      ],
      design: [],
    },
    'feature-flag': {
      term: 'Indicateur de fonctionnalité',
      definition:
        "Un commutateur dans le code, contrôlé au moment de l'exécution, qui active ou désactive une fonctionnalité sans nouveau déploiement. Les équipes utilisent des indicateurs pour proposer une fonctionnalité à un groupe d'utilisateurs, la tester ou la désactiver rapidement en cas de panne.",
      inGame:
        'La recherche Drapeaux de fonctionnalités débloque le composant Drapeaux de fonctionnalités. Chaque fonctionnalité du lot d’un déploiement a un déploiement progressif : éteinte, 5 %, 25 %, 50 % ou tous les utilisateurs. Un mauvais déploiement fait échouer 8 % des requêtes des serveurs applicatifs pour chaque fonctionnalité du lot, et un drapeau réduit cette part à son déploiement progressif, donc une fonctionnalité à 5 % ne casse au plus que 5 % de ce qu’elle aurait cassé, quelle que soit la stratégie. La couper est le clic qui arrête l’impact. Les effets d’une fonctionnalité et la charge qu’elle ajoute suivent son exposition, son déploiement progressif multiplié par la part de ses utilisateurs qui l’ont adoptée : une fonctionnalité éteinte ne rapporte rien et une fonctionnalité à 50 % atteint la moitié une fois adoptée ; le test A/B mesure le gain face aux utilisateurs tenus à l’écart par le déploiement.',
      links: [
        { label: 'Site de Martin Fowler : Activations de fonctionnalités (Pete Hodgson)' },
        { label: 'OpenFeature : Que sont les indicateurs de fonctionnalités ?' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Drapeaux de fonctionnalités' }],
    },
    'four-golden-signals': {
      term: 'Quatre signaux clés',
      definition:
        'Latence, trafic, erreurs et saturation : les quatre mesures que le livre Google SRE recommande de surveiller en premier sur un système orienté utilisateur. Si vous ne pouvez mesurer que quatre choses, mesurez-les.',
      inGame:
        "Le tableau de bord (D) s'ouvre après la recherche de métriques. Ses diagrammes en lignes Golden signalent le trafic (servi contre la demande), la latence (la moyenne, plus le p99 avec les centiles) et les erreurs (avec les journaux structurés). La ligne Saturation ci-dessous indique le niveau de remplissage de chaque nœud et les statistiques en haut désignent le nœud le plus chaud.",
      links: [
        { label: 'Livre Google SRE : Surveillance des systèmes distribués' },
        { label: 'Documents Grafana : meilleures pratiques en matière de tableau de bord' },
      ],
      design: [{ label: 'Signaux du tableau de bord' }],
    },
    'gc-pause': {
      term: 'Pause du ramasse-miettes',
      definition:
        "Heure à laquelle un ramasse-miettes arrête ou ralentit l'application pour rechercher et libérer de la mémoire qui n'est plus utilisée. Les pauses ne touchent généralement que certaines requêtes, elles apparaissent donc dans la latence extrême, comme le p99, plus que dans la moyenne.",
      inGame:
        "Lorsque le tas d'un serveur d'applications est rempli à plus de 70 %, son collecteur met en pause jusqu'à 2 % des requêtes. Java fait une pause de 30 ms avec G1, 150 ms avec Parallèle ou 1 ms avec ZGC, ce qui coûte 10 % de débit et 15 % de mémoire en plus. Go ne fait une pause que de 1 ms mais dépense jusqu'à 25 % de plus de CPU, que le réglage Go GC échange contre la mémoire. Dans l'incident de tempête de pause GC, le tas se remplit davantage et 5 fois plus de requêtes s'arrêtent.",
      links: [
        { label: 'Go : Un guide du collecteur de déchets Go' },
        { label: 'Wiki OpenJDK : ZGC' },
        { label: 'Oracle : guide de réglage Java GC' },
      ],
      design: [{ label: 'Comportements d’exécution' }],
    },
    geodns: {
      term: 'GeoDNS',
      definition:
        "DNS qui donne des réponses différentes selon l'endroit où se trouve l'utilisateur, de sorte que chaque utilisateur se résout vers un centre de données ou une région à proximité. De nombreux prestataires peuvent également ignorer une région qui échoue à ses contrôles de santé.",
      inGame:
        "GeoDNS est une recherche de série C qui nécessite plusieurs régions. Sans cela, les utilisateurs de chaque continent entrent par leur région d'origine et paient deux allers-retours, par exemple 150 ms de l'Europe vers l'Amérique du Nord. Grâce à lui, les utilisateurs de chaque région entrent via le nœud d'utilisateurs de leur propre région, ou celui en direct le plus proche lors d'une panne de région. L’élément de la liste de contrôle de résidence des données nécessite également GeoDNS.",
      links: [
        { label: 'Amazon Route 53 : routage par géolocalisation' },
        { label: 'Amazon Route 53 : routage basé sur la latence' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'gil-global-interpreter-lock': {
      term: 'GIL (verrou global de l’interpréteur)',
      definition:
        "Un verrou dans la version par défaut de CPython et le GVL dans CRuby, qui permet à un seul thread d'exécuter le code de l'interpréteur à la fois. Les threads se chevauchent toujours en attendant I/O, mais le travail de CPU dans un seul processus ne s'exécute pas en parallèle. CPython 3.13 a ajouté une version facultative à thread libre sans GIL (PEP 703).",
      inGame:
        "Puma de Ruby doit exécuter un processus par cœur pour utiliser chaque cœur, avec 5 threads chacun et 180 Mo par processus. Gunicorn de Python exécute un pool de processus de synchronisation, une requête chacun et 120 Mo par processus, et vous définissez la taille du pool. Les environnements d'exécution sans GIL, tels que Go ou Java, exécutent un processus sur chaque cœur.",
      links: [
        { label: "Documents Python : Glossaire (verrouillage global de l'interpréteur)" },
        { label: 'PEP 703 : Rendre le GIL facultatif' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Modèles de concurrence' }],
    },
    gitops: {
      term: 'GitOps',
      definition:
        'Une façon de gérer l’infrastructure où l’état voulu vit dans Git sous forme de code déclaratif, et où un agent comme Argo CD ou Flux le récupère et réconcilie sans cesse le système réel avec lui. OpenGitOps liste quatre principes : déclaratif, versionné et immuable, récupéré automatiquement, et réconcilié en continu.',
      inGame:
        'GitOps est une recherche de la Série C après Infrastructure as code. Elle applique chaque changement de la source à chaque Miroir tout seul, donc les Miroirs ne prennent plus de retard. Elle annule aussi les modifications manuelles à la synchronisation suivante avec chaque outil IaC, comme Argo CD avec l’auto-réparation activée : les exceptions sont donc le seul moyen d’ajuster une région. En une fois synchronise en 3 minutes calendaires au plus, comme l’interrogation par défaut d’Argo CD. Par étapes garde d’abord un changement 60 minutes sur la source. En une fois échange la dérive contre le périmètre d’impact : un déploiement de configuration défectueux atteint tous les Miroirs ensemble.',
      links: [
        { label: 'OpenGitOps: GitOps Principles' },
        { label: 'Documentation Argo CD : politique de synchronisation automatisée' },
        { label: 'Documentation Flux : concepts clés' },
      ],
      design: [{ label: 'GitOps' }],
    },
    'graceful-degradation': {
      term: 'Dégradation gracieuse',
      definition:
        'Garder la partie importante d’un service en marche au-delà de sa capacité en coupant les parties coûteuses et facultatives au lieu de tout faire échouer : la page se charge encore, le rapport attend.',
      inGame:
        'La recherche Dégradation gracieuse ajoute un interrupteur à un serveur applicatif. Un nœud saturé abandonne alors d’abord ses types de requêtes les plus chers, exports et téléversements avant les lectures, pour que les types bon marché gardent leur latence (10). Le délestage prioritaire fait l’inverse : il abandonne d’abord les types de moindre valeur, robots et enchères avant les pages.',
      links: [{ label: 'Livre Google SRE : Gérer la surcharge' }],
      design: [{ label: 'Voie Fiabilité' }],
    },
    'green-threads': {
      term: 'Threads légers',
      definition:
        'Threads légers qu’un runtime de langage planifie à la place du système d’exploitation. Les Goroutines, les threads virtuels Java et les processus Erlang en sont des exemples. Chacun coûte quelques Ko, donc un serveur peut en faire attendre plusieurs milliers à la fois.',
      inGame:
        "Les BEAM de Go et Elixir exécutent des threads verts sur chaque cœur, et une requête en attente ne contient aucun emplacement de travail. Chaque connexion Realtime ouverte coûte 10 Ko sur Go et 5 Ko sur BEAM, contre 1 Mo pour un thread Java sur Tomcat. BEAM est préemptif, donc aucune requête n'en bloque une autre, mais son CPU est moins de deux fois moins rapide que celui de Go.",
      links: [
        { label: 'Une visite guidée de Go : Goroutines' },
        { label: 'JEP 444 : thèmes virtuels' },
        { label: 'Wikipédia' },
      ],
      design: [{ label: 'Modèles de concurrence' }],
    },
    'health-check': {
      term: 'Sonde de disponibilité',
      definition:
        "Une sonde périodique, telle qu'une requête HTTP adressée à un point de terminaison d'état, qui décide si un serveur doit recevoir du trafic. Une vérification superficielle teste uniquement le serveur ; une vérification approfondie teste également ce dont il dépend, comme sa base de données.",
      inGame:
        "Un répartiteur de charge sonde ses serveurs applicatifs toutes les 10 s et arrête d'envoyer du trafic vers un serveur mort à la prochaine vérification. La recherche sur les contrôles de santé ajoute des intervalles de 2 s et 30 s et une vérification approfondie qui supprime également les serveurs applicatifs dont la base de données est en panne ou surchargée. Il permet également au DNS de supprimer un hôte mort une fois son TTL épuisé ; sans cela, DNS continue d'envoyer sa part à cet hôte. Les contrôles ne fonctionnent qu'une fois la tâche Point de terminaison de contrôle de santé terminée.",
      links: [
        { label: "Bibliothèque des constructeurs AWS : mise en œuvre des vérifications de l'état" },
        { label: "Documents Kubernetes : sondes d'activité, de préparation et de démarrage" },
      ],
      design: [{ label: 'Répartiteur de charge' }],
    },
    'hedged-request': {
      term: 'Requête redondante',
      definition:
        "Envoi d'une deuxième copie d'une requête à un autre réplica lorsque la première est plus lente que prévu, par exemple au-delà de la latence du 95e centile, et en utilisant la réponse arrivée en premier. Il réduit la latence extrême pour une petite quantité de charge supplémentaire.",
      inGame:
        'La recherche Requêtes redondantes ajoute un interrupteur à chaque lien. Un lien redondant envoie une seconde copie de chaque appel et l’utilisateur attend la réponse la plus rapide : la moyenne est divisée par deux, le p99 baisse, et le destinataire voit 10 % d’appels en plus, ce que le débit du lien montre. Percentiles montre la queue avant et après. La lecture de quorum du magasin à colonnes larges est la même idée intégrée à une base : elle attend seulement les R répliques les plus rapides parmi N.',
      links: [
        { label: 'Dean et Barroso : La queue à grande échelle (CACM 2013)' },
        { label: 'Documents gRPC : Demander une couverture' },
      ],
      design: [{ label: 'Progression' }],
    },
    'hot-key': {
      term: 'Clé très sollicitée',
      definition:
        "Une clé qui reçoit une très grande part de lectures ou d'écritures, comme le profil d'une célébrité. Le fragment ou le serveur qui le possède sature tandis que les autres restent inactifs, donc l'ajout de serveurs n'aide pas.",
      inGame:
        "Dans l'incident de clé très sollicitée (Série C), 30 % des lectures d'un cache, d'un magasin documentaire, d'un index vectoriel, d'un flux d'événements ou d'un magasin à colonnes larges occupé demandent une même clé. La capacité du nœud se divise par 0,3 × ses paliers de taille + 0,7 : un nœud de taille 4 en garde environ la moitié. La recherche Répartition hybride permet d'activer le découpage de clé pour un cache ou un magasin à colonnes larges. Le découpage répartit la clé très sollicitée et met fin à la perte.",
      links: [
        {
          label:
            'Documents AWS : Architecture de clés de partition pour répartir la charge de travail dans DynamoDB',
        },
        { label: "Documents AWS : partitionnement d'écriture dans DynamoDB" },
        { label: 'Documentation Redis : redis-cli --hotkeys' },
      ],
      design: [{ label: 'Partitionnement' }],
    },
    'http-keep-alive': {
      term: 'Connexions HTTP persistantes',
      definition:
        "Réutiliser une connexion TCP pour plusieurs requêtes HTTP au lieu d'en ouvrir une nouvelle à chaque fois. Il ignore la prise de contact de connexion et, pour HTTPS, la prise de contact TLS, à chaque demande après la première.",
      inGame:
        "Chaque appel interne entre nœuds coûte un saut de 0,5 ms plus une prise de contact TCP de 1 ms. La recherche sur la réutilisation des connexions supprime la prise de contact, de sorte que chaque appel interne coûte 0,5 ms. Une requête qui traverse plusieurs nœuds permet d'économiser 1 ms par saut.",
      links: [
        { label: 'MDN : Gestion des connexions dans HTTP/1.x' },
        { label: 'RFC 9112 : HTTP/1.1, gestion des connexions' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'http2-and-http3': {
      term: 'HTTP/2 et HTTP/3',
      definition:
        "Versions plus récentes de HTTP. HTTP/2 envoie plusieurs requêtes à la fois via une seule connexion TCP. HTTP/3 s'exécute sur QUIC sur UDP, qui combine les négociations de transport et TLS et empêche un paquet perdu de bloquer chaque flux.",
      inGame:
        "HTTP/3 est une recherche de Série C qui nécessite HTTP/2. Elle réduit de 20 % les allers-retours qu'un utilisateur paie pour atteindre une région d'un autre continent : un utilisateur européen servi depuis l'Amérique du Nord attend 120 ms au lieu de 150 ms. HTTP/2 est la recherche qui débloque HTTP/3. HTTP/2 réduit de 15 % le saut de l'utilisateur sur les pages vues.",
      links: [
        { label: 'MDN : évolution du HTTP' },
        { label: "Centre de formation Cloudflare : Qu'est-ce que HTTP/3 ?" },
        { label: 'RFC9114 : HTTP/3' },
      ],
      design: [],
    },
    'iac-tool': {
      term: 'Outil IaC',
      definition:
        'Un outil qui décrit l’infrastructure sous forme de code et l’applique : il compare le code à l’état enregistré, montre un plan et effectue les changements. Terraform utilise HCL ; Pulumi et Alchemy utilisent des langages généralistes comme TypeScript. Chacun garde un fichier d’état de ce qu’il a déployé.',
      inGame:
        'La recherche Infrastructure as code vous fait choisir Terraform, Pulumi ou Alchemy. Les trois construisent tous les Composants et peuvent régler toute valeur par région. Ils diffèrent dans la façon dont un plan trouve les modifications manuelles, comme dans le flux par défaut de chaque outil : Terraform relit l’état réel à chaque plan, donc ses plans sont complets et chaque application attend cette relecture. Pulumi compare à son état enregistré jusqu’à ce que vous relisiez. Alchemy compare aussi à l’état enregistré ; Vérifier la dérive relit l’état réel, et Réparer annule les modifications manuelles sans prendre les changements de la source. Passer à un autre outil arrête toute synchronisation pendant un jour calendaire.',
      links: [
        { label: 'Documentation Terraform : qu’est-ce que Terraform ?' },
        { label: 'Documentation Pulumi : infrastructure as code' },
        { label: 'Documentation Alchemy : fournisseurs' },
        { label: 'Wikipédia : infrastructure as code' },
      ],
      design: [{ label: 'Outils IaC' }],
    },
    idempotency: {
      term: 'Idempotence',
      definition:
        "Une opération est idempotente lorsque la faire deux fois a le même effet que la faire une fois. Les lectures sont idempotentes par nature ; un débit de carte ou une commande ne l’est pas. Une clé d'idempotence est un identifiant unique que le client envoie avec une requête, afin que le serveur puisse reconnaître une nouvelle tentative et renvoyer le premier résultat au lieu d'agir à nouveau.",
      inGame:
        "Un paiement envoie des frais au fournisseur de paiement. Dans l'incident de double facturation, le fournisseur ralentit d'environ 1,5 s, le lien de facturation expire et une nouvelle tentative facture une carte déjà chargée lors de la première tentative, de sorte que ces paiements échouent en tant que doublon. Recherchez les clés d'idempotence (il faut procéder au paiement) puis effectuez la tâche Clés d’idempotence afin qu'une nouvelle tentative de facturation ne soit jamais facturée deux fois. Sans cela, définissez les tentatives du lien de charge sur aucune pour mettre fin à l'incident.",
      links: [
        {
          label:
            'Bibliothèque des constructeurs AWS : sécuriser les tentatives avec des API idempotentes',
        },
        { label: 'Stripe API : requêtes idempotentes' },
        { label: 'RFC 9110 : méthodes idempotentes' },
      ],
      design: [{ label: 'Fournisseur de paiement' }],
    },
    'inverted-index': {
      term: 'Index inversé',
      definition:
        "Un index qui mappe chaque mot à la liste des documents qui le contiennent, comme l'index à la fin d'un livre. Les moteurs de recherche en texte intégral tels que Lucene et Elasticsearch l'utilisent, et PostgreSQL le propose comme index GIN. Une recherche lit quelques listes courtes au lieu d'analyser chaque ligne.",
      inGame:
        "Jusqu'à ce que vous placiez un moteur de recherche, la base de données répond elle-même à q-search, à 80 ms de CPU par recherche : dix fois une lecture normale. La recherche en texte intégral déverrouille le moteur de recherche, qui répond à 400 recherches par seconde et par pas de taille en 15 ms environ. Liez-le à vos serveurs applicatifs et la recherche arrête de charger la base de données.",
      links: [
        { label: 'Livre Stanford IR : Construire un index inversé' },
        { label: 'Documents PostgreSQL : index GIN' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'jit-warmup': {
      term: 'Montée en régime du JIT',
      definition:
        "Un compilateur juste à temps (JIT) transforme le code fréquemment exécuté en code machine optimisé pendant l'exécution du programme. Jusqu'à ce qu'il ait profilé et compilé les chemins chauds, un nouveau processus s'exécute en dessous de sa vitesse maximale, de sorte que ses premières secondes ou minutes sont lentes. Le JVM et .NET s'échauffent de cette façon ; la compilation à plusieurs niveaux et les profils anticipés raccourcissent l’échauffement.",
      inGame:
        "Chaque runtime a une vitesse de démarrage et un temps de préchauffage. Un serveur d'applications Tomcat (Java) froid démarre à une vitesse CPU de 30 % et atteint sa pleine vitesse après 30 s ; Kestrel (C#) démarre à 60 % et Node.js à 80 % pendant 15 s, tandis que Go, BEAM et Tokio démarrent à pleine vitesse. Chaque redémarrage, redimensionnement, changement de pile et nouvelle copie de l'Autoscaler démarre à froid, alors ajoutez de la capacité avant un pic, pas pendant celui-ci. À la place, PHP réchauffe son OPcache : de 1 × à 2,5 × la vitesse de CPU à mesure que le cache se remplit.",
      links: [
        { label: 'OpenJDK JEP 515 : Profilage de méthodes anticipées' },
        { label: 'Microsoft : Comment fonctionne la compilation hiérarchisée dans OpenJDK' },
        { label: 'Wikipédia : compilation juste à temps' },
      ],
      design: [{ label: 'Comportements d’exécution' }],
    },
    'leaderless-replication': {
      term: 'Réplication sans leader',
      definition:
        "Réplication sans leader unique : un client envoie chaque écriture à plusieurs réplicas et en lit plusieurs, et un quorum décide. Dynamo d'Amazon a fait connaître le design et Cassandra l'utilise. Il continue d'écrire lorsque certaines répliques échouent, au prix de lectures qui peuvent être obsolètes à moins que R + W > N.",
      inGame:
        "La recherche de réplication sans leader (après Sharding) déverrouille le magasin à larges colonnes. Chaque clé vit sur N répliques (1 à 5, par défaut 3), une lecture en demande R et une écriture attend W (par défaut 1 et 1). Avec R + W > N, chaque lecture voit la dernière écriture ; avec moins, certaines lectures reviennent obsolètes. Une écriture coûte N opérations de réplica et une lecture coûte R, sur 30 000 par seconde par pas de taille, et si une défaillance d'instance prend une réplique, les quorums qui ont besoin de chaque réplique échouent.",
      links: [
        { label: "Dynamo : la boutique clé-valeur hautement disponible d'Amazon" },
        { label: 'Documentation Apache Cassandra : Dynamo' },
      ],
      design: [],
    },
    'leap-smearing': {
      term: 'Étalement de la seconde intercalaire',
      definition:
        'Une correction d’horloge pour la seconde intercalaire : un serveur étale la seconde supplémentaire sur une longue fenêtre, souvent une journée entière, si bien que son horloge ralentit très légèrement et ne saute jamais. Google et Amazon le font sur leurs propres horloges. C’est le saut qui fait mal, car une seconde répétée fait déclencher les minuteurs deux fois et expirer les baux trop tôt.',
      inGame:
        'L’incident Seconde intercalaire ou dérive d’horloge fait répondre chaque Nœud d’une région avec 1 000 ms de retard et expirer 10 % de ses réponses, jusqu’à ce que vous redémarriez les Nœuds ou qu’il s’éteigne au bout de 60 s. L’étalement de la seconde intercalaire (Série C) est la recherche qui empêche le saut de se produire. Le Défi Seconde intercalaire met en scène le même événement sous forme de panne régionale du Serveur applicatif.',
      links: [{ label: 'Google: Leap Smear' }, { label: 'Cloudflare: How and why we leap smear' }],
      design: [{ label: 'Les six types d’incident' }],
    },
    'littles-law': {
      term: 'Loi de Little',
      definition:
        "Dans tout système stable, le nombre moyen d'éléments à l'intérieur de (L) est égal au taux d'arrivée moyen (λ) multiplié par le temps moyen que chaque élément passe à l'intérieur (W) : L = λW. John Little l'a prouvé en 1961, et cela tient quel que soit le schéma d'arrivée ou l'ordre de service. Pour un serveur, requêtes en cours = requêtes par seconde × secondes que prend chaque requête.",
      inGame:
        "Un serveur d'applications qui contient un processus ou un thread par requête dispose d'un nombre fixe d'emplacements, et chaque requête conserve son emplacement pendant son temps CPU plus chaque appel de base de données qu'elle attend. Emplacements utilisés = taux d'arrivée × ce temps, donc lorsque chaque requête attend 10 fois plus longtemps sur la base de données, un pool PHP-FPM de 5 nœuds de calcul traite jusqu'à 10 fois moins de requêtes. Corrigez l'appel lent, ajoutez des nœuds de calcul ou des threads, ou passez à un environnement d'exécution qui attend sans emplacement (Node.js, Go, Kestrel, BEAM, Tokio).",
      links: [
        { label: "Little (1961) : Une preuve de la formule de file d'attente L = λW" },
        { label: 'Wikipédia : la loi de Little' },
      ],
      design: [{ label: 'Couplage de latence entre Nœuds' }],
    },
    'load-balancer': {
      term: 'Répartiteur de charge',
      definition:
        "Un serveur qui répartit les requêtes entrantes sur un groupe de serveurs backend et arrête les envois à un backend dont la vérification de l'état échoue. Il vous permet d'ajouter des serveurs derrière une adresse et décide quel serveur reçoit chaque demande.",
      inGame:
        'La recherche Répartition de charge débloque le répartiteur de charge, qui traite 2 000 requêtes par seconde et par palier de taille et ajoute 1 ms. Par défaut il répartit le trafic selon la capacité de chaque serveur applicatif. Il retire un hôte mort à sa prochaine vérification d’état, toutes les 10 s par défaut, alors que le round robin DNS continue d’envoyer vers un hôte mort. Algorithmes de répartition ajoute les connexions les moins chargées et le choix entre deux serveurs, et Vérifications d’état permet de vérifier toutes les 2 s ou 30 s. La recherche Répartition de charge L4 bascule un nœud en couche 4 : 20 000 requêtes par seconde, un saut de 0,2 ms et 0,6× le coût d’exploitation, sans routage par type ni nouvelles tentatives, car il ne lit jamais le HTTP.',
      links: [
        { label: "Cloudflare : Qu'est-ce que l'équilibrage de charge ?" },
        { label: 'Livre Google SRE : Équilibrage de charge dans le centre de données' },
        { label: 'NGINX : utiliser nginx comme répartiteur de charge HTTP' },
      ],
      design: [],
    },
    'load-shedding': {
      term: 'Délestage',
      definition:
        "Rejeter volontairement certaines requêtes lorsqu'un serveur est surchargé, afin que les requêtes qu'il conserve se terminent à temps au lieu d'expirer toutes. Une bonne délestage rejette tôt, avant que le travail n'utilise des ressources, et abandonne en premier le travail le moins important ou le moins cher.",
      inGame:
        "Une fois le délestage prioritaire recherché, vous pouvez activer le délestage sur un serveur d'applications. Au-dessus de 90 % de charge, il supprime tous les types de requêtes, la valeur la plus basse en premier (bots, puis temps réel, puis pages vues et plus), jusqu'à ce que sa charge revienne à 90 %, de sorte qu'un paiement de 25 $ survit à une surcharge. Les requêtes abandonnées comptent comme des erreurs et dépensent le budget d’erreur, mais les requêtes conservées restent rapides.",
      links: [
        {
          label:
            'Bibliothèque des constructeurs AWS : utiliser le délestage pour éviter les surcharges',
        },
        { label: 'Livre Google SRE : Gérer la surcharge' },
        { label: 'Livre Google SRE : Résoudre les échecs en cascade' },
      ],
      design: [{ label: 'Boîte à outils d’atténuation des incidents' }],
    },
    'memory-leak': {
      term: 'Fuite de mémoire',
      definition:
        "Mémoire qu'un processus de longue durée conserve allouée mais n'utilise plus, de sorte que son utilisation de la mémoire augmente avec la disponibilité. Dans les langages ramassés, une fuite est généralement un objet qui reste accessible par erreur, comme un cache qui ne fait que croître ou un écouteur que personne ne supprime. Le processus ralentit à mesure qu'il échange ou collecte des déchets, et le système d'exploitation le tue lorsque la mémoire est épuisée.",
      inGame:
        "L'incident de fuite de mémoire frappe un serveur d'applications dont le runtime conserve ses processus entre les requêtes (chaque runtime sauf Apache mod_php et PHP-FPM). Il gagne 2,5 % de son RAM chaque seconde ; au-delà de son RAM, il permute et ralentit, et à 125 % de RAM, le noyau le tue et il redémarre à froid. Redémarrez le serveur pour libérer la mémoire ou envoyez la tâche Réparer les fuites de mémoire (15 heures de développement), qui arrête les fuites jusqu'à ce que la prochaine fonctionnalité soit livrée.",
      links: [
        { label: 'Wikipédia : fuite de mémoire' },
        { label: 'Node.js Apprendre : Diagnostics de la mémoire' },
        { label: 'Documents Oracle Java : Résoudre les fuites de mémoire' },
      ],
      design: [{ label: 'Comportements d’exécution' }],
    },
    'materialized-view': {
      term: 'Vue matérialisée',
      definition:
        'Le résultat stocké d’une requête, gardé sur disque et rafraîchi selon un calendrier, pour qu’un rapport lise la réponse au lieu de balayer les tables. C’est rapide, et ce n’est frais que jusqu’au dernier rafraîchissement.',
      inGame:
        'La recherche Vues matérialisées ajoute une vue à la carte d’une base. Un rapport balaie la vue stockée pour moitié moins de CPU (10), et 5 % des réponses de rapport sont périmées, d’avant le dernier rafraîchissement. C’est le jumeau côté base de l’entrepôt de données : les mêmes balayages bon marché sans second système.',
      links: [{ label: 'Documentation PostgreSQL : vues matérialisées' }],
      design: [{ label: 'Entrepôt de données et vues' }],
    },
    'metastable-failure': {
      term: 'Défaillance métastable',
      definition:
        "Un échec qui perdure après la disparition de son élément déclencheur. Un bref ralentissement met le système dans un mauvais état, et une boucle de rétroaction, le plus souvent réessayée, maintient la charge au-dessus de sa capacité, de sorte que le système reste arrêté jusqu'à ce que quelqu'un coupe la charge. Bronson et d’autres ont nommé cette classe d’échec en 2021.",
      inGame:
        "L’incident de tempête de nouvelle tentative ralentit la base de données à 30 % de sa capacité pendant 20 s. Les liens qui réessayent immédiatement envoient jusqu'à 1 + f + f² + f³ appels par appel lorsqu'un partage f échoue, ils transportent ce partage d'échec dans l'étape suivante et la base de données met en file d'attente ce qu'elle ne peut pas prendre ; l’incident ne prend fin que lorsque cet arriéré s’épuise. L'interruption avec gigue, les disjoncteurs et le délestage de charge prioritaire interrompent chacun la boucle, et les tentatives naïves dans une base de données rendent cet incident 6 fois plus probable que l'interruption.",
      links: [
        {
          label: 'Bronson et coll. (HotOS 2021) : pannes métastables dans les systèmes distribués',
        },
        { label: 'Huang et coll. (OSDI 2022) : échecs métastables dans la nature' },
        { label: 'Marc Brooker : Métastabilité et systèmes distribués' },
      ],
      design: [{ label: 'Tempête de tentatives' }],
    },
    mirror: {
      term: 'Miroir',
      definition:
        'Exécuter le même code d’infrastructure dans une autre région, comme un module Terraform appliqué une fois par région ou un StackSet CloudFormation. Les serveurs se copient facilement. Pas les données : chaque copie doit décider où vont ses écritures.',
      inGame:
        'Après la recherche Infrastructure as code, le bouton Miroir à côté des onglets de région copie les Nœuds et Liens d’une région dans une autre. Pour chaque Base de données, choisissez une réplique en lecture, une primaire propre ou l’appel à la source ; pour le Stockage objet, répliquer ou appeler la source. Appliquer paie tout de suite, et les nouveaux Nœuds arrivent froids après le temps de construction. Les Utilisateurs de la région n’ont leurs Liens qu’à l’arrivée du plan. Le Miroir reste lié à sa source, donc il peut dériver ; GitOps le garde synchronisé tout seul.',
      links: [
        { label: 'Documentation Terraform : vue d’ensemble des modules' },
        { label: 'Documentation AWS : travailler avec les StackSets CloudFormation' },
      ],
      design: [{ label: 'Mettre une région en miroir' }],
    },
    'model-inference': {
      term: 'Inférence de modèle',
      definition:
        "Exécuter un modèle d'apprentissage automatique entraîné pour produire une réponse, plutôt que de la former. Pour un modèle de langage volumineux, un GPU génère la réponse jeton par jeton, de sorte que le coût et la vitesse sont mesurés en jetons par seconde et en temps jusqu'au premier jeton. Vous pouvez louer des GPU et servir le modèle vous-même, ou payer un API hébergé par jeton.",
      inGame:
        "Une requête ai envoie une invite de 400 jetons à un nœud d'inférence. Le LLM API (Hosted models recherche) n'a pas besoin de GPU : il coûte 2,50 $ pour 1 000 jetons, prend 600 ms pour le premier jeton et limite les invites au-dessus de 100 par seconde et par niveau d'utilisation. Un nœud GPU (Model servant recherche) prend 300 ms pour le premier jeton et génère 200 jetons par seconde par T4, 900 par A100 ou 2 000 par H100. Sa gravure est la même, qu'il soit occupé ou inactif, donc un H100 est moins cher que le LLM API seulement tant qu'il reste occupé aux deux tiers environ.",
      links: [
        { label: 'Cloudflare : inférence IA vs formation' },
        { label: 'Documentation vLLM' },
        { label: 'Papier PagedAttention (vLLM)' },
      ],
      design: [],
    },
    'mttd-and-mtta': {
      term: 'MTTD et MTTA',
      definition:
        "Le temps moyen de détection est le temps moyen entre le début d'une panne et le signal qui la révèle. Le temps moyen de prise en compte est le temps moyen entre ce signal et le moment où quelqu'un prend l'incident. Le livre SRE de Google compte les deux à côté du MTTR, car une équipe qui répare vite mais remarque tard reste lente.",
      inGame:
        "Chaque incident enregistre la seconde de simulation où son premier signal arrive et celle où un joueur agit pour la première fois, et son post-mortem affiche le MTTD et le MTTA à côté du MTTR. Avec Alertes, le signal est le bip, à la seconde où le seuil d'une règle est franchi ; sans elles, c'est le plateau, à la première seconde où plus de 1 % des demandes échouent. L'astreinte répond au bip cinq minutes calendaires après son arrivée, ce qui est le MTTA qu'une rotation tient ; sinon, la première action du joueur est la prise en compte.",
      links: [
        { label: 'Livre SRE de Google : être d’astreinte' },
        { label: 'Wikipédia : temps moyen de récupération' },
      ],
      design: [{ label: 'La boucle d’incident' }],
    },
    mttr: {
      term: 'MTTR',
      definition:
        "Temps moyen de restauration (ou de récupération) : temps moyen entre le début d'une panne et le moment où le service fonctionne à nouveau. Il mesure la rapidité avec laquelle une équipe détecte, diagnostique et résout les problèmes. DORA mesure une version plus étroite, le temps de récupération du déploiement échoué.",
      inGame:
        "Chaque incident se termine par un post-mortem qui affiche son MTTR : les minutes calendaires au cours desquelles plus de 1 % des demandes ont échoué. Il affiche aussi le MTTD et le MTTA qui l'ont précédé, et une équipe SRE avec un ingénieur dessus réduit la durée, donc le MTTR, de 40 %. Un incident qui a blessé les utilisateurs plus de la moitié du temps à mi-parcours augmente d'un niveau de gravité et dure 1,5 fois plus longtemps. Maintenez MTTR en panne en agissant rapidement : redémarrez, remplacez, drainez ou faites basculer le nœud touché et recherchez l'élément d'action du post-mortem.",
      links: [
        { label: 'Wikipédia : temps moyen de récupération' },
        { label: 'DORA : mesures de performances de livraison de logiciels' },
      ],
      design: [{ label: 'La boucle d’incident' }],
    },
    'n1-query': {
      term: 'requête N+1',
      definition:
        'Charger une liste avec une requête, puis exécuter une requête supplémentaire par élément pour récupérer ses données associées : N éléments coûtent N + 1 requêtes. Les ORM provoquent ce problème avec le chargement différé, qui cache les requêtes supplémentaires derrière un code d’apparence ordinaire. Le chargement anticipé récupère au contraire les lignes associées en une ou deux requêtes.',
      inGame:
        "Laravel, Rails et Django utilisent un ORM qui envoie 3 requêtes de lecture là où 1 suffirait, sur les pages vues et les lectures API. Une vue de page coûte alors à la base de données 6 lectures au lieu de 2, ce qui y ajoute CPU et du temps d'attente sur l'serveur applicatif. Recherchez le chargement anticipé, puis expédiez la tâche de chargement anticipé (10 heures de développement) pour les supprimer ; Symfony et les cadres légers ne les fabriquent jamais.",
      links: [
        { label: 'Guides Rails : Associations de chargement impatientes' },
        { label: 'Documents Django : select_rated' },
        { label: 'Documents Laravel : chargement impatient' },
      ],
      design: [{ label: 'Comportements des frameworks' }],
    },
    'network-partition': {
      term: 'Partition réseau',
      definition:
        "Une panne de réseau qui divise un système en groupes de nœuds qui ne peuvent pas se joindre, tandis que chaque groupe continue de fonctionner. Lors d'une partition, un système distribué doit choisir entre rester disponible et rester cohérent (théorème CAP).",
      inGame:
        "L'incident de partition réseau peut démarrer en série C lorsque les liens traversent des régions. Pendant 45 s maximum, chaque appel entre régions expire, à l'exception des appels des utilisateurs et des composants globaux tels que le CDN, et les écritures basées sur le leader divergent. Appuyez sur Fence leader pour y mettre fin. Un nœud SQL distribué, qui conserve un leader de radeau, rend l'incident moins probable.",
      links: [
        { label: "File d'attente ACM : le réseau est fiable" },
        { label: 'InfoQ : CAP douze ans plus tard' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'node-drain': {
      term: 'Drainage d’un nœud',
      definition:
        "Retirer volontairement un serveur de la rotation : cesser de lui envoyer du travail neuf, laisser finir les requêtes et tâches qu'il détient, puis l'arrêter ou le mettre à niveau. Le drainage de connexions d'un répartiteur de charge et `kubectl drain` de Kubernetes fonctionnent ainsi. Tuer un serveur occupé fait perdre ce qu'il était en train de faire.",
      inGame:
        "Avec Vérifications de santé recherchées, la fiche d'un nœud propose Drainer. Il ne prend plus de trafic immédiatement, sa part allant aux autres nœuds du chemin, et il termine ce qu'il détient : une file confie son arriéré à ses ouvriers. Dix secondes de simulation plus tard, vide, il réintègre la rotation. Drainer le nœud qu'un incident frappe réduit cet incident à la fenêtre de drainage de 10 s, et un nœud sans autre copie pour prendre la charge laisse toutes les demandes qui lui sont envoyées sans destination.",
      links: [
        { label: 'Documentation Kubernetes : drainer un nœud en sécurité' },
        { label: 'Documentation NGINX : proxy inverse' },
        { label: 'Documentation AWS : délai de dérégistration d’un groupe cible' },
      ],
      design: [{ label: 'Boîte à outils d’atténuation des incidents' }],
    },
    'object-storage': {
      term: 'Stockage objet',
      definition:
        "Stockage qui conserve les fichiers en tant qu'objets dans un espace de noms plat, chacun avec une clé, les données et les métadonnées, accessibles via un HTTP API. Les services tels qu'Amazon S3 évoluent presque sans limite et facturent les octets stockés et déplacés. Cela convient aux téléchargements, aux images, aux vidéos et aux sauvegardes qu'une base de données gère mal.",
      inGame:
        "Jusqu'à ce que vous placiez stockage objet, la base de données stocke les téléchargements sous forme de lignes : chaque blob-put de 2 Mo lui coûte 60 ms de CPU. La recherche sur le stockage objet débloque le stockage objet, qui accepte les téléchargements et les lectures de fichiers sans limite de capacité et avec 40 ms de latence. Son dépenses augmente avec chaque Go stocké, au prix S3 Standard, de sorte que la facture continue d'augmenter à mesure que les utilisateurs téléchargent.",
      links: [
        { label: "AWS : Qu'est-ce qu'Amazon S3 ?" },
        { label: 'Cloudflare : Qu’est-ce que le stockage d’objets ?' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    observability: {
      term: 'Observabilité',
      definition:
        "Dans quelle mesure vous pouvez comprendre ce que fait un système à partir des données qu'il émet, généralement des journaux, des métriques et des traces. Une bonne observabilité vous permet de répondre à de nouvelles questions sur une panne sans envoyer de nouveau code.",
      inGame:
        "La recherche d'observabilité vous montre davantage le grand livre. Les journaux structurés répartissent les erreurs par cause, les métriques ajoutent des graphiques d'historique à chaque nœud, les centiles affichent p50, p95 et p99, et les alertes affichent une bannière de pager lorsque les erreurs, p99 ou la saturation dépassent un seuil. Le nœud Analytique échantillonne le trafic des nœuds que vous y associez, de 1 % à 100 %, et le transforme en connaissances. Chaque échantillon en apprend davantage à mesure que Apdex chute, jusqu'à deux fois plus, et un taux d'échantillonnage plus élevé coûte plus de CPU et de dépenses. Métriques ouvre également le tableau de bord (D), qui trace votre architecture au fil du temps.",
      links: [
        { label: "OpenTelemetry : Guide d'observabilité" },
        { label: 'Livre Google SRE : Surveillance des systèmes distribués' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'oltp-and-olap': {
      term: 'OLTP et OLAP',
      definition:
        "Le traitement des transactions en ligne (OLTP) exécute de nombreuses petites lectures et écritures rapides sur les lignes actuelles, telles que les commandes et les connexions. Le traitement analytique en ligne (OLAP) exécute quelques analyses et agrégations volumineuses sur l'historique, telles que des rapports. Les bases de données OLTP stockent chaque ligne ensemble ; Les moteurs OLAP stockent généralement chaque colonne ensemble, de sorte qu'une analyse ne lit que les colonnes dont elle a besoin.",
      inGame:
        "Les demandes de rapport envoient des requêtes q-scan. Sur la base de données, une analyse coûte beaucoup de CPU et expulse son cache tampon, donc les autres lectures vont sur le disque et les écritures attendent ; le rapport tue la base de données. Les incidents analysent 10 fois plus. Un entrepôt de données (recherche sur l'entreposage de données) supprime les analyses du primaire : 1,5 s chacune, sans limite de capacité et 0,02 $ par analyse multiplié par l'indice de coût de l'étape.",
      links: [
        { label: 'AWS : OLTP contre OLAP' },
        { label: 'Wikipédia : traitement analytique en ligne' },
        { label: 'Wikipédia : traitement des transactions en ligne' },
      ],
      design: [{ label: 'Entrepôt de données' }],
    },
    'on-call': {
      term: 'Astreinte',
      definition:
        "Une rotation d'ingénieurs qui portent le bip et répondent aux alertes en dehors des heures de travail, afin qu'un bip atteigne une personne plutôt que celui qui regarde un tableau de bord par hasard. Une bonne astreinte est calme, bornée, et se paie en sommeil.",
      inGame:
        "La recherche Astreinte (série A, après Alertes) met l'équipe sur le bip. La rotation prend en compte un incident cinq minutes calendaires après son premier signal, donc son MTTA est court même quand le joueur est absent, et le post-mortem l'affiche. Sans elle, un bip attend le premier clic du joueur.",
      links: [
        { label: 'Livre SRE de Google : être d’astreinte' },
        { label: 'PagerDuty : qu’est-ce qu’une astreinte ?' },
      ],
      design: [{ label: 'La boucle d’incident' }],
    },
    'operating-margin': {
      term: 'Marge opérationnelle',
      definition:
        "Bénéfice d'exploitation en part du chiffre d'affaires : (revenu − coûts d'exploitation) / chiffre d'affaires. Les coûts de fonctionnement comprennent l'hébergement, les salaires et les frais. Il montre quelle part de chaque dollar de chiffre d’affaires l’entreprise conserve après avoir payé pour fonctionner elle-même.",
      inGame:
        "La marge du jeu est (revenu − dépenses) / revenus, où dépenses est la facture cloud plus les salaires, la sortie et les frais de tiers ; sans revenus, il indique −100 %. La marge plus la croissance annuelle des utilisateurs correspond à votre règle de 40, qui définit le multiple de valorisation : 4 + 0,15 × la règle de 40, de 2 à 30. Dans l'étape cotée, vous définissez des directives de marge de 10 %, 20 % ou 30 % chaque trimestre, et un battement augmente le multiple tandis qu'un échec le diminue.",
      links: [{ label: 'Investopedia : Marge opérationnelle' }, { label: 'Wikipédia' }],
      design: [],
    },
    'percentile-p50-p95-p99': {
      term: 'Centile (p50, p95, p99)',
      definition:
        'Valeur en dessous de laquelle tombe une part donnée de mesures. La latence p50 (médiane) correspond à ce que voit une requête typique ; le p99 est la latence que 99 % des requêtes battent, donc 1 requête sur 100 est plus lente. Les moyennes masquent les valeurs aberrantes lentes, de sorte que les SLO et les alertes utilisent généralement des percentiles élevés.',
      inGame:
        "Avant la recherche des centiles, le HUD affiche la latence moyenne ; après cela, le HUD affiche le p99 et chaque type de requête affiche ses p50, p95 et p99. Les blocages de boucles d'événements et les pauses du GC touchent environ 2 % des demandes, ils augmentent donc le p99 alors que la moyenne et le p95 bougent à peine. Avec Alerting, la règle de latence vous avertit lorsque le p99 d'un type reste supérieur à 4 fois son objectif Apdex pendant 30 s (le seuil par défaut). Le graphique de latence sur le tableau de bord dessine le p99 à côté de la moyenne, afin que vous puissiez voir à quel point la moyenne se cache.",
      links: [
        { label: 'Livre Google SRE : Objectifs de niveau de service' },
        { label: 'Wikipédia : centile' },
      ],
      design: [{ label: 'Centiles' }],
    },
    'point-in-time-recovery': {
      term: 'Restauration à un instant précis',
      definition:
        "Restaurer une base de données dans son état exact à un moment choisi, en chargeant une sauvegarde de base puis en rejouant le journal d'écriture anticipée jusqu'à ce moment. Le journal étant archivé en continu, vous ne perdez que les dernières minutes d'écriture, pas une journée entière.",
      inGame:
        "La recherche de récupération ponctuelle ajoute des sauvegardes à la carte de base de données : Aucune, Tous les soirs ou PITR. Les instantanés nocturnes peuvent perdre un jour calendaire d'écritures et ajouter 5 % à la gravure de la base de données. PITR perd environ 2 minutes calendaires et ajoute 15 %. L'exercice DR pour la liste de contrôle IPO lit ce RPO et ne prend que moins de 5 minutes, à moins qu'une réplique dans une autre région couvre déjà les données.",
      links: [
        { label: 'Documents PostgreSQL : Archivage continu et PITR' },
        { label: "AWS : Restauration d'une instance RDS à une heure spécifiée" },
      ],
      design: [],
    },
    'power-of-two-choices': {
      term: 'Choix entre deux serveurs',
      definition:
        "Une méthode d'équilibrage de charge : choisir deux serveurs au hasard et envoyer la requête au moins chargé. Mitzenmacher a montré que deux choix aléatoires répartissent la charge de manière exponentielle mieux qu'un, et que l'équilibreur n'a pas besoin d'une vue exacte et partagée de la charge de chaque serveur. NGINX le propose sous forme de deux least_conn aléatoires.",
      inGame:
        "Avec les algorithmes d'équilibrage de charge recherchés, un répartiteur de charge peut utiliser deux choix. Il ne conserve aucun état global, donc l'répartiteur de charge gère lui-même 1,5 fois le trafic, mais 10 % du trafic est réparti uniformément quelle que soit la charge de chaque serveur. La connexion minimale est entièrement divisée en fonction de la capacité actuelle, sans le bonus de capacité.",
      links: [
        {
          label:
            "Mitzenmacher (2001) : La puissance de deux choix dans l'équilibrage de charge aléatoire",
        },
        { label: 'Documents NGINX : module en amont (aléatoire)' },
      ],
      design: [{ label: 'Politiques du Répartiteur de charge' }],
    },
    'pre-fork-worker-model': {
      term: 'Modèle de processus précréés',
      definition:
        "Une architecture de serveur dans laquelle un processus maître démarre à l'avance un pool fixe de processus de travail et chaque processus traite une demande à la fois. Apache prefork, PHP-FPM et Gunicorn fonctionnent de cette façon. Il isole bien les requêtes, mais chaque processus coûte de la mémoire, et une requête qui attend retient son processus.",
      inGame:
        "PHP-FPM et Gunicorn de Python exécutent un pool de nœuds de calcul que vous dimensionnez de 1 à 400 sur la carte serveur applicatif ; PHP-FPM commence par 5. Chaque processus prend une requête, donc les appels lents à la base de données remplissent le pool, et chaque processus coûte RAM (120 Mo dans Gunicorn), donc un grand pool peut échanger. Le mode statique du PHP-FPM maintient l'ensemble de la pool en résidence. Les modes Dynamique et À la demande économisent de la mémoire mais font que 2% ou 10% des requêtes attendent 20 ou 50 ms pour un fork.",
      links: [
        { label: 'Documents Gunicorn : Architecture' },
        { label: 'Serveur Apache HTTP : préfork MPM' },
        { label: 'Manuel PHP : configuration FPM' },
      ],
      design: [],
    },
    'process-per-request': {
      term: 'Un processus par requête',
      definition:
        "Un modèle de serveur dans lequel chaque requête en cours occupe tout un processus de travail jusqu'à ce qu'il se termine, comme dans Apache prefork avec mod_php, PHP-FPM et Gunicorn sync Workers. Il isole bien les requêtes, mais chaque requête en attente contient un processus et sa mémoire, donc la taille du pool et le RAM limitent le nombre de requêtes exécutées simultanément.",
      inGame:
        "Apache mod_php, le runtime de départ, exécute un processus par requête en cours, jusqu'à 150, chacun 60 Mo, car il intègre PHP, donc RAM s'épuise plus tôt. PHP-FPM et Gunicorn gèrent un pool fixe que vous dimensionnez (PHP-FPM est livré avec 5 processus) ; une requête retient son processus pendant qu'elle attend dans la base de données, et un pool trop grand pour la boîte s'échange jusqu'à ce que le noyau le tue. Chaque processus possède également sa propre connexion à la base de données, de sorte qu'un grand pool peut atteindre la limite de 100 connexions du Postgres.",
      links: [
        { label: 'Serveur Apache HTTP : préfork MPM' },
        { label: 'Manuel PHP : Gestionnaire de processus FastCGI (FPM)' },
        { label: 'Documents Gunicorn : Architecture' },
      ],
      design: [{ label: 'Modèles de concurrence' }],
    },
    quantization: {
      term: 'Quantification',
      definition:
        'Stocker les poids d’un modèle à une précision inférieure, par exemple des entiers 8 ou 4 bits au lieu de flottants 16 bits, pour qu’il tienne dans moins de mémoire et calcule plus vite, au prix d’une certaine qualité de réponse.',
      inGame:
        'La recherche Quantification ajoute FP16, INT8 et INT4 à un nœud GPU. INT8 sert 2× les jetons et INT4 3×, et chaque réponse vaut 5 % ou 15 % de moins. Elle paie quand le GPU est le goulot et que les réponses peuvent être un peu moins bonnes.',
      links: [{ label: 'Documentation Hugging Face : quantification' }],
      design: [{ label: 'Nœud GPU et précision' }],
    },
    quorum: {
      term: 'Quorum',
      definition:
        'Le nombre de répliques qui doivent répondre avant qu’une lecture ou une écriture soit considérée comme terminée. Avec N répliques, un quorum de lecture R et un quorum d’écriture W, R + W > N signifie que chaque lecture interroge au moins une réplique qui a la dernière écriture. Ce n’est pas de la linéarisabilité, car les écritures concurrentes, les écritures échouées et les quorums approximatifs peuvent encore renvoyer d’anciennes valeurs.',
      inGame:
        'Un Magasin à larges colonnes garde chaque clé sur N répliques (1 à 5), et vous réglez R, les répliques qu’une lecture interroge, et W, les répliques qu’une écriture attend. Avec R + W > N, les lectures ne ratent jamais la dernière écriture. Un quorum plus faible coûte moins d’opérations de réplique et attend une réponse plus tôt, mais certaines lectures reviennent périmées. Un quorum qui exige toutes les répliques échoue tant qu’une réplique est perdue. Même un quorum fort subit 2 % de paiements périmés et 1 % de paiements en double.',
      links: [
        { label: 'Documentation Apache Cassandra : Cohérence réglable' },
        { label: 'DeCandia et coll. (2007) : Dynamo' },
        { label: 'Wikipédia : Quorum (informatique distribuée)' },
      ],
      design: [{ label: 'Magasin à larges colonnes' }],
    },
    raft: {
      term: 'Raft',
      definition:
        "Un algorithme de consensus qui conserve un journal répliqué identique sur un groupe de serveurs. Un leader élu annexe chaque entrée et la valide une fois qu'une majorité l'a stockée, de sorte que le groupe continue de travailler lorsqu'une minorité échoue et ne s'engage jamais sur deux valeurs différentes. Ongaro et Ousterhout l'ont conçu en 2014 pour être plus facile à comprendre que Paxos ; etcd et CockroachDB l'utilisent.",
      inGame:
        "SQL distribué (recherche de bases de données consensuelles, qui nécessite une réplication synchrone) exécute SQL sur Raft. Chaque écriture attend l'aller-retour vers la majorité des régions sur lesquelles elle s'étend, tandis qu'une lecture demande au titulaire du bail et coûte un quart d'écriture. Il traite 6 000 transactions par seconde à la taille 1 et conserve un leader via une partition réseau, de sorte que l'incident soit quatre fois plus probable avec lui.",
      links: [
        { label: "L'algorithme de consensus Raft" },
        {
          label:
            "Ongaro et Ousterhout (2014) : À la recherche d'un algorithme de consensus compréhensible",
        },
        { label: 'Documentation CockroachDB : Couche de réplication' },
      ],
      design: [{ label: 'Distribué SQL' }],
    },
    'rate-limiting': {
      term: 'Limitation de débit',
      definition:
        "Limiter le nombre de demandes qu'un client peut effectuer au cours d'une période et rejeter le reste, souvent avec HTTP 429 Too Many Requests. Il protège un service contre les abus, les scrapers et un client bruyant, et permet à un fournisseur de partager équitablement la capacité. Les algorithmes courants sont le compartiment à jetons, le compartiment qui fuit et les fenêtres fixes ou coulissantes.",
      inGame:
        'L’API LLM vous limite côté client : elle accepte 100 invites par seconde et par palier d’usage, et au-delà les invites échouent aussitôt en throttled. La passerelle API applique la même limite à vos propres services : choisissez un plafond en requêtes par seconde et les requêtes au-delà échouent en throttled, un seul plafond pour tout le nœud plutôt qu’un seau par utilisateur ou par clé d’API. La recherche Limitation de débit transforme le plafond en seau à jetons : il se remplit à chaque pas et garde 200 requêtes de plus, donc une rafale qui tient passe entière. Pour arrêter le trafic abusif, un WAF bloque plutôt les robots par règle : 80 % des robots au niveau de paranoïa 2, avec 0,5 % d’utilisateurs réels bloqués aussi.',
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce que la limitation de débit ?" },
        { label: 'MDN : 429 demandes de trop' },
        { label: "RFC 6585 : codes d'état HTTP supplémentaires" },
      ],
      design: [{ label: 'Passerelle API' }],
    },
    'read-replica': {
      term: 'Réplique en lecture',
      definition:
        "Une copie d'une base de données qui suit les écritures du serveur principal et répond aux requêtes en lecture seule. Cela enlève la charge de lecture du primaire. La réplication est généralement asynchrone, donc une réplique peut être en retard et renvoyer des données un peu anciennes.",
      inGame:
        "La recherche sur les répliques en lecture déverrouille la réplique en lecture, qui fonctionne comme une base de données mais ne répond qu'à la lecture q. Il est en retard de 20 ms plus 2 ms pour chaque écriture par seconde, et jusqu'à 15 % de ses lectures reviennent obsolètes ; un incident de décalage de réplication rend le décalage dix fois plus important. Le routage de lecture-écriture envoie les lectures qui suivent une écriture au serveur principal. Un réplica dans une autre région limite également la quantité de données perdues en cas de panne de la région d'origine.",
      links: [
        { label: 'AWS : réplicas en lecture Amazon RDS' },
        { label: "Documents PostgreSQL : Redondance d'UC" },
      ],
      design: [],
    },
    'read-your-writes-consistency': {
      term: 'Cohérence de lecture de ses propres écritures',
      definition:
        "Une garantie de session : après qu'un client a écrit, ses propres lectures ultérieures voient cette écriture ou une plus récente, même si d'autres clients voient encore d'anciennes données. Il est important que les lectures soient effectuées sur des réplicas en retard sur le réplica principal ; un correctif courant envoie les lectures d'un utilisateur au serveur principal pendant une courte période après leur écriture. Terry et d'autres l'ont défini en 1994.",
      inGame:
        "Un réplica en lecture est en retard sur le réplica principal, de sorte que certaines lectures reviennent obsolètes, et une lecture obsolète fait échouer une lecture API ou une extraction qui lit sa propre écriture. Une fois le routage de lecture de vos écritures recherché, activez l'option sur un serveur d'applications : les lectures de paiement vont au principal et ne sont jamais périmées, et les autres lectures périmées chutent de 80 %. Cela rend également l'incident de décalage de réplication beaucoup plus rare (poids 0,3 au lieu de 2).",
      links: [
        { label: 'Jepsen : Lisez vos écrits' },
        {
          label:
            'Terry et coll. (1994) : Garanties de session pour les données répliquées faiblement cohérentes',
        },
      ],
      design: [{ label: 'Réplique en lecture' }],
    },
    'red-method': {
      term: 'Méthode RED',
      definition:
        "Taux, erreurs et durée pour chaque service : combien de requêtes il reçoit, combien échouent et combien de temps cela prend. Il mesure ce que ressentent les utilisateurs, donc les alertes le surveillent. Tom Wilkie l'a nommé comme une version de niveau service des quatre signaux d'or de Google.",
      inGame:
        "Le tableau de bord (D) s'ouvre après la recherche de métriques. Ses diagrammes en lignes Golden signalent le trafic, la latence et, avec les journaux structurés, les erreurs de l'ensemble de votre système au fil du temps. Une ligne RED par service n'est pas encore créée ; utilisez la ligne des signaux dorés pour voir quand les utilisateurs ont commencé à souffrir.",
      links: [
        { label: 'Laboratoires Grafana : La méthode RED' },
        { label: 'Livre Google SRE : Surveillance des systèmes distribués' },
      ],
      design: [{ label: 'Lignes et graphiques du tableau de bord' }],
    },
    'redos-regular-expression-denial-of-service': {
      term: 'ReDoS (déni de service par expression régulière)',
      definition:
        "Un déni de service dans lequel une entrée contrefaite fait prendre un temps exponentiel ou très long à un moteur d'expression régulière de retour en arrière. Un mauvais modèle peut épingler un noyau CPU par requête.",
      inGame:
        "L'incident de backtracking Regex peut démarrer à partir de la série B lorsque vous exécutez un WAF. Une nouvelle règle WAF revient en arrière sur les entrées longues, et chaque WAF ne conserve que 10 % de sa capacité, de sorte que le trafic qui le traverse échoue ou est mis en file d'attente. Appuyez sur Désactiver la règle sur le WAF pour y mettre fin immédiatement. Dans les systèmes réels, un déploiement de règles Canary détecte ce problème avant qu'il n'atteigne chaque serveur.",
      links: [
        { label: 'OWASP : déni de service par expression régulière' },
        { label: 'Blog Cloudflare : Détails de la panne du 2 juillet 2019' },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'replication-lag': {
      term: 'Retard de réplication',
      definition:
        "Délai entre la validation d'une écriture sur la base de données principale et l'apparition de cette écriture sur une réplique. Un réplica asynchrone applique le journal du réplica principal après coup, de sorte que le décalage augmente avec le volume d'écriture, les requêtes de longue durée sur le réplica et le retard du réseau. Les lectures à partir d’une réplique en retard renvoient d’anciennes données.",
      inGame:
        "Un réplica en lecture est en retard de 20 ms plus 2 ms pour chaque écriture par seconde, et la part de ses lectures qui reviennent obsolètes est égale au décalage en secondes, jusqu'à 15 %. L’incident de décalage de réplication multiplie le décalage par 10, jusqu’à 50 % de lectures obsolètes. Les lectures obsolètes échouent lors des lectures et des extractions API, tandis que les pages vues les acceptent ; Le routage de lecture de vos écritures envoie les lectures concernées au serveur principal.",
      links: [
        { label: "Documents PostgreSQL : Redondance d'UC" },
        { label: 'Documents Amazon RDS : Utilisation des réplicas en lecture' },
      ],
      design: [{ label: 'Réplique en lecture' }],
    },
    'retry-with-backoff-and-jitter': {
      term: 'Nouvelles tentatives avec attente progressive et aléatoire',
      definition:
        "Réessayer un appel ayant échoué après une attente qui augmente à chaque tentative (intervalle exponentiel), avec une répartition aléatoire (instabilité), afin que les clients qui ont échoué ensemble ne réessayent pas ensemble. Un budget ou un plafond de nouvelles tentatives limite le nombre de tentatives d'appels supplémentaires pouvant être ajoutées, de sorte que les nouvelles tentatives ne peuvent pas multiplier la charge sur un service déjà en difficulté.",
      inGame:
        "Avant l'expiration du délai d'attente et les nouvelles tentatives de recherche, chaque lien attend 30 s et ne réessaye jamais. Après cela, vous définissez le délai d'attente de chaque lien sur 1, 5 ou 30 s et pouvez activer les tentatives : les tentatives naïves se déclenchent en même temps, jusqu'à trois fois, de sorte qu'un appelé pour lequel un partage f échoue reçoit 1 + f + f² + f³ appels par appel. L'interruption avec instabilité attend environ 200 ms par nouvelle tentative et autorise au maximum 10 % d'appels supplémentaires, ce qui permet de limiter la tempête de tentatives.",
      links: [
        {
          label:
            "Bibliothèque des constructeurs AWS : délais d'attente, tentatives et interruptions avec instabilité",
        },
        { label: "Blog sur l'architecture AWS : Intervalle exponentiel et gigue" },
        { label: 'Livre Google SRE : Résoudre les échecs en cascade' },
      ],
      design: [{ label: 'Retries' }],
    },
    'rpo-and-rto': {
      term: 'RPO et RTO',
      definition:
        "L'objectif du point de récupération (RPO) correspond aux données les plus récentes que vous pouvez vous permettre de perdre en cas de sinistre, mesurées en fonction du temps écoulé avant la panne. L'objectif de temps de récupération (RTO) est la durée maximale pendant laquelle le service peut rester indisponible avant de devoir fonctionner à nouveau. Ensemble, ils décident de la capacité de sauvegarde, de réplication et de veille dont un système a besoin.",
      inGame:
        "Les sauvegardes d'une base de données définissent son RPO : aucun ne perd tout, la nuit jusqu'à 1 440 minutes calendaires et PITR (recherche de récupération à un moment donné) 2 minutes. Un réplica en lecture dans une autre région le réduit au décalage de ce réplica, et un magasin à colonnes larges ou distribué SQL ne perd rien. L'exercice DR de la liste de contrôle IPO échoue dans la région d'origine et réussit uniquement lorsque les erreurs tombent en dessous de 1 % dans les 60 minutes civiles (RTO) et que le RPO est inférieur à 5 minutes.",
      links: [
        {
          label:
            'Livre blanc AWS : Récupération après sinistre des charges de travail (RPO et RTO)',
        },
        { label: 'Documents PostgreSQL : Archivage continu et récupération ponctuelle' },
      ],
      design: [
        { label: 'Données multirégions' },
        { label: 'Liste de contrôle de l’IPO et exercice de reprise' },
      ],
    },
    'rule-of-40': {
      term: 'Règle des 40',
      definition:
        "Une heuristique pour les entreprises de logiciels en tant que service : le taux de croissance annuel des revenus plus la marge bénéficiaire, tous deux en pourcentage, doivent être d'au moins 40. Elle vous permet de comparer une entreprise à croissance rapide et déficitaire avec une entreprise lente et rentable. Les investisseurs paient souvent des multiples de valorisation plus élevés aux entreprises supérieures à 40.",
      inGame:
        "Votre évaluation correspond au revenu annuel multiplié par un multiple issu du score de la règle de 40 : 4 + 0,15 × le score, maintenu entre 2 et 30, un score négatif comptant pour 0. Le jeu enregistre la croissance des utilisateurs au cours de la dernière semaine civile, annualisée, plus la marge, qui est (Revenu − Dépenses) / Revenu. Un score de 40 ou plus est un élément de la liste de contrôle d'introduction en bourse, alors supprimez dépenses ou développez-vous plus rapidement avant de rendre public.",
      links: [
        { label: 'Wikipédia : règle de 40' },
        { label: 'McKinsey : le SaaS et la règle des 40' },
      ],
      design: [{ label: 'Valorisation' }],
    },
    runbook: {
      term: 'Procédure',
      definition:
        "Un document court et testé qui dit quoi faire quand une alerte précise se déclenche : quelles vérifications lancer, quelle commande exécuter, quand escalader. Un manuel qu'un système peut exécuter seul est de l'automatisation ; un manuel qu'une personne lit à 3 h du matin vaut quand même la peine d'être écrit.",
      inGame:
        "La recherche Manuels (série A, après Astreinte) et une équipe SRE avec un ingénieur débloquent Rédiger un manuel d'exploitation, 10 heures de développement, pour un type d'incident que l'équipe a déjà terminé à la main. Une fois écrit, ce type se résout seul à sa première seconde : le post-mortem l'enregistre comme automatique, comme il le fait pour un cluster qui replanifie un pod ou une réplique de secours qui bascule, et le succès Manuel lit cet enregistrement.",
      links: [
        { label: 'Livre SRE de Google : la culture du post-mortem' },
        { label: 'PagerDuty : qu’est-ce qu’un manuel d’exploitation ?' },
      ],
      design: [{ label: 'Manuels d’exploitation' }],
    },
    service: {
      term: 'Service',
      definition:
        "Un code source avec son propre pipeline de déploiement, détenu par une seule équipe. Découper un monolithe en services permet à chaque équipe de livrer et de monter en charge de son côté, au prix d'un saut réseau entre services et de pannes qui peuvent se propager d'un service à l'autre.",
      inGame:
        "Une Société commence avec un seul service, le monolithe, et chaque fonctionnalité qu'aucun autre service ne nomme y reste. Les frontières de service (Série B) déplacent des fonctionnalités en ligne vers un nouveau service doté d'un nom et d'une équipe propriétaire, pour 0,3 de la partie déplacée du code source en heures de développement. Le propriétaire construit le carnet de commandes de ce service et est appelé quand il tombe, et un mauvais déploiement ne casse que le service qui l'a livré. Deux services sur une même base de données conservent la moitié de la pénalité de coordination : k est multiplié par 1,5 jusqu'à ce qu'un service nomme son propre nœud de base de données.",
      links: [
        { label: 'Martin Fowler : MonolithFirst' },
        { label: 'Martin Fowler : Microservices' },
        { label: 'microservices.io : Architecture monolithique' },
      ],
      design: [{ label: 'Services' }],
    },
    sharding: {
      term: 'Partitionnement',
      definition:
        "Diviser un ensemble de données sur plusieurs bases de données (fragments) par une clé, telle qu'un hachage de l'ID utilisateur, de sorte que chaque fragment stocke et ne sert qu'une partie des données. Il fait évoluer les écritures et le stockage au-delà d'une seule machine, mais une requête qui s'étend sur plusieurs fragments doit les demander à tous, et une clé très sollicitée peut surcharger son fragment pendant que les autres sont inactives.",
      inGame:
        "La recherche Sharding divise une base de données en 1, 2, 4 ou 8 fragments par clé, et elle débloque la réplication Leaderless. Chaque fragment est une machine de plus et coûte comme telle, et les écritures se répartissent entre eux : deux fragments répondent à deux fois plus d'écritures. Les lectures ne demandent que le fragment qui détient leur clé, ce qui fait de la réplique de lecture celle qui retire les lectures du primaire, et une transaction entre fragments coûte trois fois sa latence. Vous choisissez la clé de fragmentation (hachage, plage, locataire ou région) sur la carte, et changer le nombre de fragments est une re-fragmentation qui coûte des heures de dev et du temps calendaire pour chaque Go de la base. L'incident de clé très sollicitée touche un cache ou un magasin à colonnes larges, où 30 % des lectures demandent une même clé : la capacité du nœud tombe donc à environ 1 / (0,3 × paliers de taille + 0,7). Avec la répartition hybride, vous pouvez répartir ces clés.",
      links: [
        { label: 'Wikipédia : Shard (architecture de base de données)' },
        { label: 'Documents MongoDB : Partage' },
        { label: "AWS : Qu'est-ce que le partitionnement de base de données ?" },
      ],
      design: [{ label: 'Partitionnement' }],
    },
    'shared-nothing': {
      term: 'Sans ressources partagées',
      definition:
        "Une architecture dans laquelle les nœuds, ou requêtes, ne partagent aucune mémoire ni disque et se coordonnent uniquement sur le réseau, de sorte que chacun peut échouer, redémarrer ou évoluer de lui-même. Michael Stonebraker l'a défendu pour les bases de données en 1986. PHP applique l'idée par requête : chaque requête commence par un état de processus propre et libère tout à la fin.",
      inGame:
        "Apache mod_php et PHP-FPM ne sont rien partagés : ils libèrent toute la mémoire après chaque requête, donc l'incident de fuite de mémoire ne les récupère jamais. Tous les autres environnements d'exécution conservent leurs processus d'une requête à l'autre, ce qui évite une configuration par requête mais peut entraîner des fuites. Le prix, c'est la vitesse : PHP fonctionne à 0,15 fois la vitesse de Go, ou 0,375 avec OPcache.",
      links: [
        { label: 'Stonebraker (1986) : Les arguments en faveur du rien partagé' },
        { label: 'Wikipédia : Architecture sans partage' },
      ],
      design: [{ label: 'Comportements d’exécution' }],
    },
    'slo-sla-sli': {
      term: 'SLO, SLA, SLI',
      definition:
        "Un indicateur de niveau de service (SLI) est une mesure du comportement du service, tel que la part des demandes qui aboutissent. Un objectif de niveau de service (SLO) est une cible pour un SLI sur une fenêtre, par exemple 99,9 % sur 30 jours. Un accord de niveau de service (SLA) est un contrat avec les clients qui définit les conséquences, telles que les crédits de service, lorsqu'un niveau promis n'est pas respecté ; il est généralement plus lâche que le SLO interne.",
      inGame:
        "Le SLI est la disponibilité : la part des demandes des utilisateurs répondues au cours de la derniétape semaine civile, sans robots ni blocs WAF. Chaque étape définit le SLO, de 99 % en garage à 99,99 % en public, et à partir de la série A, les échecs qu'il autorise constituent votre budget d'erreur. Les tableaux de bord SLO mettent ce budget sur le HUD, et la liste de contrôle IPO a besoin de 99,95 %. B2B SaaS signe un SLA à partir de la série B, un cran au-dessus de l’objectif de son ère, et tant qu’une semaine reste en dessous, Vente aux entreprises reverse des crédits aux clients : 10 % des revenus d’abonnement.",
      links: [
        { label: 'Livre Google SRE : Objectifs de niveau de service' },
        { label: 'Classeur Google SRE : mise en œuvre des SLO' },
        { label: 'Blog Google Cloud : SLI, SLA et SLO' },
      ],
      design: [{ label: 'SLO et budgets d’erreur' }],
    },
    'soc-2': {
      term: 'SOC 2',
      definition:
        "Un cadre d’audit de l’AICPA. Un auditeur indépendant rend compte des contrôles d'une organisation de services en matière de sécurité, de disponibilité, d'intégrité du traitement, de confidentialité et de confidentialité. Les clients d'entreprise ont souvent besoin d'un rapport SOC 2.",
      inGame:
        "SOC 2 est un élément de la liste de contrôle IPO pré-IPO. Vous avez besoin du programme SOC 2 recherche, qui a besoin de TLS partout, du cryptage au repos et de l'analyse des dépendances, et vous avez besoin d'une équipe de sécurité avec un ingénieur. Sans elle, un incident de constatation d’audit peut réinitialiser un exercice DR réussi.",
      links: [
        { label: "AICPA : Contrôles du système et de l'organisation" },
        { label: 'Wikipédia' },
      ],
      design: [],
    },
    'spot-instance': {
      term: 'Instance spot',
      definition:
        "Capacité cloud de réserve vendue à un prix très réduit, jusqu'à 90 % du prix à la demande, que le fournisseur peut reprendre chaque fois qu'il en a besoin. AWS donne un préavis d'interruption de deux minutes. Spot convient aux travaux sans état et tolérants aux pannes, tels que les tâches par lots et les serveurs derrière un répartiteur de charge avec une capacité disponible, et non une seule base de données.",
      inGame:
        'Le tarif Spot fait tourner un nœud à 0,3× le prix à la demande, mais le fournisseur peut le récupérer. Un incident de récupération Spot prévient pendant 10 secondes de simulation, puis arrête le nœud, et passer le nœud à la demande pendant l’avertissement l’annule. Un nœud réservé coûte 0,6× et tient une semaine calendaire. L’incident de pénurie de GPU est distinct : le fournisseur récupère un nœud GPU, les H100 d’abord, et une API LLM en secours le rend quatre fois moins probable.',
      links: [
        { label: 'Documents AWS EC2 : Instances ponctuelles' },
        { label: "Documents AWS EC2 : Avis d'interruption de l'instance Spot" },
        { label: 'Documents Google Cloud : VM Spot' },
      ],
      design: [{ label: 'Modèles de tarification' }],
    },
    'strangler-pattern': {
      term: 'Architecture de l’étrangleur',
      definition:
        "Remplacer un système existant pièce par pièce : placez une couche de routage devant celui-ci, envoyez une part croissante du trafic ou des fonctionnalités vers le nouveau système et retirez l'ancien lorsque plus rien ne l'utilise. Martin Fowler lui a donné le nom du figuier étrangleur, une vigne qui pousse autour d'un arbre jusqu'à ce qu'il le remplace. Cela évite une réécriture risquée et big-bang.",
      inGame:
        "La modification de la pile d'un service dans une entreprise démarre une migration qui exécute les deux versions et déplace les serveurs applicatifs en quatre étapes : 5 %, 25 %, 50 %, puis 100 % du trafic. Chaque étape coûte sa part des heures de développement de la migration (10 %, 20 %, 30 %, 40 %) et les requêtes sur la nouvelle pile échouent 3 % du temps jusqu'à ce que vous expédiiez la correction des bogues de migration. Les fonctionnalités du service de migration sont construites à moitié vitesse.",
      links: [
        { label: 'Martin Fowler : Figue étrangleur' },
        { label: 'Azure Architecture Center : modèle de figue étrangleur' },
        { label: 'Conseils prescriptifs AWS : modèle de figue étrangleur' },
      ],
      design: [{ label: 'Migrations' }],
    },
    'synchronous-replication': {
      term: 'Réplication synchrone',
      definition:
        "Réplication où le principal confirme une écriture uniquement après qu'au moins un réplica l'a également stockée. Aucune écriture reconnue n'est perdue en cas d'échec du serveur principal, mais chaque écriture attend l'aller-retour vers le réplica.",
      inGame:
        "La recherche de réplication synchrone ajoute un interrupteur à chaque réplique en lecture : activé, chaque écriture attend cette réplique, qui ne prend donc jamais de retard, et chaque écriture paie son aller-retour. Elle débloque aussi les bases de consensus. Distributed SQL attend une majorité de ses répliques à chaque écriture : les écritures entre régions paient donc l'aller-retour. Une base avec un secours bascule aussi en quelques secondes quand sa zone tombe.",
      links: [
        {
          label:
            "Documents PostgreSQL : serveurs de secours d'envoi de journaux (réplication synchrone)",
        },
        { label: 'Documents PostgreSQL : Paramètres de réplication' },
        { label: 'Wikipédia : Réplication (informatique)' },
      ],
      design: [],
    },
    'tail-at-scale': {
      term: 'Latence extrême à grande échelle',
      definition:
        "Lorsqu'une requête est diffusée sur plusieurs serveurs ou attend de nombreuses réponses, la réponse la plus lente définit sa latence, de sorte qu'un délai rare sur chaque serveur devient courant pour l'ensemble de la requête. Avec 100 serveurs lents chacun 1 % du temps, 63 % des requêtes rencontrent au moins une réponse lente. Dean et Barroso l'ont décrit en 2013, avec des correctifs tels que des demandes couvertes.",
      inGame:
        "Une requête collecte les événements de queue de chaque nœud sur son chemin : deux chances indépendantes a et b se combinent pour donner 1 − (1 − a)(1 − b), donc une longue chaîne de nœuds dont chacun cale de temps en temps a un p99 pire que n'importe lequel d'entre eux. Une lecture de magasin à colonnes larges attend la R-ième réplique la plus rapide parmi N, et à R = N, elle attend la plus lente. La recherche des percentiles montre le p99 où cela apparaît.",
      links: [
        { label: 'Dean et Barroso (2013) : La queue à grande échelle' },
        { label: "La queue à l'échelle (PDF)" },
        { label: "Communications de l'ACM : La queue à grande échelle" },
      ],
      design: [{ label: 'Centiles' }],
    },
    'tech-debt': {
      term: 'Dette technique',
      definition:
        "Raccourcis et architecture obsolète du code qui rendent chaque modification ultérieure plus lente ou plus risquée, comme les intérêts d'un prêt, jusqu'à ce que l'équipe rembourse la dette en refactorisant. Ward Cunningham a inventé la métaphore en 1992. Une certaine dette est un compromis délibéré à expédier plus tôt ; son coût est l'effort supplémentaire qu'il ajoute à chaque changement ultérieur.",
      inGame:
        "Chaque service a un pourcentage de dette technique. Chaque fonctionnalité livrée ajoute 6 points sous Déplacement rapide, 3 sous Équilibré et 1 sous Qualité, plus 1 sans cadre, et une tâche expédiée lors d'un incident en ajoute 2. Un élément accéléré ajoute 2 points pour chaque coût complet d'élément payé par la réserve. La dette réduit la vitesse de moitié, augmente les risques de mauvais déploiement jusqu'à 3 fois et rend chaque incident plus probable. La tâche Refactor (10 heures de développement) supprime 20 points, et la politique Qualité en rémunère elle-même.",
      links: [
        { label: 'Martin Fowler : Dette technique' },
        { label: 'Wikipédia : Dette technique' },
      ],
      design: [{ label: 'Dette technique' }],
    },
    'thread-pool': {
      term: 'Pool de threads',
      definition:
        "Un ensemble fixe de threads qui prennent le travail d'une file d'attente partagée, de sorte qu'un programme ne paie pas pour créer un thread par tâche. Dans un serveur thread par requête, la taille du pool limite le nombre de requêtes exécutées simultanément, et une requête qui attend sur I/O conserve toujours son thread.",
      inGame:
        "Le Tomcat de Java exécute 200 threads dans un JVM, et le Puma de Ruby exécute 5 threads par processus : chaque requête en attente contient un thread, donc les appels lents à la base de données peuvent remplir le pool. Pour Node.js, le pool de threads libuv recherche déplace le hachage du mot de passe hors de la boucle d'événements, afin que les connexions cessent de bloquer les autres requêtes. Le Tokio de Rust exécute des tâches asynchrones sur un pool de threads de travail, où une tâche lourde en CPU n'en bloque qu'un seul.",
      links: [
        { label: 'Wikipédia' },
        {
          label: "Node.js : Ne bloquez pas la boucle d'événements (ou le pool de nœuds de calcul)",
        },
        { label: "Apache Tomcat : l'exécuteur (pool de threads)" },
      ],
      design: [],
    },
    'thundering-herd': {
      term: 'Effet de troupeau',
      definition:
        'De nombreux clients ou processus se réveillent et agissent au même moment, par exemple après un redémarrage, une expiration du cache ou une minuterie partagée, et leur charge combinée submerge une ressource partagée. Les correctifs répartissent le troupeau : gigue, fusion des demandes et redémarrages échelonnés.',
      inGame:
        "L'incident de bousculade du cache redémarre un cache vide et chaque échec est envoyé simultanément à la base de données ; tandis que la base de données fonctionne à 90 % ou plus, les recharges expirent et le cache reste froid. La protection contre le Stampede permet à un cache froid d'envoyer seulement 25 % de ses échecs supplémentaires tandis que le reste attend une récupération, et le réchauffement du cache ramène un cache chaud à 80 %. Les tentatives naïves constituent également un troupeau : chaque appelant réessaye en même temps, et Backoff avec gigue les répartit.",
      links: [
        { label: 'Wikipédia : problème de troupeau tonitruant' },
        { label: "Blog sur l'architecture AWS : Intervalle exponentiel et gigue" },
      ],
      design: [{ label: 'Reconnexions du Hub temps réel' }],
    },
    'tiered-caching': {
      term: 'Mise en cache à plusieurs niveaux',
      definition:
        "Une configuration CDN dans laquelle les emplacements périphériques demandent un ensemble plus petit de caches régionaux ou de niveau supérieur avant l'origine. Les dispositifs Edge partagent ce que contient le niveau supérieur, de sorte que le taux de réussite augmente et que moins de requêtes atteignent l'origine.",
      inGame:
        'La recherche de mise en cache à plusieurs niveaux (après la livraison du contenu) oblige les bords CDN à demander un niveau régional avant votre origine. Il augmente la part des demandes des médias auxquelles un CDN répond de 75 % à 92 % avec le TTL par défaut. La vidéo à laquelle répond le CDN ne charge pas vos serveurs applicatifs et est facturée au prix de sortie Edge le moins cher.',
      links: [
        { label: 'Documents Cloudflare : Cache hiérarchisé' },
        { label: "AWS : Bouclier d'origine CloudFront" },
      ],
      design: [],
    },
    timeout: {
      term: "Délai d'attente",
      definition:
        "Temps le plus long pendant lequel un appelant attend une réponse avant d'abandonner. Un délai d'attente libère le thread ou la connexion de l'appelant, de sorte qu'une dépendance lente ne peut pas le conserver pour toujours, mais un délai d'attente trop court fait échouer les appels qui auraient fonctionné.",
      inGame:
        "Chaque Link attend 30 s pour une réponse. Après les recherches de délais d'attente et de nouvelles tentatives, vous pouvez définir le délai d'attente de chaque lien sur 1, 5 ou 30 s. Un appelant conserve son emplacement uniquement jusqu'à l'expiration du délai d'attente, de sorte qu'un court délai d'attente empêche une base de données lente de remplir chaque emplacement du serveur d'applications et les appels au-delà échouent en raison d'un délai d'attente. Une charge qui expire et qui est réessayée peut être facturée deux fois jusqu'à ce que vous possédiez des clés d'idempotence.",
      links: [
        {
          label:
            "Bibliothèque des constructeurs AWS : délais d'attente, tentatives et interruptions avec instabilité",
        },
        { label: 'Livre Google SRE : Résoudre les échecs en cascade' },
      ],
      design: [],
    },
    'tls-certificate': {
      term: 'Certificat TLS',
      definition:
        "Un fichier signé qui lie un nom de domaine à une clé publique, émise par une autorité de certification. Les navigateurs le vérifient avant d'ouvrir une connexion HTTPS, et refusent le site une fois celui-ci expiré. Les certificats sont de courte durée, les équipes les renouvellent donc automatiquement, par exemple avec ACME et Let's Encrypt.",
      inGame:
        "La recherche d'automatisation des certificats débloque Secrets et certificats. Chaque nœud qui termine TLS (répartiteur de charge, CDN, WAF, passerelle d'API, hub temps réel, fonction de périphérie) détient son propre certificat. Tant qu'un gestionnaire tourne, il émet chacun au premier pas et le renouvelle aux deux tiers de sa vie : 90 jours calendaires, et 45 à partir de la Série C. Sans gestionnaire, les certificats expirent un par un : toute requête passant par un nœud dont le certificat a expiré échoue en down et l'incident Certificat expiré démarre, jusqu'à ce qu'un gestionnaire tourne de nouveau ou que le joueur appuie sur Renouveler.",
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce qu'un certificat SSL ?" },
        { label: "Let's Encrypt : réduire la durée de vie des certificats à 45 jours" },
        { label: 'Chiffrons : FAQ' },
      ],
      design: [],
    },
    'token-bucket': {
      term: 'Seau à jetons',
      definition:
        "Un algorithme de limitation de débit. Un seau peut contenir jusqu'à B jetons et se recharge à un taux fixe r ; chaque requête prend un jeton et une requête qui trouve le compartiment vide attend ou est rejetée. Il permet de courtes rafales allant jusqu'à B tout en maintenant la moyenne à long terme à r.",
      inGame:
        'Les instances Burstable tournent sur un seau à jetons de crédits CPU. Un nœud Burstable gagne des crédits quand il utilise moins de 20 % de son vCPU, en banque jusqu’à 100 secondes-cœur par vCPU, et les dépense pour tourner au-dessus de cette base. Quand le seau est vide, il tombe à 20 % de CPU : une machine Burstable qui tourne à plein toute la journée cale ; en échange elle coûte 0,4 fois une machine General. La recherche Limitation de débit de la passerelle API lui donne le même seau : 200 requêtes de rafale au-dessus de son plafond.',
      links: [
        { label: 'Wikipédia : seau de jetons' },
        { label: 'Documents AWS EC2 : instances de performances extensibles, concepts clés' },
      ],
      design: [{ label: 'Passerelle API' }],
    },
    'transactional-outbox': {
      term: 'Boîte d’envoi transactionnelle',
      definition:
        "Un moyen de mettre à jour une base de données et de publier un événement sans perdre non plus. Le service écrit la modification et une ligne de boîte d'envoi dans la même transaction de base de données, et un relais distinct lit la boîte d'envoi et publie chaque événement sur le courtier de messages, au moins une fois. Cela évite le problème de double écriture, où la validation de la base de données réussit et la publication échoue, ou l'inverse.",
      inGame:
        'Jusqu’à la recherche Boîte d’envoi transactionnelle, dès la Série B la double écriture de l’application perd de temps en temps : 0,5 % des réponses d’un moteur de recherche sont périmées à cause d’une publication jamais arrivée. La recherche Boîte d’envoi transactionnelle ramène cette part à zéro, tout comme un connecteur CDC, qui lit la modification dans le journal de la base. Ni l’un ni l’autre ne change une file : un serveur applicatif relié à une file confie la partie asynchrone des requêtes lentes aux workers, et les utilisateurs n’attendent que la mise en file.',
      links: [
        { label: "microservices.io : boîte d'envoi transactionnelle" },
        { label: "Conseils prescriptifs AWS : modèle de boîte d'envoi transactionnel" },
        { label: "Documentation Debezium : Routeur d'événements de la boîte d'envoi" },
      ],
      design: [{ label: 'Garder les copies synchronisées' }],
    },
    'use-method': {
      term: 'Méthode USE',
      definition:
        "Utilisation, saturation et erreurs pour chaque ressource, telle que CPU, la mémoire ou un pool de connexions. Il mesure les causes, et non les symptômes : une ressource à 100 % avec du travail en attente est le goulot d'étranglement probable. Brendan Gregg l'a décrit comme une liste de contrôle pour l'analyse des performances.",
      inGame:
        "La ligne Saturation du tableau de bord affiche l'utilisation de chaque nœud sous forme de jauge à barres, de chronologie d'état et de tableau, afin que vous puissiez voir quel nœud s'est rempli en premier. Une ligne USE complète par ressource n’est pas encore créée. Sur le tableau, la barre de chargement de chaque carte de nœud affiche désormais la même utilisation.",
      links: [{ label: 'Brendan Gregg : La méthode USE' }],
      design: [{ label: 'Lignes et graphiques du tableau de bord' }],
    },
    utilization: {
      term: 'Utilisation',
      definition:
        "Part de la capacité d'une ressource utilisée sur une période : travail offert divisé par la capacité. Le délai d'attente augmente fortement à mesure que l'utilisation approche les 100 % : dans une simple file d'attente M/M/1, l'attente est proportionnelle à ρ / (1 − ρ), donc passer de 50 % à 90 % d'occupation multiplie l'attente par 9.",
      inGame:
        "Chaque nœud affiche son utilisation : travail offert au-delà de la capacité de sa limite la plus stricte, qu'il s'agisse de CPU, d'emplacements, de mémoire, de connexions ou de réseau. Le délai de file d'attente augmente à mesure que ρ / (1 − ρ), le nœud avertit à 70 % et montre un danger à 90 %, et au-dessus de 100 %, il supprime l'excédent. La recherche de goulots d'étranglement pèse uniquement sur les nœuds supérieurs à 60 % et un autoscaler cible 40 %, 60 % ou 80 %. La ligne Saturation du tableau de bord affiche chaque nœud sous forme de jauge et de chronologie sur 24 heures, avec les mêmes lignes de 70 % et 90 %.",
      links: [
        { label: 'Brendan Gregg : La méthode USE' },
        { label: "Wikipédia : file d'attente M/M/1" },
      ],
      design: [{ label: 'Capacité, utilisation et files d’attente' }],
    },
    'vertical-and-horizontal-scaling': {
      term: "Mise à l'échelle verticale et horizontale",
      definition:
        "La mise à l'échelle verticale (mise à l'échelle) déplace une charge de travail vers une machine plus grande avec plus de CPU et de mémoire. La mise à l'échelle horizontale (mise à l'échelle) ajoute davantage de machines et répartit le travail entre elles. La mise à l’échelle est simple mais comporte un plafond et généralement un redémarrage ; la mise à l'échelle nécessite un répartiteur de charge et des serveurs sans état, mais n'a pas de plafond rigide et survit à la perte d'une machine.",
      inGame:
        'Redimensionner un nœud dimensionné le déplace d’un pas entre nano (0,5 vCPU) et metal (96 vCPU), et chaque pas double vCPU et RAM, mais le nœud redémarre et revient à froid. Certains logiciels ne savent pas utiliser les cœurs en plus : Node.js fait tourner une boucle d’événements sur un cœur, et Redis répond sur un thread. Pour monter en charge horizontalement, placez plus de serveurs applicatifs derrière un DNS ou un répartiteur, chaque copie coûtant 25 % de plus, ou laissez un autoscaler ajouter des copies, qui prennent 180 s sur VM ou 30 s dans un cluster Kubernetes. La famille d’instances compte aussi : la recherche Instances ARM ajoute une famille avec les vCPU et la RAM de General pour 0,8× le prix, à 0,95× la vitesse CPU.',
      links: [
        { label: 'Azure Architecture Center : architecture évolutive' },
        { label: 'Wikipédia : évolutivité (horizontale et verticale)' },
      ],
      design: [{ label: 'Vertical et horizontal' }],
    },
    'waf-web-application-firewall': {
      term: "WAF (pare-feu d'applications Web)",
      definition:
        "Un filtre devant une application Web qui inspecte les requêtes HTTP et bloque celles qui correspondent aux règles d'attaque ou de bot. Des ensembles de règles plus strictes détectent plus d'attaques et bloquent également davantage d'utilisateurs réels par erreur (faux positifs).",
      inGame:
        'La recherche Pare-feu d’applications Web débloque le composant WAF. Il bloque une part des requêtes de robots et, par erreur, une part d’utilisateurs réels, selon son niveau de paranoïa : le niveau 1 bloque 60 % des robots et 0,1 % des utilisateurs, le niveau 2 (par défaut) 80 % et 0,5 %, le niveau 3 92 % et 2 %, le niveau 4 98 % et 6 %. Les niveaux élevés coûtent plus de CPU par requête, jusqu’à 4 fois le niveau 1. La recherche Gestion des robots met au défi un client suspect au lieu de le bloquer, ce qui divise par deux les faux positifs et garde le taux de blocage. Le mode Under attack bloque 99 % des robots et 1 % des utilisateurs et ajoute 40 ms.',
      links: [
        { label: "Centre de formation Cloudflare : Qu'est-ce qu'un WAF ?" },
        { label: 'OWASP CRS : niveaux de paranoïa' },
        { label: "OWASP : pare-feu d'applications Web" },
      ],
      design: [],
    },
    'write-through-cache': {
      term: 'Cache en écriture directe',
      definition:
        'Une politique de mise en cache dans laquelle chaque écriture est envoyée simultanément au cache et à la base de données, de sorte que le cache conserve toujours la dernière valeur pour les clés écrites via celui-ci. Les lectures sont plus fréquentes et ne sont jamais périmées pour ces clés, mais chaque écriture est plus lente et le cache se remplit de données qui pourraient ne jamais être lues. Le cache côté et l’écriture différée sont les alternatives courantes.',
      inGame:
        "Write-through est l'une des stratégies du cache, une fois la recherche des stratégies de cache faite : une écriture va au cache et à la base ensemble, donc le cache ne sert jamais de lecture périmée pour une clé écrite par ce biais, et chaque écriture coûte une demi-milliseconde de plus. Un cache cache-aside invalide les clés à l'écriture : son taux de succès baisse du double de la part d'écritures, d'au plus la moitié. Entre les invalidations, certains succès sont périmés, de 0,5 % à 10 % par unité de part d'écritures quand le TTL passe de 10 s à 1 heure.",
      links: [
        { label: 'Documentation Amazon ElastiCache : Stratégies de mise en cache' },
        { label: "Wikipédia : politiques d'écriture du cache" },
      ],
      design: [{ label: 'Stratégies de cache' }],
    },
  },
  gpuModels: {
    small: { name: 'Petit (3B)' },
    medium: { name: 'Moyen (7B)' },
    large: { name: 'Grand (34B)' },
  },
  incidents: {
    spike: {
      name: 'Pic de trafic',
      cause: "Un grand site d'actualité lié à vous. La demande a triplé.",
      prevention: 'De la capacité disponible, un cache, plus de serveurs applicatifs.',
    },
    instance: {
      name: 'Panne d’instance',
      cause: "L'hôte sous une VM est mort.",
      prevention: 'Une deuxième copie derrière un Load Balancer, qui ignore les hôtes morts.',
    },
    connections: {
      name: 'Saturation des connexions',
      cause: 'Un déploiement a doublé chaque pool de connexions. Postgres a refusé la franchise.',
      prevention: 'Un pooleur de connexions ou des pools plus petits.',
    },
    loop: {
      name: 'Blocage de la boucle d’événements',
      cause:
        'Le coût de hachage du mot de passe est passé de 10 à 12 tours : 4 × CPU par connexion.',
      prevention:
        "Le pool de threads libuv, un fournisseur d'authentification ou un environnement d'exécution sans boucle d'événement.",
    },
    leak: {
      name: 'Fuite de mémoire',
      cause: "Un processus persistant a perdu de la mémoire jusqu'à ce que le noyau le tue.",
      prevention: 'Redémarrez le service, ou exécutez PHP : il libère tout après chaque requête.',
    },
    'slow-query': {
      name: 'Requête lente',
      cause:
        'Une nouvelle fonctionnalité livrait une requête sans index. Chaque lecture analyse la table entière.',
      prevention:
        "L'analyse des requêtes trouve l'index manquant. Un cache évite la plupart des lectures.",
    },
    'bad-deploy': {
      name: 'Mauvais déploiement',
      cause:
        'Un déploiement a généré un bug. Les requêtes adressées aux serveurs applicatifs échouent.',
      prevention:
        'Un pipeline capable de revenir en arrière, de tests automatisés et de déploiements plus petits.',
    },
    'bot-surge': {
      name: 'Afflux de robots',
      cause:
        'Des grattoirs ont trouvé le site. La moitié de tout le trafic était constituée de robots.',
      prevention: 'Un WAF devant les serveurs applicatifs.',
    },
    stuffing: {
      name: 'Bourrage d’identifiants',
      cause:
        'Les robots ont essayé des mots de passe divulgués : 20 fois les connexions, chacune étant un hachage bcrypt.',
      prevention: "Un WAF en bloque la plupart. Un fournisseur d'authentification hache le reste.",
    },
    stampede: {
      name: 'Avalanche de défauts de cache',
      cause:
        'Le cache a redémarré vide. Chaque échec est allé dans la base de données en même temps.',
      prevention:
        'La protection contre la bousculade fusionne les ratés. Le réchauffement du cache le remplit avant le trafic.',
    },
    poison: {
      name: 'Message empoisonné',
      cause:
        'Une tâche qui échoue toujours revenait sans cesse. Les processus ont réessayé au lieu de faire la queue.',
      prevention: 'Une file d’attente de messages non traités écarte une tâche qui échoue.',
    },
    ddos: {
      name: 'DDoS',
      cause: 'Un attaquant a inondé la périphérie avec un trafic 50 fois supérieur à la normale.',
      prevention:
        'Un WAF, avec mode Under Attack au démarrage. Un CDN prend la partie pouvant être mise en cache.',
    },
    'cluster-upgrade': {
      name: 'Mise à niveau forcée du cluster',
      cause:
        'Le fournisseur cloud a mis à niveau un cluster Kubernetes depuis une version qu’il ne prend plus en charge. Les pods qui utilisaient des API supprimées ont planté en boucle.',
      prevention:
        'Mettez à niveau les clusters au moins une fois par trimestre, ou laissez une équipe Plateforme les tenir à jour.',
    },
    certificate: {
      name: 'Certificat expiré',
      cause: 'Le certificat TLS a expiré. Chaque navigateur a refusé le site.',
      prevention: "L'automatisation du certificat le renouvelle avant son expiration.",
    },
    'psp-outage': {
      name: 'Panne du fournisseur de paiement',
      cause: 'Le fournisseur de paiement est tombé en panne. Chaque paiement a échoué.',
      prevention: "Rien de votre côté : c'est leur panne. Les caisses reviennent à la fin.",
    },
    zone: {
      name: 'Panne de zone',
      cause: 'Une zone entière a échoué. Chaque nœud est devenu gris.',
      prevention:
        'Copies dans une deuxième zone avec capacité de réserve et base de données en veille.',
    },
    'disk-full': {
      name: 'Disque plein',
      cause:
        'Les journaux et WAL ont rempli le disque de base de données. Chaque écriture a échoué.',
      prevention:
        'Les alertes sur le disque le détectent tôt. Développez le volume pour y mettre fin.',
    },
    'repl-lag': {
      name: 'Retard de réplication',
      cause:
        'Une rafale d’écritures a laissé les répliques quelques secondes derrière. Les lectures après une écriture sont revenues obsolètes.',
      prevention: 'Le routage de lecture-écriture envoie ces lectures au serveur principal.',
    },
    'latency-regression': {
      name: 'Régression de latence',
      cause:
        'Un déploiement a ajouté un appel synchrone à chaque requête : chaque réponse est 150 ms plus lente.',
      prevention:
        'Percentiles et traçage sur le chemin des requêtes, et un canari qui surveille le p99.',
    },
    'gc-storm': {
      name: 'Rafale de pauses du ramasse-miettes',
      cause: 'Le tas a dépassé les 90 %. Le collecteur a mis en pause une demande sur dix.',
      prevention: 'Plus de mémoire, réglage ZGC ou GOGC. Redémarrez pour y mettre fin.',
    },
    'retry-storm': {
      name: 'Tempête de tentatives',
      cause:
        'La base de données a ralenti pendant 20 s. Les appelants ont réessayé immédiatement, et les tentatives ont maintenu le système surchargé.',
      prevention: 'Arrêt avec gigue, disjoncteurs et délestage.',
    },
    'deadline-day': {
      name: 'Jour d’échéance',
      cause:
        "L'échéance du contrat est tombée : toutes les agences ont envoyé leur travail en même temps, 3× la demande habituelle.",
      prevention: "Capacité réservée, délestage, et une file pour le travail de l'échéance.",
    },
    'double-charge': {
      name: 'Double facturation',
      cause:
        'Le fournisseur de paiement a ralenti. Les accusations ont expiré et ont été retentées, et certaines ont été facturées deux fois.',
      prevention:
        "Clés d'idempotence. Arrêtez les tentatives sur le lien de charge pour y mettre fin.",
    },
    'report-db': {
      name: 'Le rapport tue la base de données',
      cause:
        'Un rapport de fin de trimestre a analysé chaque table du primaire. Tous les types ralentissaient.',
      prevention: 'Un entrepôt de données supprime les analyses du serveur principal.',
    },
    'gpu-shortage': {
      name: 'Pénurie de GPU',
      cause: 'Le fournisseur a récupéré un nœud GPU. Pas de capacité H100 ce mois-ci.',
      prevention: 'Le LLM API reçoit des invites lorsque les GPU sont insuffisants.',
    },
    regex: {
      name: 'Retours arrière d’une expression régulière',
      cause:
        'Une nouvelle règle WAF revient en arrière sur les entrées longues. Chaque WAF fonctionnait à 100 % du CPU.',
      prevention:
        "Transmettez d'abord les règles à un canari. Désactivez la règle pour y mettre fin.",
    },
    region: {
      name: 'Panne régionale',
      cause: 'Une région entière a échoué. Son tableau est devenu gris.',
      prevention:
        'Une deuxième région, GeoDNS, pour y envoyer les utilisateurs et les données qui résident dans les deux.',
    },
    partition: {
      name: 'Partition réseau',
      cause:
        'Les régions ont perdu le contact. Les appels entre eux ont expiré et les écritures basées sur les dirigeants ont divergé.',
      prevention:
        'Un magasin de consensus garde un leader. Clôturez le vieux leader pour y mettre fin.',
    },
    'hot-key': {
      name: 'Clé très sollicitée',
      cause:
        'Une célébrité a posté. 30 % des lectures demandaient une clé et sa partition était saturée.',
      prevention:
        'Répartissez les touches de raccourci sur les fragments et mettez-les en cache dans les serveurs applicatifs.',
    },
    config: {
      name: 'Déploiement de configuration défectueux',
      cause:
        'Une modification de configuration a atteint tous les Serveurs d’application et Workers en même temps, et ils ont planté ensemble. GitOps en une fois l’a aussi portée à chaque Miroir.',
      prevention:
        'Revenez en arrière pour y mettre fin. GitOps par étapes garde d’abord une modification sur une seule région.',
    },
    bgp: {
      name: 'Mauvaise configuration BGP',
      cause:
        "Un changement d'itinéraire a retiré l'entreprise d'Internet. Aucune région n'était accessible.",
      prevention: 'Examinez les modifications d’itinéraire. Revenez en arrière pour y mettre fin.',
    },
    audit: {
      name: 'Anomalie d’audit',
      cause: 'Un auditeur SOC 2 a trouvé une lacune. L’exercice DR ne compte plus.',
      prevention:
        'Une équipe de sécurité corrige les résultats avant de réinitialiser quoi que ce soit.',
    },
    'dr-drill': {
      name: 'Exercice de reprise',
      cause: 'Un échec scénarisé de la région d’origine, pour mesurer la reprise.',
      prevention: "Servez tous les types d'une autre région en une heure, sans perdre d'écritures.",
    },
    breach: {
      name: 'Violation de données',
      cause:
        'Une vulnérabilité divulguée n’a pas été corrigée au-delà de sa date limite et quelqu’un l’a utilisée.',
      prevention:
        "Corrigez le ticket avant son expiration. Le backlog de l'équipe indique la date limite.",
    },
    'credential-leak': {
      name: 'Fuite d’identifiants',
      cause:
        'Une page d’hameçonnage a pris les identifiants de la société, et un inconnu s’en est servi.',
      prevention:
        'Lisez le domaine, pas le logo. Signalez le courrier comme hameçonnage et il perd son bouton.',
    },
    'spot-reclaim': {
      name: 'Récupération Spot',
      cause:
        'Le fournisseur avait besoin de la capacité. Il a récupéré un nœud Spot après un préavis de 10 secondes.',
      prevention: 'Flottes mixtes, arrêt gracieux et copies à la demande derrière un répartiteur.',
    },
    'stale-read': {
      name: 'Lectures périmées',
      cause:
        'Un cache a servi des valeurs au-delà de leur TTL : une table à forte écriture a dépassé son invalidation, et les lectures des mêmes lignes sont revenues anciennes.',
      prevention:
        'Un TTL plus court, un cache en écriture directe, ou le routage lecture-après-écriture.',
    },
    reconnect: {
      name: 'Tempête de reconnexions',
      cause:
        'Un concentrateur temps réel a redémarré. Tous les clients se sont reconnectés dans la même seconde.',
      prevention:
        'Le jitter de reconnexion étale la vague, et le clustering lui donne plus d’une machine.',
    },
    'runaway-bill': {
      name: 'Facture emballée',
      cause:
        'Un autoscaler a atteint son plafond sans pic à servir, et la dépense a grimpé sans revenu supplémentaire.',
      prevention: 'Baissez le plafond de l’autoscaler et lisez la facture cloud ligne par ligne.',
    },
    mtu: {
      name: 'MTU incompatible',
      cause:
        'Un réseau partenaire utilise une taille de paquet plus petite. Les envois plus grands que son MTU expirent à l’arrivée.',
      prevention: 'Limitez la taille des paquets, ou gardez les gros envois sur un seul réseau.',
    },
    'hot-shard': {
      name: 'Partition chaude d’un gros client',
      cause:
        'La clé du plus gros client est tombée sur une seule partition. Ses lectures et écritures coûtent 3× plus de CPU, et tout le reste de cette partition attend derrière.',
      prevention:
        'Partitionnez le client par clé et gardez ses lectures dans un Cache devant la base de données.',
    },
    'premiere-spike': {
      name: 'Pic de première',
      cause: 'Une première a été diffusée : 4× la demande vidéo habituelle, dans la même minute.',
      prevention: 'Cache hiérarchisé au CDN, capacité réservée et délestage.',
    },
    'launch-day': {
      name: 'Jour de lancement',
      cause:
        'Le jeu est sorti : 6× les messages temps réel habituels, et chaque client se connecte en même temps.',
      prevention:
        'Des Realtime Hubs dimensionnés pour la pointe, une gigue de reconnexion et du délestage.',
    },
    'flash-sale': {
      name: 'Vente flash',
      cause: 'Une vente flash : 20× les paiements habituels pendant quelques minutes.',
      prevention: 'Une file pour le travail de paiement, un autoscaler et du délestage.',
    },
    'jvm-warmup': {
      name: 'Préchauffage JVM sous charge',
      cause:
        "Un autoscaler a ajouté des serveurs d'application Java pendant un pic, et les nouvelles copies ont démarré à froid : 30 % de vitesse pendant leurs 30 premières s.",
      prevention:
        'Démarrage progressif sur le répartiteur de charge, mise à l’échelle planifiée et image native GraalVM, qui démarre à chaud. Avec le démarrage progressif, une nouvelle copie reçoit le trafic peu à peu et ne répond jamais à froid.',
    },
    'migration-lock': {
      name: 'Verrou de migration de schéma',
      cause:
        "Une migration a lancé ALTER TABLE sur la plus grande table. Elle a tenu le verrou pendant la copie, et chaque écriture s'est mise en file derrière elle jusqu'au délai dépassé.",
      prevention:
        'Les migrations de schéma en ligne modifient une grande table sans tenir le verrou.',
    },
    'supply-chain': {
      name: "Compromission de la chaîne d'approvisionnement",
      cause:
        "Une dépendance a publié une version malveillante, et un déploiement l'a installée. Le paquet s'est exécuté dans les serveurs d'application et a exfiltré des données.",
      prevention:
        'L’analyse des dépendances détecte une porte dérobée publiée avant que la build ne l’installe ; les permissions Deno empêchent un paquet de lire ce dont il n’a pas besoin.',
    },
    'accidental-delete': {
      name: 'Suppression accidentelle',
      cause:
        'Un opérateur a supprimé des données. Une table avait disparu, et chaque requête qui en dépendait échouait.',
      prevention:
        'La restauration à un instant donné remet la table à la minute précédant la suppression. Les exercices de restauration prouvent que la sauvegarde restaure.',
    },
    'operator-typo': {
      name: "Faute de frappe d'opérateur",
      cause:
        'Une commande censée retirer un Nœud a visé tout le Composant, et la plupart de ses Nœuds sont partis avec.',
      prevention:
        "Un plan et une revue avant l'application d'un changement montrent ce qu'il supprimera : une faute de frappe s'arrête au plan.",
    },
    'table-bloat': {
      name: 'Gonflement de table',
      cause:
        "PostgreSQL garde l'ancienne version de chaque ligne modifiée jusqu'au passage de VACUUM. Les mises à jour massives ont dépassé le nettoyage et la table s'est remplie de lignes mortes : chaque lecture et écriture coûte plus de CPU.",
      prevention:
        "Une fenêtre de rétention garde les tables petites, et un moteur MySQL n'a pas de lignes mortes à nettoyer.",
    },
    'page-leak': {
      name: 'Fuite de page en cache',
      cause:
        "Le CDN a mis en cache une page connectée sous une clé sans le cookie, et a servi la page d'un utilisateur à un autre.",
      prevention:
        "Une clé de cache qui contient le cookie : une page personnelle n'est jamais partagée.",
    },
    'leap-second': {
      name: "Seconde intercalaire ou dérive d'horloge",
      cause:
        'Une seconde intercalaire a répété une seconde de l’horloge. Les minuteurs se sont déclenchés deux fois, les baux ont expiré trop tôt, et les requêtes et les verrous de toute une région ont expiré.',
      prevention:
        "L'étalement de la seconde intercalaire répartit la seconde sur une journée, donc aucune horloge ne saute.",
    },
    'stale-opcache': {
      name: 'OPcache périmé',
      cause:
        'OPcache tourne avec validate_timestamps désactivé, et un déploiement ne l’a pas réinitialisé. Les serveurs PHP ont continué d’exécuter l’ancien code sur le nouveau schéma, et une part des requêtes a échoué.',
      prevention:
        'Un pipeline CI/CD réinitialise OPcache à chaque déploiement. Un redémarrage vide le cache à la main.',
    },
    'bun-compat': {
      name: 'Compatibilité d’exécution',
      cause:
        'Un paquet qui fonctionne sur Node.js ne fonctionne pas sur Bun, moins mature. Une part des requêtes qui l’utilisaient a échoué jusqu’au remplacement du paquet.',
      prevention:
        "Les tests automatisés s'exécutent sur le runtime où le service est livré et détectent le paquet avant le déploiement.",
    },
    'gevent-compat': {
      name: 'Incompatibilité de bibliothèque',
      cause:
        'gevent applique des monkey patches à la bibliothèque standard, et une bibliothèque n’y a pas survécu : ses appels ont bloqué le hub, et une part des requêtes a échoué.',
      prevention:
        'Les tests automatisés exécutent le service sous gevent avant sa livraison et montrent quelle bibliothèque casse.',
    },
    'split-brain': {
      name: 'Double leader',
      cause:
        'Une partition réseau a coupé en deux un cluster Erlang distribué. Chaque moitié a continué de servir ses propres clients, et la moitié des messages temps réel n’a jamais atteint l’autre.',
      prevention:
        "Les expériences de chaos trouvent la partition avant qu'elle ne frappe. Un redémarrage réintègre le cluster.",
    },
  },
  kinds: {
    page: { label: 'Page vue' },
    read: { label: 'Lecture API' },
    write: { label: 'Écriture API' },
    login: { label: 'Connexion' },
    search: { label: 'Recherche' },
    upload: { label: 'Envoi' },
    bot: { label: 'Robot' },
    media: { label: 'Vidéo' },
    rt: { label: 'Temps réel' },
    buy: { label: 'Commander' },
    job: { label: 'Export' },
    report: { label: 'Rapport' },
    ai: { label: 'Requête IA' },
    'q-read': { label: 'Requête de lecture' },
    'q-write': { label: 'Requête d’écriture' },
    auth: { label: 'Appel d’authentification' },
    'q-search': { label: 'Requête de recherche' },
    'blob-put': { label: 'Écriture d’objet' },
    task: { label: 'Tâche' },
    'blob-get': { label: 'Lecture d’objet' },
    'q-tx': { label: 'Transaction' },
    charge: { label: 'Facturation' },
    'q-scan': { label: 'Analyse' },
    infer: { label: 'Inférence' },
    feed: { label: 'Fil d’actualité' },
    hook: { label: 'Webhook' },
    push: { label: 'Notification' },
    bid: { label: 'Requête d’enchère' },
    notify: { label: 'Notification push' },
    callout: { label: 'Appel client' },
    'k-write': { label: 'Écriture dans le fil' },
  },
  lbPolicies: {
    weighted: { label: 'Pondéré' },
    'round-robin': { label: 'Tourniquet' },
    'least-conn': { label: 'Moins de connexions' },
    p2c: { label: 'Deux choix' },
    hash: { label: 'Hachage cohérent' },
  },
  logAcks: {
    '0': { name: 'Sans acquittement' },
    '1': { name: 'Chef de partition' },
    all: { name: 'Tous les réplicas' },
  },
  mutators: {
    'chaos-monkey': {
      name: 'Singe du Chaos',
      rule: 'Les échecs d’instance dominent depuis amorçage',
    },
    'hn-front-page': {
      name: 'Première page de Hacker News',
      rule: 'Le trafic augmente trois fois plus souvent',
    },
    'legacy-monolith': {
      name: 'Monolithe hérité',
      rule: 'Grande base de code PHP : migrations ×3, la dette commence à 40 %',
    },
    'one-region': {
      name: 'Une région pour toujours',
      rule: "Aucun nœud en dehors de la région d'origine",
    },
    'no-caches': { name: 'Pas de cache', rule: 'Pas de cache, pas de CDN' },
    'tight-budget': { name: 'Budget serré', rule: 'Subventions de financement réduites de moitié' },
    'single-language': { name: 'Langue unique', rule: "Chaque serveur d'applications exécute PHP" },
    postgres: {
      name: 'Postgres pour tout',
      rule: "Pas de cache, de colonnes larges, de consensus ou de magasins d'entrepôt",
    },
    'strict-slo': { name: 'Strict SLO', rule: 'Le SLO est un niveau supérieur' },
    'shared-tenancy': {
      name: 'Location partagée',
      rule: 'Des voisins bruyants volent du CPU à chaque instance',
    },
  },
  perks: {
    'angel-network': { name: "Réseau d'anges", effect: 'Trésorerie initiale ×2' },
    'alumni-network': { name: "Réseau d'anciens élèves", effect: '+1 ingénieur au pré-amorçage' },
    'institutional-knowledge': {
      name: 'Mémoire de l’entreprise',
      effect: 'Conserver 1 recherche après une cession',
    },
    'pattern-recognition': { name: 'Reconnaissance de formes', effect: 'Connaissances +20%' },
    'founders-reputation': {
      name: 'Réputation du fondateur',
      effect: 'Croissance des utilisateurs +10%',
    },
    'better-terms': { name: 'De meilleures conditions', effect: 'Dilution par levée −2 points' },
    'night-shift': { name: 'Quart de nuit', effect: 'Plafond hors ligne 12 h, 18 h, 24 h' },
    'time-dilation': { name: 'Dilatation du temps', effect: 'Débloque une vitesse 20×, puis 40×' },
    playbooks: { name: 'Plans types', effect: 'Emplacements de plans types : 2, 5, 10, 25' },
    'war-stories': {
      name: 'Histoires de guerre',
      effect: 'Les actions correctives en attente augmentent le risque deux fois moins',
    },
    'head-start': {
      name: "Une longueur d'avance",
      effect: 'Commencer en pré-amorçage, puis en amorçage, puis en série A',
    },
    autopilot: {
      name: 'Pilote automatique',
      effect:
        'Politiques : mettre en file l’étude la moins chère, recruter, garder les serveurs d’application au frais',
    },
  },
  pmModes: {
    static: { label: 'Statique' },
    dynamic: { label: 'Dynamique' },
    ondemand: { label: 'Sur demande' },
  },
  policies: {
    'move-fast': { label: 'Avancer vite' },
    balanced: { label: 'Équilibrée' },
    quality: { label: 'Qualité' },
  },
  pools: {
    page: { label: 'Page vue' },
    read: { label: 'Lecture API' },
    write: { label: 'Écriture API' },
    login: { label: 'Connexion' },
    search: { label: 'Recherche' },
    upload: { label: 'Envoi' },
    bot: { label: 'Robot' },
    media: { label: 'Vidéo' },
    rt: { label: 'Temps réel' },
    buy: { label: 'Commander' },
    job: { label: 'Export' },
    report: { label: 'Rapport' },
    ai: { label: 'Requête IA' },
    feed: { label: 'Fil d’actualité' },
    hook: { label: 'Webhook' },
    push: { label: 'Notification' },
    bid: { label: 'Requête d’enchère' },
    failure: { label: 'Échec' },
  },
  pricings: {
    'on-demand': {
      name: 'À la demande',
      blurb: 'Tarif plein. Vous pouvez retirer le nœud à tout moment.',
    },
    reserved: {
      name: 'Réservé',
      blurb:
        '0,6×, pour un engagement d’une semaine calendaire. Vendre avant la fin du terme doit le Burn restant.',
    },
    spot: {
      name: 'Spot',
      blurb: '0,3×. Le fournisseur peut récupérer le nœud après 10 s de préavis.',
    },
  },
  regionInfo: {
    na: { name: 'Amérique du Nord', short: 'NA' },
    eu: { name: 'Europe', short: 'EU' },
    apac: { name: 'Asie-Pacifique', short: 'APAC' },
    sa: { name: 'Amérique du Sud', short: 'SA' },
  },
  research: {
    stripe: { blurb: 'Les paiements sont collectés eux-mêmes.', name: 'Stripe Billing' },
    'dns-rr': {
      blurb: "Débloque DNS : répartissez les utilisateurs sur jusqu'à 8 hôtes.",
      name: 'Répartition DNS par tourniquet',
    },
    'load-balancing': {
      blurb: "Déverrouille l'répartiteur de charge : divisé par capacité, ignore les hôtes morts.",
      name: 'Équilibrage de charge',
    },
    'health-checks': {
      blurb: "DNS arrête d'envoyer les utilisateurs vers un hôte mort.",
      name: 'Sondes de disponibilité',
    },
    'auth-provider': {
      blurb:
        "Déverrouille le fournisseur d'authentification. Les connexions ne coûtent plus votre CPU.",
      name: 'Identité gérée',
    },
    caching: {
      blurb:
        "Débloque Redis. La plupart des requêtes de lecture n'atteignent jamais la base de données.",
      name: 'Mise en cache',
    },
    pooling: {
      blurb:
        "Débloque PgBouncer. Les connexions d'application partagent quelques connexions de base de données.",
      name: 'Mutualisation des connexions',
    },
    replication: { blurb: 'Déverrouille la réplique en lecture.', name: 'Répliques en lecture' },
    'eager-loading': {
      blurb: 'Corrige les requêtes N+1 : les frameworks ORM envoient 1 requête de lecture, pas 3.',
      name: 'Chargement impatient',
    },
    'query-analysis': {
      blurb: "EXPLAIN trouve les requêtes sans index. Ajoutez l'index de la fiche Base de données.",
      name: 'Analyse des requêtes',
    },
    logs: {
      blurb:
        'Erreurs divisées par cause : bloquées, abandonnées, refusées, en panne, obsolètes, oom.',
      name: 'Journaux structurés',
    },
    metrics: { blurb: "Graphiques d'historique pour chaque nœud.", name: 'Métriques' },
    percentiles: {
      blurb: 'p50, p95 et p99 à côté de la moyenne. Voyez à quel point la moyenne se cache.',
      name: 'Centiles',
    },
    alerting: {
      blurb:
        'Une bannière de pager lorsque des erreurs, p99 ou une saturation franchissent un seuil.',
      name: 'Alerte',
    },
    funnels: {
      blurb:
        'Découvrez où les inscriptions diminuent et corrigez-le : croissance des utilisateurs + 10 %.',
      name: "Analyse de l'entonnoir",
    },
    'php-fpm': {
      blurb:
        'Un pool de processus au lieu des processus Apache. Vous définissez la taille du pool.',
      name: 'PHP-FPM',
    },
    opcache: {
      blurb: 'PHP arrête de compiler les scripts à chaque requête : vitesse de 2,5 × CPU.',
      name: 'OPcache',
    },
    'lang-ruby': {
      blurb:
        'Un processus par cœur, 5 threads chacun. Les threads se chevauchent en attente ; le GVL conserve CPU sur un seul cœur.',
      name: 'Ruby',
    },
    'lang-node': {
      blurb:
        "Une boucle d'événement. L'attente ne coûte rien, mais elle utilise un cœur et une requête lente bloque les autres.",
      name: 'Node.js',
    },
    'lang-python': {
      blurb:
        'Un pool de processus de synchronisation, une requête chacun. Comme PHP-FPM avec plus de mémoire par processus.',
      name: 'Python',
    },
    'node-cluster': {
      blurb:
        "Une boucle d'événement par cœur. Utilise chaque noyau ; la mémoire et les connexions augmentent avec les cœurs.",
      name: 'Mode cluster Node.js',
    },
    'libuv-pool': {
      blurb:
        "Le hachage du mot de passe sort de la boucle d'événements, de sorte que les connexions cessent de bloquer les autres requêtes.",
      name: 'pool de threads libuv',
    },
    'fw-laravel': {
      blurb:
        "Livre des fonctionnalités vite, et le travail d'arrière-plan coûte 20 % d'heures de dev en moins. 1,8× le CPU (1,1× en mode worker), et Eloquent fait 3 requêtes de lecture là où 1 suffirait.",
      name: 'Laravel',
    },
    'fw-rails': {
      blurb:
        'Expédie les fonctionnalités rapidement, les pages vues rapportent 20 % de plus. 1,5× CPU et requêtes N+1.',
      name: 'Rails',
    },
    'fw-express': {
      blurb:
        'Minimal et partout. 1,1× le CPU, et la prolifération des middlewares fait croître la dette technique 10 % plus vite.',
      name: 'Express',
    },
    'fw-django': {
      blurb:
        "Livre des fonctionnalités vite, et les outils internes coûtent 30 % d'heures de dev en moins grâce au site d'administration. 1,4× le CPU et des requêtes N+1.",
      name: 'Django',
    },
    'fw-symfony': {
      blurb:
        'Structure stricte : 30 % de coordination en moins et une dette technique 30 % plus lente. 1,5× le CPU et aucune requête N+1.',
      name: 'Symfony',
    },
    'fw-sinatra': { blurb: 'Léger. CPU ×1,1.', name: 'Sinatra' },
    'fw-flask': { blurb: 'Léger. CPU ×1,1.', name: 'Flask' },
    keepalive: {
      blurb:
        'Connexions persistantes : les appels internes évitent la négociation TCP et gagnent 1 ms chacun.',
      name: 'Réutilisation des connexions',
    },
    gzip: {
      blurb: 'Gzip : paginer et lire les réponses 70% plus petites, pour 10% de plus CPU.',
      name: 'Compression',
    },
    timeouts: {
      blurb:
        "Définissez le délai d'expiration de chaque appel sur 1, 5 ou 30 s et réessayez les appels ayant échoué.",
      name: "Délais d'attente et tentatives",
    },
    'lb-algorithms': {
      blurb: 'Moins de connexions et puissance de deux choix.',
      name: "Algorithmes d'équilibrage de charge",
    },
    ci: {
      blurb:
        'Un pipeline se déploie en 5 minutes, et non en 30, et peut annuler un mauvais déploiement. Recreate et Rolling sont inclus.',
      name: 'Livraison continue',
    },
    'blue-green': {
      blurb:
        "Bleu-vert : la nouvelle version démarre à côté de l'ancienne, si bien qu'un mauvais déploiement casse 10 % des requêtes.",
      name: 'Déploiements bleu-vert',
    },
    canary: {
      blurb:
        'Canari : 5 % du trafic rencontre la nouvelle version en premier. Le plus petit rayon d’impact, le déploiement le plus lent.',
      name: 'Déploiements canari',
    },
    'code-review': {
      blurb:
        'Affiche les coûts cachés d’une fonctionnalité avant sa mise en production. Déploiements défectueux −20%.',
      name: 'Revue de code',
    },
    'testing-culture': {
      blurb: 'Le pipeline exécute des tests avant chaque déploiement. Mauvais déploiements -30%.',
      name: 'Tests automatisés',
    },
    'full-text-search': {
      blurb: 'Débloque le moteur de recherche. Postgres ne répond plus à la recherche.',
      name: 'Recherche en texte intégral',
    },
    'object-storage': {
      blurb: "Débloque le stockage d'objets. Les téléchargements cessent d'arriver dans Postgres.",
      name: 'Stockage objet',
    },
    'cache-strategies': {
      blurb:
        'Lecture traversante, écriture traversante et écriture différée : le cache prend en charge la lecture et l’écriture.',
      name: 'Stratégies de cache',
    },
    'lifecycle-rules': {
      blurb: 'Les objets anciens passent seuls dans une classe de stockage moins chère.',
      name: 'Règles de cycle de vie du stockage',
    },
    retention: {
      blurb:
        'La base archive ou supprime les vieilles lignes : stockage moins cher, rapports plus lents.',
      name: 'Politiques de rétention',
    },
    cdn: {
      blurb: 'Débloque le CDN : pages répondues en périphérie, sortie moins chère.',
      name: 'Livraison de contenu',
    },
    waf: {
      blurb: 'Débloque le WAF : bloque les robots et certains utilisateurs réels avec eux.',
      name: "Pare-feu d'applications Web",
    },
    'api-gateway': {
      blurb:
        "Débloque la Passerelle API : une porte d'entrée unique qui limite le débit de chaque appel API.",
      name: 'Passerelle API',
    },
    websockets: {
      blurb:
        'Débloque le Hub temps réel : il garde les connexions ouvertes dont les messages temps réel ont besoin.',
      name: 'WebSockets',
    },
    'background-jobs': {
      blurb: 'Déverrouille le Worker : votre code, hors du chemin de la requête.',
      name: 'Travaux en arrière-plan',
    },
    queues: {
      blurb:
        "Déverrouille la file d'attente. Les serveurs applicatifs confient le travail lent aux processus.",
      name: "Files d'attente de messages",
    },
    'stampede-protection': {
      blurb:
        'Un cache froid regroupe les défauts de cache pour que la base de données puisse suivre pendant son remplissage.',
      name: 'Protection contre la bousculade',
    },
    'cache-warming': {
      blurb: "Un Cache revient d'un redémarrage plutôt chaud.",
      name: 'Préchauffage du cache',
    },
    'lang-go': {
      blurb:
        "Goroutines sur chaque cœur. L'attente coûte quelques Ko, pas un processus. GC prend CPU lorsque le tas est plein.",
      name: 'Go',
    },
    'lang-java': {
      blurb:
        'Un JVM, 200 threads sur chaque noyau. Démarre à une vitesse de 30 % et chauffe pendant 30 s. Chaque requête en attente contient un thread.',
      name: 'Java',
    },
    'lang-csharp': {
      blurb:
        '.NET asynchrone sur chaque cœur. L’attente n’immobilise aucun thread. La montée en régime du JIT est plus courte que sur la JVM.',
      name: 'C#',
    },
    'fw-gin': { blurb: 'Un routeur léger. CPU ×1,05.', name: 'Gin' },
    'fw-spring-boot': {
      blurb:
        'Structure pour les grandes équipes : 30 % de coordination en moins. 1,3× le CPU, 200 Mo de plus et 15 s de plus au démarrage.',
      name: 'Spring Boot',
    },
    'fw-aspnet': { blurb: 'Rapide et complet. CPU ×1,05.', name: 'ASP.NET Core' },
    tracing: {
      blurb:
        'L’heure de chaque type de requête, nœud par nœud. Nomme le saut le plus lent de chaque type.',
      name: 'Traçage distribué',
    },
    'trace-search': { blurb: 'Les études progressent 25% plus vite.', name: 'Recherche de traces' },
    notebooks: { blurb: 'Les études progressent 25% plus vite.', name: 'Carnets' },
    'cert-automation': {
      blurb: 'Les certificats se renouvellent avant leur expiration.',
      name: 'Automatisation des certificats',
    },
    'lang-elixir': {
      blurb:
        "Processus préemptifs sur chaque cœur. Aucune requête n'en bloque une autre et chaque processus collecte ses propres déchets. CPU lent.",
      name: 'Elixir',
    },
    'lang-rust': {
      blurb:
        'Tâches asynchrones sur chaque cœur, pas de GC, peu de mémoire. Une tâche lourde CPU bloque un thread de travail.',
      name: 'Rust',
    },
    'lang-zig': {
      blurb:
        'Du code natif avec des allocateurs explicites, sans GC. Un serveur de 64 threads utilise tous les cœurs, mais chaque requête en attente occupe un thread. L’état persistant peut fuir.',
      name: 'Zig',
    },
    'lang-haskell': {
      blurb:
        'Warp répartit des threads GHC légers sur les cœurs. Des spécialistes productifs, mais une compilation et un recrutement plus lents. Les attentes d’E/S n’occupent aucun thread système ; le GC du tas partagé ajoute des pauses et un coût CPU.',
      name: 'Haskell',
    },
    'fw-phoenix': { blurb: 'Les pages LiveView gagnent 30 % de plus. 1,1 × CPU.', name: 'Phoenix' },
    checkout: {
      blurb: 'Déverrouille le fournisseur de paiement et la fonction de paiement.',
      name: 'Commander',
    },
    'tiered-caching': {
      blurb:
        "Les bords CDN demandent un niveau régional avant l'origine : 92 % de la vidéo depuis le bord.",
      name: 'Mise en cache à plusieurs niveaux',
    },
    'multi-az': {
      blurb:
        'Placez les nœuds dans trois zones et donnez à un nœud de données une réserve dans une autre.',
      name: 'Plusieurs zones',
    },
    autoscaling: {
      blurb:
        "Déverrouille l'Autoscaler : les copies d'un serveur applicatif ou d'un Worker suivent la charge.",
      name: "Mise à l'échelle automatique",
    },
    containers: {
      blurb:
        "Débloque le cluster Kubernetes : 15 % de dépenses en moins, mise à l'échelle en 30 s.",
      name: 'Orchestration de conteneurs',
    },
    serverless: {
      blurb: 'Débloque la fonction sans serveur : votre code à la requête, sans machine à payer.',
      name: 'Sans serveur',
    },
    'reserved-instances': {
      blurb: 'Tarif réservé : 0,6× pour un engagement d’une semaine calendaire.',
      name: 'Instances réservées',
    },
    'spot-instances': {
      blurb: 'Tarif Spot : 0,3×, jusqu’à ce que le fournisseur récupère le nœud.',
      name: 'Instances Spot',
    },
    'slo-dashboards': { blurb: "Le bilan d'erreur, sur le HUD.", name: 'Tableaux de bord SLO' },
    'error-budgets': {
      blurb:
        "Le budget restant accélère l'équipe de 10 %. Un budget dépensé gèle les fonctionnalités à moitié vitesse.",
      name: "Bilans d'erreur",
    },
    'backoff-jitter': {
      blurb:
        "Les tentatives attendent et s'étalent, avec un budget de 10 % d'appels supplémentaires.",
      name: 'Recul avec gigue',
    },
    'circuit-breakers': {
      blurb:
        "Un Link arrête d'appeler pendant 5 s lorsque la moitié de ses appels échouent, puis réessaye.",
      name: 'Disjoncteurs',
    },
    'load-shedding': {
      blurb:
        "Un serveur d'applications saturé supprime d'abord les types de valeur la plus faible.",
      name: 'Délestage prioritaire',
    },
    'idempotency-keys': {
      blurb: 'Une nouvelle tentative de facturation ne facture jamais deux fois.',
      name: "Clés d'idempotence",
    },
    'ryw-routing': {
      blurb:
        "Un serveur d'applications peut envoyer des lectures qui suivent une écriture au serveur principal.",
      name: 'Routage en lecture-écriture',
    },
    'gogc-tuning': {
      blurb: "GOGC 50, 100 ou 200 : moins de mémoire pour plus de GC CPU, ou l'inverse.",
      name: 'Réglage Go GC',
    },
    'fw-axum': { blurb: 'Construit sur Tokio et Tower. Pas de CPU supplémentaire.', name: 'Axum' },
    'fw-actix': { blurb: 'Parmi les plus rapides des benchmarks. 0,95 × CPU.', name: 'Actix Web' },
    zgc: {
      blurb:
        'Java fait une pause de 1 ms au lieu de 30, pour 10 % de débit et 15 % de mémoire en plus.',
      name: 'ZGC',
    },
    'data-warehouse': {
      blurb:
        "Déverrouille l'entrepôt de données. Les rapports arrêtent d'analyser le fichier principal.",
      name: 'Entreposage de données',
    },
    'event-streaming': {
      blurb:
        'Débloque le flux d’événements : un journal qui garde ses messages, que les consommateurs peuvent rejouer.',
      name: 'Diffusion d’événements',
    },
    embeddings: {
      blurb:
        'Débloque l’index vectoriel. Les réponses d’IA s’appuient sur vos propres documents, et Python garde son bonus.',
      name: 'Plongements',
    },
    'hosted-models': {
      blurb: 'Débloque le LLM API : invites IA sans GPU, payées par jeton.',
      name: 'Modèles hébergés',
    },
    'model-serving': {
      blurb:
        "Déverrouille le nœud GPU : l'IA vous invite à un prix inférieur par jeton, s'il reste occupé.",
      name: 'Service de modèle',
    },
    pitr: {
      blurb:
        'Sauvegardes de la base de données : instantanés nocturnes ou archivage WAL avec minutes de RPO.',
      name: 'Restauration à un instant précis',
    },
    'tls-everywhere': {
      blurb: 'Chiffre chaque lien interne. Requis pour SOC 2.',
      name: 'TLS partout',
    },
    http2: {
      blurb:
        "Une connexion transporte de nombreuses requêtes : 15 % de sauts d'utilisateur en moins sur les pages vues.",
      name: 'HTTP/2',
    },
    'sync-replication': {
      blurb: 'Les écritures attendent une réplique. Nécessaire pour obtenir un consensus.',
      name: 'Réplication synchrone',
    },
    'restore-drills': {
      blurb: 'Les sauvegardes sont testées, donc une restauration fonctionne quand cela compte.',
      name: 'Restaurer les exercices',
    },
    'dependency-scanning': {
      blurb:
        'Chaque build vérifie ses bibliothèques pour détecter les trous connus. Requis pour SOC 2.',
      name: 'Analyse des dépendances',
    },
    sharding: { blurb: 'Divise les données entre les nœuds par clé.', name: 'Partitionnement' },
    'encryption-at-rest': {
      blurb: 'Les disques et les sauvegardes sont cryptés. Requis pour SOC 2.',
      name: 'Chiffrement au repos',
    },
    'multi-region': {
      blurb: 'Ouvrez une région sur un autre continent. Chaque région est un onglet.',
      name: 'Plusieurs régions',
    },
    'geo-dns': {
      blurb: 'Les utilisateurs se rendent dans leur propre région ou dans celle la plus proche.',
      name: 'GeoDNS',
    },
    'infra-as-code': {
      blurb:
        'Choisissez un outil IaC. Mettez une région en miroir dans une autre, et appliquez des plans pour la garder synchronisée.',
      name: 'Infrastructure as code',
    },
    gitops: {
      blurb: 'Les Miroirs se synchronisent seuls, en une fois ou par étapes.',
      name: 'GitOps',
    },
    anycast: { blurb: "20 ms de réduction sur l'utilisateur qui saute partout.", name: 'Anycast' },
    'document-db': {
      blurb:
        'Débloque la base documentaire : plus de migrations de schéma, mais pas de jointures non plus.',
      name: 'Bases documentaires',
    },
    'edge-compute': {
      blurb:
        'Débloque la fonction Edge : de petits gestionnaires exécutés au plus près de l’utilisateur.',
      name: 'Calcul en périphérie',
    },
    http3: {
      blurb: "20 % de réduction sur le saut d'utilisateur vers les utilisateurs distants.",
      name: 'HTTP/3',
    },
    notifications: { blurb: 'Déverrouille le fournisseur Push.', name: 'Notifications' },
    'hybrid-fanout': {
      blurb:
        'Faites pression pour les comptes normaux, tirez pour les célébrités. Met en cache les touches de raccourci divisées.',
      name: 'Distribution hybride',
    },
    leaderless: {
      blurb: 'Déverrouille le magasin à colonnes larges avec des quorums réglables.',
      name: 'Réplication sans leader',
    },
    consensus: { blurb: 'Débloque le SQL distribué.', name: 'Bases de données consensuelles' },
    'dr-drills': {
      blurb: 'Exécutez l’exercice DR pour la liste de contrôle IPO.',
      name: 'Exercices de reprise après sinistre',
    },
    soc2: { blurb: 'Élément de la liste de contrôle IPO.', name: 'Programme SOC2' },
    'gdpr-residency': {
      blurb:
        'Élément de la liste de contrôle IPO : utilisateurs de l’UE servis à partir d’une région de l’UE.',
      name: 'Contrôles de résidence des données',
    },
    'security-team': {
      blurb:
        'Élément de la liste de contrôle IPO. Les résultats de l’audit sont corrigés avant de réinitialiser quoi que ce soit.',
      name: 'Équipe de sécurité',
    },
    'investor-relations': {
      blurb: 'Multiple de valorisation +2.',
      name: 'Relations investisseurs',
    },
    'guidance-modeling': {
      blurb: 'Affiche la chance de battre chaque niveau de guidage.',
      name: 'Modélisation du guidage',
    },
    'php-jit': {
      blurb:
        'Le JIT de PHP 8 : 1,05× CPU sur les types web, 1,6× sur les types gourmands en CPU. Il aide à peine les pages et les lectures.',
      name: 'JIT PHP',
    },
    'worker-threads': {
      blurb:
        'Un pool de 4 threads de travail (40 Mo) sort les types gourmands en CPU de la boucle d’événements.',
      name: 'Threads de travail Node.js',
    },
    yjit: {
      blurb: 'Le JIT de Ruby : 1,3× le travail CPU pour 20 % de mémoire en plus.',
      name: 'YJIT',
    },
    gevent: {
      blurb:
        "Les threads verts tiennent de nombreuses attentes d'E/S par processus : une base lente ne bloque plus un worker. Le monkey patching peut casser une bibliothèque. 30 Ko par connexion.",
      name: 'gevent',
    },
    asgi: {
      blurb:
        'Asynchrone comme Node.js, avec un CPU plus lent : un appel bloquant bloque la boucle. Tient les connexions temps réel aux 30 Ko du design chacune.',
      name: 'ASGI avec Uvicorn',
    },
    'php-worker-mode': {
      blurb:
        'FrankenPHP, RoadRunner ou Octane : l’application démarre une fois, donc la surcharge du framework par requête disparaît. Perd le « rien de partagé » : les fuites mémoire et le mélange d’état redeviennent possibles.',
      name: 'PHP en mode worker',
    },
    swoole: {
      blurb:
        "Des coroutines sur une boucle d'événements, des E/S asynchrones comme Node.js et aucun surcoût de framework par requête. Les extensions bloquantes figent la boucle. Tient des connexions temps réel à 20 Ko chacune.",
      name: 'Swoole',
    },
    bun: {
      blurb:
        "Une boucle d'événements plus rapide avec un démarrage instantané : il s'adapte et se déploie mieux que Node.js. 60 Mo et aucun démarrage. Moins mature : un paquet qui fonctionne sur Node.js peut y casser.",
      name: 'Bun',
    },
    deno: {
      blurb:
        'Les permissions bloquent la plupart des attaques de chaîne d’approvisionnement, au prix de 10 % de vélocité : moins de paquets sont compatibles. La même boucle d’événements que Node.js.',
      name: 'Deno',
    },
    falcon: {
      blurb:
        'Les fibres tiennent de nombreuses connexions inactives par processus. Une gem bloquante fige la boucle. 100 Ko par connexion.',
      name: 'Falcon',
    },
    pypy: {
      blurb:
        "Trois fois le CPU Python pur de Gunicorn, après un échauffement JIT. Un faible support des extensions C signifie aucun bonus d'écosystème ML. 200 Mo par worker.",
      name: 'PyPy',
    },
    'virtual-threads': {
      blurb:
        'L’attente n’immobilise plus un thread de plateforme, donc une base lente n’ajoute que de la latence. Les appels natifs (JNI) épinglent encore un porteur, et la JVM chauffe toujours 30 s. Les connexions temps réel coûtent 10 Ko.',
      name: 'Threads virtuels Java',
    },
    webflux: {
      blurb:
        'Très forte concurrence sur une boucle par processus, et 20 % plus lent à écrire et à déboguer. Un appel bloquant fige la boucle, et la JVM chauffe toujours. 400 Mo.',
      name: 'Spring WebFlux',
    },
    fasthttp: {
      blurb:
        'Un quart plus rapide que net/http au prix de 10 % de vélocité : l’API n’est pas standard, certains middlewares ne fonctionnent pas, et il n’y a pas de HTTP/2.',
      name: 'fasthttp',
    },
    'spawn-blocking': {
      blurb:
        'Les types gourmands en CPU passent dans un pool bloquant, donc une tâche Tokio ne bloque plus un thread de travail.',
      name: 'Pool bloquant de Tokio',
    },
    'graal-native': {
      blurb:
        'Démarre en moins de 100 ms sans échauffement, avec 60 % de la mémoire de la JVM et 0,80× sa vitesse, pour des builds trois fois plus longs. Un thread par connexion, comme Tomcat. Idéal pour les Fonctions serverless.',
      name: 'Image native GraalVM',
    },
    'native-aot': {
      blurb:
        'Pas de JIT : il démarre à pleine vitesse, et plus petit : 100 Mo. 0,90× la vitesse, et les bibliothèques à réflexion lourde demandent des heures de dev.',
      name: '.NET Native AOT',
    },
    'distributed-erlang': {
      blurb:
        'Un hub temps réel BEAM se clusterise avec son propre pub/sub intégré, sans dorsale séparée. Les partitions peuvent couper le cerveau en deux.',
      name: 'Erlang distribué',
    },
    nifs: {
      blurb:
        'Le code natif rend les types gourmands en CPU d’Elixir 3× plus rapides. Un NIF n’est pas préempté, et un plantage dans l’un emporte toute la VM.',
      name: 'NIF',
    },
    jemalloc: {
      blurb:
        'Moins de fragmentation dans les services Rust de longue durée : 1,05× CPU, pour 5 % de mémoire en plus au démarrage.',
      name: 'jemalloc',
    },
    'free-threading': {
      blurb:
        "De vrais threads parallèles sur chaque cœur, 10 % plus lents par thread, et un thread par connexion n'est pas bon marché. Les extensions C pas encore prêtes coûtent des heures de dev. 8 threads et 100 Ko par connexion.",
      name: 'Python à threads libres',
    },
    'fw-fastapi': {
      blurb:
        'Validation avec Pydantic et le meilleur écosystème pour relier les modèles : les requêtes `ai` rapportent 15 % de plus. 1,15× le CPU, uniquement sur un serveur ASGI. 10 Mo.',
      name: 'FastAPI',
    },
    'fw-fastify': {
      blurb:
        'Sérialisation basée sur des schémas : les lectures coûtent 20 % de CPU en moins. Aucun surcoût propre. 5 Mo.',
      name: 'Fastify',
    },
    'fw-nextjs': {
      blurb:
        'Rendu côté serveur et régénération statique incrémentale : les pages rapportent 50 % de plus, pour 1,6× leur CPU, et un CDN peut en servir 40 %. 30 Mo par processus.',
      name: 'Next.js',
    },
    'fw-nestjs': {
      blurb:
        'Structure pour les grandes équipes : 30 % de coordination en moins. 1,3× le CPU et 20 Mo par processus.',
      name: 'NestJS',
    },
    'fw-fiber': {
      blurb:
        'Une API de style Express sur fasthttp : aucun surcoût CPU et pas de HTTP/2. 5 Mo par processus.',
      name: 'Fiber',
    },
    'fw-quarkus': {
      blurb:
        'Conçu pour les images natives : un build GraalVM prend moitié moins de temps. 1,1× le CPU et 100 Mo par processus.',
      name: 'Quarkus',
    },
    'fw-hono': {
      blurb: 'Un petit routeur sur les standards du Web : aucun surcoût CPU. 2 Mo par processus.',
      name: 'Hono',
    },
    'fw-elysia': {
      blurb:
        'Conçu pour Bun, avec des types vérifiés du serveur au client : la dette technique croît 15 % moins vite. Aucun surcoût CPU. 5 Mo par processus.',
      name: 'Elysia',
    },
    'fw-koa': {
      blurb:
        'Le successeur d’Express, bâti sur les fonctions async : 1,05× le CPU. 5 Mo par processus.',
      name: 'Koa',
    },
    'fw-adonis': {
      blurb:
        'Les idées de Laravel sur Node.js : livre vite des fonctionnalités. 1,4× le CPU, 25 Mo par processus, et l’ORM Lucid fait des requêtes N+1.',
      name: 'AdonisJS',
    },
    'fw-codeigniter': {
      blurb: 'Un petit framework PHP qui ne gêne pas : 1,1× le CPU. 4 Mo par processus.',
      name: 'CodeIgniter',
    },
    'fw-sanic': {
      blurb: 'Asynchrone de bout en bout : 1,05× le CPU. 10 Mo par processus.',
      name: 'Sanic',
    },
    'fw-rocket': {
      blurb:
        'Un routage typé avec peu de code répétitif : le plus rapide à écrire en Rust. 1,05× le CPU. 3 Mo par processus.',
      name: 'Rocket',
    },
    cdc: {
      blurb:
        'Débloque le connecteur CDC : les copies suivent le journal d’écriture, sans seconde écriture.',
      name: 'Capture des modifications de données',
    },
    'service-boundaries': {
      blurb:
        'Découper un service : un nouveau code source avec son équipe, ses déploiements et son propre périmètre d’impact.',
      name: 'Frontières de service',
    },
    'service-mesh': {
      blurb:
        'Débloque le maillage de services : nouvelles tentatives, coupe-circuits et métriques sur chaque lien.',
      name: 'Maillage de services',
    },
    'feature-flags': {
      blurb:
        'Débloque les drapeaux de fonctionnalités : une fonctionnalité atteint une part des utilisateurs, et un mauvais déploiement avec elle.',
      name: 'Drapeaux de fonctionnalités',
    },
    'secrets-management': {
      blurb: 'Les clés vivent dans un coffre, donc une page d’hameçonnage n’a rien à voler.',
      name: 'Gestion des secrets',
    },
    'spam-filter': {
      blurb:
        'Ajoute un filtre à la boîte qui range le spam dans son dossier, et parfois aussi un vrai courrier.',
      name: 'Filtre antispam',
    },
    'on-call': {
      blurb:
        'Une astreinte répond à la page, donc un incident est pris en compte en quelques minutes.',
      name: 'Astreinte',
    },
    runbooks: {
      blurb:
        'Rédigez un manuel pour un type d’incident que l’équipe a déjà traité : il se résout alors tout seul.',
      name: 'Manuels d’exploitation',
    },
    'sre-team': {
      blurb:
        'Débloque l’équipe SRE : MTTR −40 %, et un élément d’action ouvert pèse deux fois moins.',
      name: 'Équipe SRE',
    },
    'enterprise-sales': {
      blurb:
        'Signe le SLA : une semaine de disponibilité manquée rembourse des crédits aux clients.',
      name: 'Vente aux entreprises',
    },
    'online-migrations': {
      blurb:
        'Modifie une grande table sans tenir son verrou, donc les écritures continuent pendant une migration.',
      name: 'Migrations de schéma en ligne',
    },
    'leap-smearing': {
      blurb:
        "Répartit la seconde intercalaire sur toute la journée : aucune horloge ne saute et aucun bail n'expire trop tôt.",
      name: 'Étalement de la seconde intercalaire',
    },
    'ab-testing': {
      blurb:
        'Mesure le gain d’une fonctionnalité face aux utilisateurs mis de côté par son drapeau, avec un intervalle de confiance.',
      name: 'Test A/B',
    },
    'hiring-pipeline': {
      blurb:
        'Les recruteurs entretiennent un vivier, donc chaque embauche prend 30 % de temps calendaire en moins.',
      name: 'Pipeline de recrutement',
    },
    'trunk-based': {
      blurb:
        'De petits changements arrivent sur une seule branche plusieurs fois par jour, donc l’équipe livre 50 % plus souvent.',
      name: 'Développement sur tronc commun',
    },
    'platform-team': {
      blurb:
        'Débloque l’équipe plateforme : elle gère les clusters et le pipeline, et divise par deux le temps de déploiement.',
      name: 'Équipe Plateforme',
    },
    'data-team': {
      blurb:
        'Débloque l’équipe données : les fonctionnalités de rapport et d’IA coûtent 30 % de moins, et un pipeline accuse deux fois moins de retard.',
      name: 'Équipe données',
    },
    'l4-lb': {
      blurb:
        'Un répartiteur de charge transmet le TCP au lieu de lire le HTTP : dix fois le débit, un cinquième du saut et un prix moindre, sans routage par type ni nouvelles tentatives.',
      name: 'Répartition de charge L4',
    },
    'rate-limiting': {
      blurb:
        'Un seau à jetons sur la passerelle : une rafale jusqu’à la capacité du seau passe entière, et la moyenne dans la durée reste au plafond.',
      name: 'Limitation de débit',
    },
    esi: {
      blurb:
        'Le CDN met en cache la coquille commune d’une page connectée et remplit les parties personnelles en périphérie, donc 20 % de vues de page de plus touchent le cache.',
      name: 'Inclusions côté edge',
    },
    'bot-management': {
      blurb:
        'Un WAF qui met au défi les clients suspects au lieu de les bloquer : il bloque les mêmes robots et prend moins d’utilisateurs réels pour des robots.',
      name: 'Gestion des robots',
    },
    'scheduled-scaling': {
      blurb:
        'Un autoscaler ajoute des copies avant le pic quotidien connu, pour qu’elles soient chaudes à son arrivée.',
      name: 'Mise à l’échelle planifiée',
    },
    'arm-instances': {
      blurb:
        'Débloque la famille d’instances ARM : les mêmes vCPU et RAM que General pour 0,8× le prix.',
      name: 'Instances ARM',
    },
    quantization: {
      blurb:
        'Un nœud GPU exécute des poids INT8 ou INT4 : plus rapide et plus petit, et ses réponses valent 5 % ou 15 % de moins.',
      name: 'Quantification',
    },
    'continuous-batching': {
      blurb:
        'Un nœud GPU regroupe les invites à mesure qu’elles arrivent : un lot plus grand augmente le débit sans augmenter le délai avant le premier jeton.',
      name: 'Traitement par lots continu',
    },
    bulkheads: {
      blurb:
        'Un lien plafonne le nombre de créneaux de son appelant qu’une dépendance peut tenir : une dépendance lente abandonne ses propres appels et laisse le reste servir.',
      name: 'Cloisons',
    },
    'graceful-degradation': {
      blurb:
        'Un serveur applicatif saturé coupe d’abord ses types les plus coûteux : les types bon marché gardent leur latence et les coûteux échouent vite.',
      name: 'Dégradation gracieuse',
    },
    'hedged-requests': {
      blurb:
        'Un lien envoie une seconde copie d’un appel lent après le p95 et garde la réponse la plus rapide : la queue baisse et le destinataire voit 10 % d’appels en plus.',
      name: 'Requêtes redondantes',
    },
    'chaos-engineering': {
      blurb:
        'Une expérience planifiée fait échouer votre nœud le plus faible quelques secondes et le nomme : elle rapporte de l’intuition d’échec et prouve que la conception survit.',
      name: 'Ingénierie du chaos',
    },
    denormalization: {
      blurb:
        'Une base garde une copie pré-jointée : les lectures coûtent 30 % de CPU en moins, et chaque écriture 20 % de plus.',
      name: 'Dénormalisation',
    },
    precompute: {
      blurb:
        'Une base répond à un rapport depuis une vue stockée : moitié moins de CPU de balayage, et des chiffres aussi anciens que le rafraîchissement.',
      name: 'Vues matérialisées',
    },
    'binary-rpc': {
      blurb:
        'Les services sérialisent les appels en binaire plutôt qu’en texte : moitié moins de CPU de sérialisation sur chaque appel interne.',
      name: 'RPC binaire entre services',
    },
    outbox: {
      blurb:
        'Une écriture et son événement arrivent dans une seule transaction, et un relais la publie : les copies cessent de diverger quand une publication échoue.',
      name: 'Boîte d’envoi transactionnelle',
    },
    'expand-contract': {
      blurb:
        'Un changement de schéma ajoute la nouvelle forme, la remplit, puis supprime l’ancienne : aucun verrou de table, donc une migration ne peut jamais bloquer les écritures.',
      name: 'Élargir puis contracter',
    },
    profiling: {
      blurb:
        'Nomme la ressource qui limite chaque nœud : CPU, workers, mémoire, connexions ou disque.',
      name: 'Profilage continu',
    },
    'tail-sampling': {
      blurb: 'Conserve les traces lentes et échouées : deux fois plus d’intuition d’échec.',
      name: 'Échantillonnage par la queue',
    },
    rum: {
      blurb:
        'Latence du côté de l’utilisateur, répartie par appareil : ordinateur, mobile et tablette.',
      name: 'Suivi des utilisateurs réels',
    },
    'anomaly-detection': {
      blurb:
        'Prévoit le pic de trafic de demain et alerte avant qu’un incident n’atteigne son pic.',
      name: 'Détection d’anomalies',
    },
    'credential-protection': {
      blurb:
        'Bloque la majorité d’une rafale de robots de credential stuffing avant qu’elle n’atteigne la connexion.',
      name: 'Protection contre le credential stuffing',
    },
    'pen-testing': {
      blurb:
        'Révèle le type d’incident le plus faible de la conception une fois par semaine calendaire.',
      name: 'Test d’intrusion',
    },
    rightsizing: {
      blurb:
        'Marque les nœuds sous 30 % d’utilisation au pic, pour repérer facilement les machines surdimensionnées.',
      name: 'Rapport de dimensionnement',
    },
    'egress-optimization': {
      blurb: 'Une variante du stockage objet au tarif R2 : aucune sortie vers Internet.',
      name: 'Optimisation de la sortie',
    },
    'unit-economics': {
      blurb: 'Coût par requête servie, pour chaque type de requête.',
      name: 'Économie unitaire',
    },
    'cost-allocation': {
      blurb: 'Coût par service et par équipe, à partir des nœuds que possède chaque service.',
      name: 'Répartition des coûts',
    },
    'savings-plans': {
      blurb:
        '20 % de réduction sur le Burn de chaque nœud de calcul, à la demande ou non, sans engagement par nœud.',
      name: 'Plans d’économies',
    },
  },
  researchTracks: {
    infrastructure: { label: 'Infrastructure' },
    data: { label: 'Données' },
    reliability: { label: 'Fiabilité' },
    observability: { label: 'Observabilité' },
    performance: { label: 'Performance' },
    runtimes: { label: 'Environnements d’exécution' },
    frameworks: { label: 'Frameworks' },
    security: { label: 'Sécurité' },
    product: { label: 'Produit' },
    cost: { label: 'Coût' },
  },
  runtimes: {
    mod_php: {
      blurb:
        "Apache démarre un processus par requête en vol, jusqu'à 150. Chaque processus intègre PHP, donc RAM s'épuise plus tôt.",
      name: 'Apache mod_php',
    },
    php_fpm: {
      blurb:
        "Un pool fixe de processus PHP derrière NGINX. Chaque demande d'attente détient un processus. Rien partagé : pas de fuite.",
      name: 'PHP-FPM',
    },
    php_worker: {
      blurb:
        'FrankenPHP, RoadRunner ou Octane : l’application démarre une fois, donc la surcharge du framework par requête disparaît. Perd le « rien de partagé » : les fuites mémoire et le mélange d’état redeviennent possibles.',
      name: 'PHP en mode worker',
    },
    swoole: {
      blurb:
        "Des coroutines sur une boucle d'événements, des E/S asynchrones comme Node.js et aucun surcoût de framework par requête. Les extensions bloquantes figent la boucle. Tient des connexions temps réel à 20 Ko chacune.",
      name: 'Swoole',
    },
    puma: {
      blurb:
        'Un processus par cœur, 5 threads chacun. Les threads se chevauchent en attente ; le GVL conserve CPU sur un seul cœur.',
      name: 'Puma',
    },
    unicorn: {
      blurb:
        'Un processus Rails par emplacement : simple et robuste, et gourmand en mémoire. Une requête en attente immobilise tout un processus, donc il refuse les connexions temps réel.',
      name: 'Unicorn',
    },
    falcon: {
      blurb:
        'Les fibres tiennent de nombreuses connexions inactives par processus. Une gem bloquante fige la boucle. 100 Ko par connexion.',
      name: 'Falcon',
    },
    node: {
      blurb:
        "Une boucle d'événement. L'attente ne coûte rien, mais elle utilise un cœur et une requête lente bloque les autres.",
      name: 'Node.js',
    },
    node_cluster: {
      blurb:
        "Une boucle d'événement par cœur. Utilise chaque noyau ; la mémoire et les connexions augmentent avec les cœurs.",
      name: 'Node.js cluster',
    },
    bun: {
      blurb:
        "Une boucle d'événements plus rapide avec un démarrage instantané : il s'adapte et se déploie mieux que Node.js. 60 Mo et aucun démarrage. Moins mature : un paquet qui fonctionne sur Node.js peut y casser.",
      name: 'Bun',
    },
    deno: {
      blurb:
        'Les permissions bloquent la plupart des attaques de chaîne d’approvisionnement, au prix de 10 % de vélocité : moins de paquets sont compatibles. La même boucle d’événements que Node.js.',
      name: 'Deno',
    },
    gunicorn: {
      blurb:
        'Un pool de processus de synchronisation, une requête chacun. Comme PHP-FPM avec plus de mémoire par processus.',
      name: 'Gunicorn',
    },
    gevent: {
      blurb:
        "Les threads verts tiennent de nombreuses attentes d'E/S par processus : une base lente ne bloque plus un worker. Le monkey patching peut casser une bibliothèque. 30 Ko par connexion.",
      name: 'Gunicorn avec gevent',
    },
    uvicorn: {
      blurb:
        'Asynchrone comme Node.js, avec un CPU plus lent : un appel bloquant bloque la boucle. Tient les connexions temps réel aux 30 Ko du design chacune.',
      name: 'Uvicorn ASGI',
    },
    python_ft: {
      blurb:
        "De vrais threads parallèles sur chaque cœur, 10 % plus lents par thread, et un thread par connexion n'est pas bon marché. Les extensions C pas encore prêtes coûtent des heures de dev. 8 threads et 100 Ko par connexion.",
      name: 'CPython à threads libres',
    },
    pypy: {
      blurb:
        "Trois fois le CPU Python pur de Gunicorn, après un échauffement JIT. Un faible support des extensions C signifie aucun bonus d'écosystème ML. 200 Mo par worker.",
      name: 'PyPy',
    },
    go: {
      blurb:
        "Goroutines sur chaque cœur. L'attente coûte quelques Ko, pas un processus. GC prend CPU lorsque le tas est plein.",
      name: 'Go net/http',
    },
    fasthttp: {
      blurb:
        'Un quart plus rapide que net/http au prix de 10 % de vélocité : l’API n’est pas standard, certains middlewares ne fonctionnent pas, et il n’y a pas de HTTP/2.',
      name: 'fasthttp',
    },
    tomcat: {
      blurb:
        'Un JVM, 200 threads sur chaque noyau. Démarre à une vitesse de 30 % et chauffe pendant 30 s. Chaque requête en attente contient un thread.',
      name: 'Tomcat',
    },
    java_virtual: {
      blurb:
        'L’attente n’immobilise plus un thread de plateforme, donc une base lente n’ajoute que de la latence. Les appels natifs (JNI) épinglent encore un porteur, et la JVM chauffe toujours 30 s. Les connexions temps réel coûtent 10 Ko.',
      name: 'Threads virtuels Java',
    },
    webflux: {
      blurb:
        'Très forte concurrence sur une boucle par processus, et 20 % plus lent à écrire et à déboguer. Un appel bloquant fige la boucle, et la JVM chauffe toujours. 400 Mo.',
      name: 'Spring WebFlux',
    },
    graal: {
      blurb:
        'Démarre en moins de 100 ms sans échauffement, avec 60 % de la mémoire de la JVM et 0,80× sa vitesse, pour des builds trois fois plus longs. Un thread par connexion, comme Tomcat. Idéal pour les Fonctions serverless.',
      name: 'Image native GraalVM',
    },
    kestrel: {
      blurb:
        '.NET asynchrone sur chaque cœur. L’attente n’immobilise aucun thread. La montée en régime du JIT est plus courte que sur la JVM.',
      name: 'Kestrel',
    },
    native_aot: {
      blurb:
        'Pas de JIT : il démarre à pleine vitesse, et plus petit : 100 Mo. 0,90× la vitesse, et les bibliothèques à réflexion lourde demandent des heures de dev.',
      name: 'Native AOT',
    },
    beam: {
      blurb:
        "Processus préemptifs sur chaque cœur. Aucune requête n'en bloque une autre et chaque processus collecte ses propres déchets. CPU lent.",
      name: 'BEAM',
    },
    tokio: {
      blurb:
        'Tâches asynchrones sur chaque cœur, pas de GC, peu de mémoire. Une tâche lourde CPU bloque un thread de travail.',
      name: 'Tokio',
    },
    zig: {
      blurb:
        'Du code natif avec des allocateurs explicites, sans GC. Un serveur de 64 threads utilise tous les cœurs, mais chaque requête en attente occupe un thread. L’état persistant peut fuir.',
      name: 'Serveur Zig multithread',
    },
    warp: {
      blurb:
        'Warp répartit des threads GHC légers sur les cœurs. Des spécialistes productifs, mais une compilation et un recrutement plus lents. Les attentes d’E/S n’occupent aucun thread système ; le GC du tas partagé ajoute des pauses et un coût CPU.',
      name: 'Haskell (GHC + Warp)',
    },
  },
  shardKeys: {
    hash: { name: 'Hachage de l’ID utilisateur' },
    range: { name: 'Plage d’ID' },
    tenant: { name: 'Par locataire' },
    region: { name: 'Par région' },
  },
  storageClasses: {
    standard: { name: 'Standard' },
    infrequent: { name: 'Accès peu fréquent' },
    archive: { name: 'Archive' },
  },
  storageIops: {
    general: { name: 'Usage général' },
    provisioned: { name: 'IOPS provisionnées' },
  },
  tasks: {
    'add-index': {
      name: 'Ajouter un index',
      effect: 'Termine une requête lente et couvre une forme de requête',
    },
    'eager-loading': {
      name: 'Chargement impatient',
      effect: "Les frameworks ORM arrêtent d'envoyer des requêtes N+1",
    },
    'fix-leak': {
      name: 'Corriger la fuite de mémoire',
      effect: "Aucune fuite jusqu'à ce que la prochaine fonctionnalité soit livrée",
    },
    'session-state': {
      name: 'Supprimer l’état de session',
      effect: 'Le pooling de transactions arrête les requêtes interrompues',
    },
    refactor: { name: 'Refactoriser', effect: 'Dette technique −20 points' },
    'fix-bugs': {
      name: 'Corriger les bugs de migration',
      effect: 'La nouvelle Stack arrête les requêtes qui échouent',
    },
    'upgrade-cluster': {
      name: 'Mettre à niveau les clusters',
      effect:
        'Chaque cluster Kubernetes tourne sur une version prise en charge pendant un trimestre',
    },
    runbook: {
      name: 'Rédiger un manuel d’exploitation',
      effect: 'Un type d’incident se résout tout seul, sans action du joueur',
    },
    'idempotency-keys': {
      name: "Clés d'idempotence",
      effect: 'Un paiement retenté ne débite jamais deux fois',
    },
    'off-loop': {
      name: 'Sortir le travail CPU de la boucle',
      effect:
        'Node.js et Python async envoient les types gourmands en CPU à des threads de travail',
    },
    'timeouts-retries': {
      name: 'Ajouter des délais d’expiration et des nouvelles tentatives',
      effect:
        'Chaque Lien sortant d’un Serveur d’application ou d’un Worker reçoit un délai de 5 s et des nouvelles tentatives avec backoff',
    },
    'graceful-shutdown': {
      name: 'Arrêt propre',
      effect:
        'Les déploiements et les réductions d’échelle terminent les requêtes en cours au lieu de les faire échouer',
    },
    'health-check': {
      name: 'Point de terminaison de contrôle de santé',
      effect: 'Un répartiteur de charge peut lancer des contrôles de santé approfondis',
    },
    'load-test': {
      name: 'Test de charge',
      effect: 'Montre chaque Nœud à deux fois la demande, pendant un jour calendaire',
    },
  },
  vecIndexes: {
    exact: { name: 'Exact' },
    hnsw: { name: 'HNSW' },
  },
  ventures: {
    'b2b-saas': { name: 'SaaS B2B', summary: 'Pic du soir' },
    'consumer-social': {
      name: 'Social de consommation',
      summary:
        'Deux fois plus d’utilisateurs, moitié moins de valeur chacun ; médias +50 % ; pics viraux deux fois plus fréquents',
    },
    fintech: {
      name: 'Technologie financière',
      summary:
        'Heures de bureau ; achat ×4, écriture +50 % ; une lecture d’argent périmée est sanctionnée',
    },
    streaming: {
      name: 'Médias en streaming',
      summary: 'Pic tard le soir ; médias ×4 ; la sortie réseau coûte trois fois plus',
    },
    'game-backend': { name: 'Back-end du jeu', summary: 'Pointe du soir ; en temps réel ×4' },
    'ai-startup': { name: "Démarrage de l'IA", summary: 'Demande stable ; IA ×3' },
    'e-commerce': {
      name: 'Commerce électronique',
      summary: 'Achat ×2, recherche ×2 ; une vente mensuelle planifiée',
    },
    'developer-platform': {
      name: 'Plateforme pour développeurs',
      summary:
        'Demande stable et en rafales ; lectures ×2 ; webhooks ×3 à partir de la série C ; aucune tentative naïve',
    },
    healthcare: {
      name: 'Santé',
      summary:
        "Heures d'ouverture ; écritures +50 % ; les données restent dans la région d'origine à partir de la série A",
    },
    'ad-tech': {
      name: 'Publicité en ligne',
      summary:
        'Demande stable et énorme ; enchères ×10 ; une requête de plus de 100 ms ne rapporte rien',
    },
    government: {
      name: 'Marché public',
      summary:
        "Heures d'ouverture, pics d'échéance ; Java ou C# uniquement ; un placement prend un jour",
    },
    bootstrapped: {
      name: 'Indépendant bootstrapé',
      summary: 'Pas de ronde de financement ; Les capitaux propres restent à 100 %',
    },
  },
  guided: {
    'out-of-credits': {
      name: 'Crédits épuisés',
      objectives: [
        { goal: 'Servez chaque demande pendant 90 secondes.' },
        {
          goal: 'La demande est multipliée par 4. Maintenez Apdex au-dessus de 0,85 pendant 2 minutes.',
        },
        {
          goal: 'La circulation nocturne a repris. Maintenez Apdex au-dessus de 0,85 avec dépenses à 0,12 $/s ou moins.',
        },
      ],
    },
    'shared-box': {
      name: 'Serveur partagé',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,85 pendant 90 secondes.' },
        {
          goal: 'La demande a doublé. Maintenez Apdex au-dessus de 0,9 avec dépenses à 0,16 $/s ou moins.',
        },
        {
          goal: 'La circulation nocturne a repris. Maintenez Apdex au-dessus de 0,9 avec dépenses à 0,11 $/s ou moins.',
        },
      ],
    },
    'second-server': {
      name: 'Deuxième serveur',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        { goal: 'Un serveur échouera. Maintenez Apdex au-dessus de 0,85 pendant 2 minutes.' },
        { goal: 'La demande a doublé. Maintenez Apdex au-dessus de 0,9 grâce à un autre échec.' },
      ],
    },
    'connection-limit': {
      name: 'Limite de connexions',
      objectives: [
        { goal: 'Servez chaque demande pendant 90 secondes.' },
        { goal: 'La demande a doublé. Maintenez Apdex au-dessus de 0,9 pendant 2 minutes.' },
        { goal: 'Un déploiement doublera chaque pool. Gardez les erreurs inférieures à 1 %.' },
      ],
    },
    'event-loop-stall': {
      name: 'Blocage de la boucle d’événements',
      objectives: [
        { goal: 'Gardez p99 sous 300 ms pendant 2 minutes.' },
        {
          goal: 'Le hachage du mot de passe deviendra 4 fois plus lent. Gardez p99 sous 600 ms pendant 2 minutes.',
        },
      ],
    },
    'read-mostly': {
      name: 'Principalement des lectures',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        {
          goal: 'La demande a doublé. Maintenez Apdex au-dessus de 0,9 avec dépenses à 2,60 $/s ou moins.',
        },
        {
          goal: 'Une requête sera livrée sans index. Gardez Apdex au-dessus de 0,85 pendant 2 minutes après.',
        },
      ],
    },
    stampede: {
      name: 'Avalanche de défauts de cache',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        { goal: 'Le cache redémarrera. Maintenez Apdex au-dessus de 0,85 pendant 2 minutes.' },
        {
          goal: 'La demande augmente de 50 %. Le Cache redémarre encore. Maintenez Apdex au-dessus de 0,85 avec dépenses à 8,00 $/s ou moins.',
        },
      ],
    },
    'slow-uploads': {
      name: 'Envois lents',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        {
          goal: 'La demande est en hausse de 60 %. Maintenez Apdex au-dessus de 0,9 avec dépenses à 6,00 $/s ou moins.',
        },
        {
          goal: "Une tâche échouera pour toujours. Gardez la file d'attente sous 500 tâches pendant 2 minutes.",
        },
      ],
    },
    bots: {
      name: 'Robots',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        { goal: 'Les grattoirs arrivent. Maintenez Apdex au-dessus de 0,9 pendant 2 minutes.' },
        {
          goal: 'Ils sont de retour. Maintenez Apdex au-dessus de 0,9 avec dépenses à 10,80 $/s ou moins.',
        },
      ],
    },
    'zone-outage': {
      name: 'Panne de zone',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        { goal: 'Une zone échouera. Maintenez Apdex au-dessus de 0,85 pendant 2 minutes.' },
        {
          goal: 'La demande augmente de 50 %. Une zone tombe encore en panne. Maintenez Apdex au-dessus de 0,85 avec dépenses à 22,20 $/s ou moins.',
        },
      ],
    },
    'cold-start': {
      name: 'Démarrage à froid',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        { goal: 'Un pic de 4× arrive. Maintenez Apdex au-dessus de 0,85 pendant 2 minutes.' },
        {
          goal: 'Trafic de nuit. Maintenez Apdex au-dessus de 0,9 avec dépenses à 17,40 $/s ou moins.',
        },
      ],
    },
    'stale-checkout': {
      name: 'Paiement sur données obsolètes',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        {
          goal: 'Les écritures vont s’accumuler. Gardez chaque paiement correct pendant 2 minutes.',
          watch: { label: 'Commander' },
        },
        {
          goal: 'La demande a augmenté de 50 % et les écritures reviennent. Gardez chaque paiement correct grâce à lui.',
          watch: { label: 'Commander' },
        },
      ],
    },
    'gc-pauses': {
      name: 'Pauses du ramasse-miettes',
      objectives: [
        {
          goal: 'Maintenez les lectures de l’API sous 110 ms au p99 pendant 90 secondes.',
          watch: { label: 'p99 en lecture' },
        },
        {
          goal: 'Le tas va se remplir. Maintenez les lectures de l’API sous 110 ms au p99 pendant 2 minutes.',
          watch: { label: 'p99 en lecture' },
        },
        {
          goal: 'Il se remplit encore. Maintenez les lectures sous 110 ms au p99 avec dépenses à 93,20 $/s ou moins.',
          watch: { label: 'p99 en lecture' },
        },
      ],
    },
    'retry-storm': {
      name: 'Tempête de tentatives',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        {
          goal: 'La base de données ralentira pendant 20 s. Récupérez les erreurs en dessous de 1 % et maintenez pendant 2 minutes.',
        },
        {
          goal: 'Il ralentit encore. Ramenez les erreurs sous 1 % et tenez avec dépenses à 197,00 $/s ou moins.',
        },
      ],
    },
    'analytics-primary': {
      name: 'Analyses sur la base primaire',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 90 secondes.' },
        {
          goal: 'Fin du trimestre : un rapport analysera chaque tableau. Maintenez Apdex au-dessus de 0,85 pendant 2 minutes.',
        },
        {
          goal: 'La demande augmente de 50 %. Maintenez Apdex au-dessus de 0,9 avec dépenses à 254,00 $/s ou moins.',
        },
      ],
    },
    'far-away': {
      name: 'Utilisateurs éloignés',
      objectives: [
        { goal: 'Servir chaque demande pendant 2 minutes.' },
        {
          goal: 'La moitié de vos utilisateurs vivent hors d’Amérique du Nord. Ramenez les lectures de l’API sous 140 ms en moyenne pendant 2 minutes.',
          watch: { label: 'Moyenne en lecture' },
        },
      ],
    },
    'missed-write': {
      name: 'Écriture non répliquée',
      objectives: [
        {
          goal: 'Chaque lecture API doit voir la dernière écriture. Tenez-le pendant 2 minutes.',
          watch: { label: 'Lectures fraîches' },
        },
        {
          goal: 'Une réplique échouera. Gardez les lectures fraîches et les erreurs inférieures à 1 % pendant 2 minutes.',
          watch: { label: 'Lectures fraîches' },
        },
      ],
    },
    'hot-key': {
      name: 'Clé très sollicitée',
      objectives: [
        { goal: 'Maintenez Apdex au-dessus de 0,9 pendant 2 minutes.' },
        { goal: 'Une célébrité publiera. Maintenez Apdex au-dessus de 0,85 pendant 2 minutes.' },
      ],
    },
  },
  challenges: {
    'hello-world': {
      name: 'Bonjour le monde',
      brief: 'Servez 20 rps sur une boîte à moins de 0,05 $/s.',
      inspiredBy: 'Chaque premier déploiement',
    },
    'split-the-box': {
      name: 'Divisez la boîte',
      brief:
        "L'application et la base de données partagent une boîte. Atteignez 100 rps avec un p99 sous 300 ms.",
      inspiredBy: 'La première étape de mise à l’échelle dans la plupart des entreprises',
    },
    slashdotted: {
      name: 'Barre oblique',
      brief: 'Trafic ×10 pendant 3 minutes avec un budget fixe.',
      inspiredBy: "L'effet Slashdot",
    },
    c10k: {
      name: 'C10k',
      brief: '10 000 connexions ouvertes. Les serveurs à un processus par requête les refusent.',
      inspiredBy: 'Dan Kegel’s C10k problem (1999)',
    },
    'event-loop': {
      name: 'La boucle des événements',
      brief: 'Node.js uniquement. 5% de connexion. p99 sous 300 ms.',
      inspiredBy: "Node.js « Ne bloquez pas la boucle d'événements »",
    },
    'too-many-connections': {
      name: 'Trop de connexions',
      brief: '40 serveurs applicatifs, un Postgres. Aucune connexion refusée.',
      inspiredBy: 'Limites de connexion PostgreSQL',
    },
    shoestring: {
      name: 'Stack Overflow avec trois fois rien',
      brief: 'Servez 800 rps avec au plus 12 nœuds.',
      inspiredBy: 'Stack Overflow servant un trafic énorme avec un petit nombre de serveurs',
    },
    'n-plus-one': {
      name: 'Le N+1',
      brief: 'Rails avec des requêtes N+1. 12 heures de dev pour le corriger.',
      inspiredBy: 'Chargement paresseux des ORM',
    },
    'thirteen-engineers': {
      name: 'Treize ingénieurs',
      brief: 'Rails à 400 rps. 13 ingénieurs ont une journée : 104 heures de dev.',
      inspiredBy: 'Instagram avait 13 employés lorsque Facebook l’a racheté (2012)',
    },
    'credential-stuffing': {
      name: 'Bourrage d’identifiants',
      brief:
        'Des bots essaient des mots de passe divulgués à la connexion. Gardez les vrais utilisateurs connectés.',
      inspiredBy: 'Attaques courantes sur les points d’accès de connexion',
    },
    'black-friday': {
      name: 'Black Friday',
      brief: 'La demande triple à la minute 5 pendant 5 minutes. Dépensez le moins possible.',
      inspiredBy: 'Jours de pic du commerce de détail',
    },
    'us-east-1': {
      name: 'us-east-1',
      brief: 'Une zone tombe à la minute 5. Servez 99,9 % des requêtes.',
      inspiredBy: 'Plusieurs pannes d’AWS us-east-1',
    },
    'exactly-once': {
      name: 'Exactement une fois',
      brief:
        'Le prestataire de paiement ralentit à 2 s, deux fois. Débitez chaque achat une seule fois.',
      inspiredBy: 'Idempotence des paiements',
    },
    'two-million-sockets': {
      name: 'Deux millions de sockets',
      brief:
        'Deux millions de connexions de chat ouvertes. Maintenez-les pour le moins de dollars possible.',
      inspiredBy: 'Phoenix a atteint 2 millions de connexions WebSocket sur un seul serveur (2015)',
    },
    'pokemon-go': {
      name: 'Pokémon GO',
      brief: 'Jour du lancement : la demande atteint 50× la prévision en 10 minutes.',
      inspiredBy:
        'Le trafic du lancement de Pokémon GO a atteint environ 50× l’objectif prévu (2016)',
    },
    'healthcare-launch': {
      name: 'Lancement du portail santé',
      brief: 'Le lancement est à la minute 2, et ce design a beaucoup de défauts. Trouvez-les.',
      inspiredBy: 'Le lancement de healthcare.gov (2013)',
    },
    'thundering-herd': {
      name: 'Troupeau tonitruant',
      brief:
        'Les serveurs de chat redémarrent à la minute 2. 240 000 clients se reconnectent et se connectent en même temps.',
      inspiredBy: 'Tempêtes de reconnexion',
    },
    'read-states': {
      name: 'États de lecture',
      brief: 'Le tas se remplit deux fois. Gardez le p99 sous 90 ms. Tout runtime.',
      inspiredBy: 'Discord a migré un service de Go vers Rust pour supprimer les pics de GC (2020)',
    },
    'fail-whale': {
      name: 'La baleine de l’échec',
      brief: 'Servez les fils sous 200 ms au p99. Certains comptes ont 10 millions d’abonnés.',
      inspiredBy: 'Problèmes de mise à l’échelle de la timeline de Twitter',
    },
    'reports-at-noon': {
      name: 'Rapports à midi',
      brief:
        'La finance lance ses rapports sur le primaire aux minutes 2 et 5, et ils ne peuvent pas être annulés. Gardez les achats rapides.',
      inspiredBy: 'Requêtes analytiques sur des bases de données transactionnelles',
    },
    'gpu-economics': {
      name: 'Économie des GPU',
      brief: 'Servez chaque prompt d’IA et gardez 15 % du revenu en marge.',
      inspiredBy: 'Inférence auto-hébergée face aux API hébergées',
    },
    metastable: {
      name: 'Métastable',
      brief:
        'Une tempête de nouvelles tentatives est en cours. Rétablissez le service avec le moins de changements.',
      inspiredBy: 'Défaillances métastables dans les systèmes distribués',
    },
    'regex-of-doom': {
      name: 'La regex fatale',
      brief:
        'Une nouvelle règle WAF bloque chaque WAF à 100 % de CPU à la minute 2. Rétablissez le service.',
      inspiredBy: 'Panne de Cloudflare, 2 juillet 2019',
    },
    'forty-three-seconds': {
      name: '43 secondes',
      brief: 'Le lien entre les régions tombe à la minute 2. Gardez un seul leader.',
      inspiredBy: 'Partition réseau de GitHub, 21 octobre 2018',
    },
    'follow-the-sun': {
      name: 'Suivre le soleil',
      brief:
        'Quatre régions, chacune avec son propre pic du soir, sur une journée. Dépensez moins de $700/s.',
      inspiredBy: 'Pics quotidiens mondiaux',
    },
    celebrity: {
      name: 'Célébrité',
      brief: 'Une célébrité publie à la minute 2. 30 % des lectures demandent une seule clé.',
      inspiredBy: 'Clés très sollicitées issues de comptes viraux',
    },
    'gone-from-the-internet': {
      name: 'Disparu d’Internet',
      brief:
        'Un changement de routage à la minute 2 retire toutes les régions d’Internet. Rétablissez-les.',
      inspiredBy: 'Panne de Facebook, 4 octobre 2021',
    },
    'the-typo': {
      name: 'La faute de frappe',
      brief:
        'À la minute 2, une commande censée retirer un serveur retire tout le niveau Recherche.',
      inspiredBy: 'Panne d’Amazon S3, 28 février 2017',
    },
    'leap-second': {
      name: 'Seconde intercalaire',
      brief:
        'À la minute 2, l’horloge en Asie-Pacifique répète une seconde. Chaque serveur d’application y tourne à 100 % de CPU. Gardez le p99 sous 380 ms.',
      inspiredBy: 'La seconde intercalaire de 2012',
    },
    'rule-of-40': {
      name: 'Règle des 40',
      brief:
        'Les utilisateurs augmentent de 25 % pendant la partie. Atteignez une croissance plus marge de 40 : gardez une marge de 15 %.',
      inspiredBy: 'La règle des 40 du SaaS',
    },
    'postgres-for-everything': {
      name: 'Postgres pour tout',
      brief:
        'Servez chaque type avec Postgres comme seul stockage de données, avec un p99 sous 800 ms.',
      inspiredBy: 'L’argument « utilisez simplement Postgres »',
    },
    'five-nines': {
      name: 'Cinq neuf',
      brief:
        'Quatre semaines : deux serveurs et une région tombent, et le trafic triple une fois. Servez 99,999 %.',
      inspiredBy: 'Objectifs de disponibilité de 99,999 %',
    },
  },
}
