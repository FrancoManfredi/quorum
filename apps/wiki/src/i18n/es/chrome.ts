import type { Messages } from '../messages.ts'

/* The wiki's interface copy in Spanish. The player addresses the reader as `tú`. Game nouns
   follow `apps/web/src/i18n/es`: Investigación, Estudio, Nodo, Componente, Tablero, Diseño,
   Conocimiento, Legado, Empresa, Pre-semilla and Semilla. */

type Chrome = Omit<Messages, 'islands' | 'options' | 'reference'>

export const chrome: Chrome = {
  site: {
    name: 'Wiki de Quorum',
    title: (page) => `${page} · Wiki de Quorum`,
    notFoundTitle: 'No encontrada · Wiki de Quorum',
    description: 'Cómo funciona Quorum.',
    ogImageAlt:
      'La tarjeta de la Wiki de Quorum: cómo funciona cada Componente y por qué se rompe tu Diseño.',
  },
  header: {
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    github: 'Quorum en GitHub',
    play: 'Jugar',
    sections: 'Secciones',
    wordmarkWiki: 'Wiki',
    language: 'Idioma',
    switchTo: (name) => `Leer esta página en ${name}`,
  },
  quadrants: {
    play: { label: 'Jugar', purpose: 'Aprende los controles' },
    tutorials: { label: 'Tutoriales', purpose: 'Aprende jugando' },
    guides: { label: 'Guías prácticas', purpose: 'Resuelve un problema' },
    explanation: { label: 'Explicación', purpose: 'Entiende el porqué' },
    patterns: { label: 'Patrones', purpose: 'Aprende un patrón de diseño' },
    reference: { label: 'Referencia', purpose: 'Consulta un dato' },
    design: { label: 'Diseño', purpose: 'Lee el documento de diseño' },
    about: { label: 'Acerca de', purpose: 'La propia wiki' },
  },
  sidebar: {
    collapse: (name) => `Contraer ${name}`,
    expand: (name) => `Expandir ${name}`,
  },
  toc: { onThisPage: 'En esta página' },
  prose: { linkToSection: 'Enlace a esta sección' },
  article: {
    seeAlso: 'Ver también',
    editOnGitHub: 'Editar esta página en GitHub',
    designNotes: 'Notas de diseño',
    support: 'Apoya Quorum en Ko-fi',
    disclaimerLead: 'Quorum es un juego y simplifica los sistemas reales a propósito. ',
    disclaimerLink: 'Comprueba cómo es lo real',
    disclaimerMid:
      ' antes de decidir. Cambia cada semana, así que esta página puede ir por detrás del juego. ',
    changelogLink: 'Consulta el registro de cambios',
    era: (index, name) => `Era ${index} · ${name}`,
    spoilerAbout: (era) => `Esta página trata de la Era ${era}. `,
    spoilerHidden: 'Elegiste ocultar las Eras posteriores. Mostrarla de todos modos.',
    untranslated: 'Esta página aún no está traducida al español.',
    notFound: {
      heading: 'No hay ninguna página aquí',
      body: (path) => `No hay nada en ${path}. Búscala, o empieza desde la página de inicio.`,
      home: 'Ir a la página de inicio',
    },
  },
  home: {
    heroTitle: 'Wiki de Quorum',
    start: 'Empieza tu primera Empresa',
    browse: 'Explora los Componentes',
    openSource: 'Código abierto en GitHub',
    counts: {
      components: 'Componentes',
      research: 'Investigaciones',
      eras: 'Eras',
      incidents: 'Incidentes',
      sandboxes: 'Sandboxes',
      terms: 'Términos de ingeniería',
    },
    trouble: {
      title: 'Algo está fallando',
      lead: 'Parte del síntoma que ves en el juego.',
    },
    guided: {
      title: 'Rutas guiadas',
      lead: 'Un orden de lectura de la lección a la idea y de la idea a la receta.',
    },
    kinds: {
      title: 'Explora por tipo',
      lead: 'Seis tipos de página, cada uno para una necesidad distinta.',
    },
    open: {
      title: 'Código abierto',
      lead: 'El juego, la Simulación y esta wiki comparten un único repositorio.',
    },
    footer: {
      before:
        '¿Quieres las reglas, las fórmulas y las preguntas abiertas detrás del juego? Lee el documento de ',
      design: 'Diseño',
      afterDesign: ', o mira ',
      changelog: 'qué cambió esta semana',
      afterChangelog: '. Quorum es un juego y simplifica los sistemas reales a propósito. ',
      disclaimer: 'Lee qué significa eso',
      afterDisclaimer: ' antes de actuar según lo que aprendas aquí. Si el juego te ayuda, ',
      kofi: 'apóyalo en Ko-fi',
      end: '.',
    },
  },
  paths: {
    play: {
      title: 'Jugar',
      summary:
        'Aprende los controles y las pantallas de Quorum, desde tu primera Empresa hasta tus primeros minutos.',
    },
    'scaling-steps': {
      title: 'Escala un sistema paso a paso',
      summary:
        'Construye un sistema paso a paso, desde una sola máquina hasta varias regiones, con cada ajuste explicado.',
    },
    'first-steps': {
      title: 'Primeros pasos',
      summary:
        'Juega tu primera Empresa desde el Garaje hasta su primer incidente y su primera Investigación.',
    },
    'read-the-numbers': {
      title: 'Lee los números',
      summary: 'Qué te dicen la latencia, las colas, el Apdex y el Conocimiento, y cómo actuar.',
    },
    'scale-up': {
      title: 'Escala',
      summary:
        'Crece más allá de una sola máquina: la capa de datos, los picos, los reintentos y más regiones.',
    },
    'run-the-company': {
      title: 'Dirige la Empresa',
      summary: 'El dinero, el equipo, las Eras y cómo termina bien una Empresa.',
    },
  },
  pathNav: {
    stepTitle: (step, title) => `${step}. ${title}`,
    stepLabel: (step, title) => `Paso ${step}: ${title}`,
    guidedPath: (title) => `Ruta guiada: ${title}`,
    path: (title) => `Ruta: ${title}`,
    place: (index, count) => `${index} de ${count}`,
    next: 'Siguiente',
    nextPath: (title) => `Siguiente ruta: ${title}`,
    start: 'Empezar',
    continue: 'Continuar',
    again: 'Leer de nuevo',
  },
  groups: {
    Cost: { name: 'Coste', blurb: 'Paga por lo que usas y sabe cuánto cuesta cada usuario.' },
    'Deploys and change': {
      name: 'Despliegues y cambios',
      blurb: 'Publica y migra sin tumbar el sistema.',
    },
    Foundations: {
      name: 'Fundamentos',
      blurb: 'El vocabulario en el que se apoya el resto: latencia, disponibilidad, CAP y la cola.',
    },
    'Messaging and async': {
      name: 'Mensajería y asincronía',
      blurb: 'Colas, streams y las garantías entre ellos.',
    },
    'Operate and observe': {
      name: 'Operar y observar',
      blurb: 'Observa el sistema, fija objetivos y prepárate para el día en que falle.',
    },
    'Outside the game': {
      name: 'Fuera del juego',
      blurb: 'Patrones que Quorum no puede construir, con referencias que merece la pena leer.',
    },
    'Ran in production': {
      name: 'En producción',
      blurb: 'Formas que sistemas reales sostuvieron a escala, con el tablero que muestra por qué.',
    },
    Resilience: {
      name: 'Resiliencia',
      blurb: 'Timeouts, reintentos, breakers y otras formas de fallar en pequeño.',
    },
    'Scaling data': {
      name: 'Escalar los datos',
      blurb: 'Sharding, replicación, quórums y los almacenes que encajan con cada forma.',
    },
    'Scaling reads and compute': {
      name: 'Escalar lecturas y cómputo',
      blurb: 'Cachés, réplicas, balanceadores de carga y autoescalado.',
    },
    'Scaling steps': {
      name: 'Pasos de escalado',
      blurb: 'Construye un sistema paso a paso, desde una sola máquina hasta varias regiones.',
    },
    'Security and edge': {
      name: 'Seguridad y edge',
      blurb: 'La puerta de entrada, el cifrado, los secretos y dónde pueden vivir los datos.',
    },
    'When it broke': {
      name: 'Cuando se rompió',
      blurb: 'Caídas que cambiaron el diseño, y el tablero que muestra la dependencia.',
    },
  },
  search: {
    placeholder: 'Buscar',
    label: 'Buscar en la wiki',
    results: 'Resultados de la búsqueda',
    searching: 'Buscando…',
    unavailable: 'La búsqueda no está disponible.',
    none: 'Ninguna página coincide.',
    kinds: {
      tutorials: 'tutorial',
      guides: 'guía',
      patterns: 'patrón',
      explanation: 'explicación',
    },
  },
  spoilers: {
    title: 'Spoilers',
    all: 'Todas',
    allShow: 'Se muestran todas las Eras',
    hidingAfter: (era) => `Se oculta tras ${era}`,
    groupLabel: 'Oculta el contenido posterior a la Era que alcanzaste',
    showEvery: 'Mostrar todas las Eras',
    hideAfter: (era) => `Ocultar tras ${era}`,
    upTo: (era) => `Hasta ${era}`,
  },
  quiz: {
    title: 'Compruébalo',
    right: 'Correcto. ',
    wrong: 'No del todo. ',
    retry: 'Intentar de nuevo',
  },
  project: {
    stars: 'Estrellas',
    forks: 'Forks',
    contributors: 'Colaboradores',
    issues: 'Issues abiertos',
    blurb: 'Lee el código, avisa de un fallo o envía un arreglo.',
    star: 'Dar una estrella en GitHub',
    contribute: 'Cómo contribuir',
    source: (language) => `Código en ${language}`,
  },
}
