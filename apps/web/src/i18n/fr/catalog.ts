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
    },
    anycast: {
      term: 'Anycast',
    },
    apdex: {
      term: 'Apdex',
    },
    'async-io': {
      term: 'Entrées-sorties asynchrones',
    },
    'at-least-once-delivery': {
      term: 'Livraison au moins une fois',
    },
    autoscaling: {
      term: "Mise à l'échelle automatique",
    },
    'availability-zone': {
      term: 'Zone de disponibilité',
    },
    backpressure: {
      term: 'Contre-pression',
    },
    bcrypt: {
      term: 'bcrypt',
    },
    'binary-rpc': {
      term: 'RPC binaire',
    },
    'bgp-border-gateway-protocol': {
      term: 'BGP (protocole de routage interdomaines)',
    },
    'blast-radius': {
      term: 'Rayon d’impact',
    },
    'blue-green-deployment': {
      term: 'Déploiement bleu-vert',
    },
    'bot-management': {
      term: 'Gestion des robots',
    },
    'brookss-law': {
      term: 'Loi de Brooks',
    },
    bulkhead: {
      term: 'Cloisonnement',
    },
    'burn-rate': {
      term: 'Rythme de consommation',
    },
    'bytecode-cache': {
      term: 'Cache de bytecode',
    },
    'cache-hit-rate': {
      term: 'Taux de succès du cache',
    },
    'cache-stampede': {
      term: 'Avalanche de défauts de cache',
    },
    'cache-warming': {
      term: 'Préchauffage du cache',
    },
    'cache-aside': {
      term: 'Cache-aside',
    },
    'canary-deployment': {
      term: 'Déploiement canari',
    },
    'cascading-failure': {
      term: 'Défaillance en cascade',
    },
    'cdc-change-data-capture': {
      term: 'CDC (capture des modifications de données)',
    },
    'cdn-content-delivery-network': {
      term: 'CDN (réseau de diffusion de contenu)',
    },
    'chaos-engineering': {
      term: 'Ingénierie du chaos',
    },
    'circuit-breaker': {
      term: 'Coupe-circuit',
    },
    'code-review': {
      term: 'Revue de code',
    },
    'cold-start': {
      term: 'Démarrage à froid',
    },
    compression: {
      term: 'Compression',
    },
    'connection-pooling': {
      term: 'Mutualisation des connexions',
    },
    'consistent-hashing': {
      term: 'Hachage cohérent',
    },
    'container-orchestration': {
      term: 'Orchestration de conteneurs',
    },
    'continuous-batching': {
      term: 'Traitement par lots continu',
    },
    'continuous-delivery': {
      term: 'Livraison continue',
    },
    'conways-law': {
      term: 'Loi de Conway',
    },
    'credential-stuffing': {
      term: 'Bourrage d’identifiants',
    },
    'data-residency': {
      term: 'Résidence des données',
    },
    'ddos-distributed-denial-of-service': {
      term: 'DDoS (déni de service distribué)',
    },
    'dead-letter-queue': {
      term: 'File des messages non traités',
    },
    denormalization: {
      term: 'Dénormalisation',
    },
    'dependency-scanning': {
      term: 'Analyse des dépendances',
    },
    'distributed-tracing': {
      term: 'Traçage distribué',
    },
    'diurnal-traffic': {
      term: 'Trafic diurne',
    },
    'dns-round-robin': {
      term: 'Répartition DNS par tourniquet',
    },
    'dora-metrics': {
      term: 'Métriques DORA',
    },
    downsampling: {
      term: 'Sous-échantillonnage',
    },
    drift: {
      term: 'Dérive',
    },
    egress: {
      term: 'Trafic sortant',
    },
    'edge-side-includes': {
      term: 'Inclusions côté edge',
    },
    'encryption-at-rest': {
      term: 'Chiffrement au repos',
    },
    'error-budget': {
      term: 'Budget d’erreur',
    },
    'event-loop': {
      term: 'Boucle d’événements',
    },
    'eventual-consistency': {
      term: 'Cohérence éventuelle',
    },
    'expand-and-contract': {
      term: 'Élargir puis contracter',
    },
    'fallacies-of-distributed-computing': {
      term: 'Idées reçues sur les systèmes distribués',
    },
    'fan-out': {
      term: 'Diffusion',
    },
    'fan-out-on-write': {
      term: 'Diffusion à l’écriture',
    },
    'feature-flag': {
      term: 'Indicateur de fonctionnalité',
    },
    'four-golden-signals': {
      term: 'Quatre signaux clés',
    },
    'gc-pause': {
      term: 'Pause du ramasse-miettes',
    },
    geodns: {
      term: 'GeoDNS',
    },
    'gil-global-interpreter-lock': {
      term: 'GIL (verrou global de l’interpréteur)',
    },
    gitops: {
      term: 'GitOps',
    },
    'graceful-degradation': {
      term: 'Dégradation gracieuse',
    },
    'green-threads': {
      term: 'Threads légers',
    },
    'health-check': {
      term: 'Sonde de disponibilité',
    },
    'hedged-request': {
      term: 'Requête redondante',
    },
    'hot-key': {
      term: 'Clé très sollicitée',
    },
    'http-keep-alive': {
      term: 'Connexions HTTP persistantes',
    },
    'http2-and-http3': {
      term: 'HTTP/2 et HTTP/3',
    },
    'iac-tool': {
      term: 'Outil IaC',
    },
    idempotency: {
      term: 'Idempotence',
    },
    'inverted-index': {
      term: 'Index inversé',
    },
    'jit-warmup': {
      term: 'Montée en régime du JIT',
    },
    'leaderless-replication': {
      term: 'Réplication sans leader',
    },
    'leap-smearing': {
      term: 'Étalement de la seconde intercalaire',
    },
    'littles-law': {
      term: 'Loi de Little',
    },
    'load-balancer': {
      term: 'Répartiteur de charge',
    },
    'load-shedding': {
      term: 'Délestage',
    },
    'memory-leak': {
      term: 'Fuite de mémoire',
    },
    'materialized-view': {
      term: 'Vue matérialisée',
    },
    'metastable-failure': {
      term: 'Défaillance métastable',
    },
    mirror: {
      term: 'Miroir',
    },
    'model-inference': {
      term: 'Inférence de modèle',
    },
    'mttd-and-mtta': {
      term: 'MTTD et MTTA',
    },
    mttr: {
      term: 'MTTR',
    },
    'n1-query': {
      term: 'requête N+1',
    },
    'network-partition': {
      term: 'Partition réseau',
    },
    'node-drain': {
      term: 'Drainage d’un nœud',
    },
    'object-storage': {
      term: 'Stockage objet',
    },
    observability: {
      term: 'Observabilité',
    },
    'oltp-and-olap': {
      term: 'OLTP et OLAP',
    },
    'on-call': {
      term: 'Astreinte',
    },
    'operating-margin': {
      term: 'Marge opérationnelle',
    },
    'percentile-p50-p95-p99': {
      term: 'Centile (p50, p95, p99)',
    },
    'point-in-time-recovery': {
      term: 'Restauration à un instant précis',
    },
    'power-of-two-choices': {
      term: 'Choix entre deux serveurs',
    },
    'pre-fork-worker-model': {
      term: 'Modèle de processus précréés',
    },
    'process-per-request': {
      term: 'Un processus par requête',
    },
    quantization: {
      term: 'Quantification',
    },
    quorum: {
      term: 'Quorum',
    },
    raft: {
      term: 'Raft',
    },
    'rate-limiting': {
      term: 'Limitation de débit',
    },
    'read-replica': {
      term: 'Réplique en lecture',
    },
    'read-your-writes-consistency': {
      term: 'Cohérence de lecture de ses propres écritures',
    },
    'red-method': {
      term: 'Méthode RED',
    },
    'redos-regular-expression-denial-of-service': {
      term: 'ReDoS (déni de service par expression régulière)',
    },
    'replication-lag': {
      term: 'Retard de réplication',
    },
    'retry-with-backoff-and-jitter': {
      term: 'Nouvelles tentatives avec attente progressive et aléatoire',
    },
    'rpo-and-rto': {
      term: 'RPO et RTO',
    },
    'rule-of-40': {
      term: 'Règle des 40',
    },
    runbook: {
      term: 'Procédure',
    },
    service: {
      term: 'Service',
    },
    sharding: {
      term: 'Partitionnement',
    },
    'shared-nothing': {
      term: 'Sans ressources partagées',
    },
    'slo-sla-sli': {
      term: 'SLO, SLA, SLI',
    },
    'soc-2': {
      term: 'SOC 2',
    },
    'spot-instance': {
      term: 'Instance spot',
    },
    'strangler-pattern': {
      term: 'Architecture de l’étrangleur',
    },
    'synchronous-replication': {
      term: 'Réplication synchrone',
    },
    'tail-at-scale': {
      term: 'Latence extrême à grande échelle',
    },
    'tech-debt': {
      term: 'Dette technique',
    },
    'thread-pool': {
      term: 'Pool de threads',
    },
    'thundering-herd': {
      term: 'Effet de troupeau',
    },
    'tiered-caching': {
      term: 'Mise en cache à plusieurs niveaux',
    },
    timeout: {
      term: "Délai d'attente",
    },
    'tls-certificate': {
      term: 'Certificat TLS',
    },
    'token-bucket': {
      term: 'Seau à jetons',
    },
    'transactional-outbox': {
      term: 'Boîte d’envoi transactionnelle',
    },
    'use-method': {
      term: 'Méthode USE',
    },
    utilization: {
      term: 'Utilisation',
    },
    'vertical-and-horizontal-scaling': {
      term: "Mise à l'échelle verticale et horizontale",
    },
    'waf-web-application-firewall': {
      term: "WAF (pare-feu d'applications Web)",
    },
    'write-through-cache': {
      term: 'Cache en écriture directe',
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
