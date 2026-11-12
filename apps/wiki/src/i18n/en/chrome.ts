/* The wiki's interface copy in English, the source of the shape every language must have.
   `../es/` is typed as `Messages`, so a missing or extra key fails typecheck. Keys that code
   reads for logic (a group's name, a section's id) stay English elsewhere; only display text
   lives here. Game nouns follow `apps/web/src/i18n`. */

export const chrome = {
  site: {
    name: 'Quorum Wiki',
    title: (page: string) => `${page} · Quorum Wiki`,
    notFoundTitle: 'Not found · Quorum Wiki',
    description: 'How Quorum works.',
    ogImageAlt: 'The Quorum Wiki card: how every Component works, and why your Design breaks.',
  },
  header: {
    openMenu: 'Open the menu',
    closeMenu: 'Close the menu',
    github: 'Quorum on GitHub',
    play: 'Play',
    sections: 'Sections',
    wordmarkWiki: 'Wiki',
    language: 'Language',
    switchTo: (name: string) => `Read this page in ${name}`,
  },
  quadrants: {
    play: { label: 'Play the game', purpose: 'Learn the controls' },
    tutorials: { label: 'Tutorials', purpose: 'Learn by playing' },
    guides: { label: 'How-to guides', purpose: 'Fix a problem' },
    explanation: { label: 'Explanation', purpose: 'Understand why' },
    patterns: { label: 'Patterns', purpose: 'Learn a design pattern' },
    reference: { label: 'Reference', purpose: 'Look up a fact' },
    design: { label: 'Design', purpose: 'Read the design document' },
    about: { label: 'About', purpose: 'The wiki itself' },
  },
  sidebar: {
    collapse: (name: string) => `Collapse ${name}`,
    expand: (name: string) => `Expand ${name}`,
  },
  toc: { onThisPage: 'On this page' },
  prose: { linkToSection: 'Link to this section' },
  article: {
    seeAlso: 'See also',
    editOnGitHub: 'Edit this page on GitHub',
    designNotes: 'Design notes',
    support: 'Support Quorum on Ko-fi',
    disclaimerLead: 'Quorum is a game and simplifies real systems on purpose. ',
    disclaimerLink: 'Check the real thing',
    disclaimerMid:
      ' before you decide. It changes every week, so this page can lag behind the game. ',
    changelogLink: 'See the changelog',
    era: (index: number, name: string) => `Era ${index} · ${name}`,
    spoilerAbout: (era: string) => `This page is about the ${era} Era. `,
    spoilerHidden: 'You chose to hide later Eras. Show it anyway.',
    untranslated: 'This page is not translated into this language yet.',
    notFound: {
      heading: 'No page here',
      body: (path: string) =>
        `Nothing lives at ${path}. Search for it, or start from the home page.`,
      home: 'Go to the home page',
    },
  },
  home: {
    heroTitle: 'Quorum Wiki',
    start: 'Start your first Company',
    browse: 'Browse the Components',
    openSource: 'Open source on GitHub',
    counts: {
      components: 'Components',
      research: 'Research items',
      eras: 'Eras',
      incidents: 'Incidents',
      sandboxes: 'Sandboxes',
      terms: 'Engineering terms',
    },
    trouble: {
      title: 'Something is going wrong',
      lead: 'Start from the symptom you see in the game.',
    },
    guided: { title: 'Guided paths', lead: 'A reading order from lesson to idea to recipe.' },
    kinds: { title: 'Browse by kind', lead: 'Six kinds of page, each for a different need.' },
    open: {
      title: 'Open source',
      lead: 'The game, the Simulation, and this wiki share one repository.',
    },
    footer: {
      before: 'Want the rules, formulas, and open questions behind the game? Read the ',
      design: 'Design',
      afterDesign: ' document, or see ',
      changelog: 'what changed this week',
      afterChangelog: '. Quorum is a game, and it simplifies real systems on purpose. ',
      disclaimer: 'Read what that means',
      afterDisclaimer: ' before you act on what you learn here. If the game helps you, ',
      kofi: 'support it on Ko-fi',
      end: '.',
    },
  },
  paths: {
    play: {
      title: 'Play the game',
      summary:
        'Learn the controls and screens of Quorum, from your first Company to your first minutes.',
    },
    'scaling-steps': {
      title: 'Scale a system step by step',
      summary:
        'Build a system one step at a time, from a single box to several regions, with every setting explained.',
    },
    'first-steps': {
      title: 'First steps',
      summary:
        'Play your first Company from the Garage to its first incident and its first Research.',
    },
    'read-the-numbers': {
      title: 'Read the numbers',
      summary: 'What latency, queues, Apdex, and Insight tell you, and how to act on them.',
    },
    'scale-up': {
      title: 'Scale up',
      summary: 'Grow past one box: the data tier, spikes, retries, and more regions.',
    },
    'run-the-company': {
      title: 'Run the Company',
      summary: 'Money, the team, the Eras, and how a Company ends well.',
    },
  },
  pathNav: {
    stepTitle: (step: number, title: string) => `${step}. ${title}`,
    stepLabel: (step: number, title: string) => `Step ${step}: ${title}`,
    guidedPath: (title: string) => `Guided path: ${title}`,
    path: (title: string) => `Path: ${title}`,
    place: (index: number, count: number) => `${index} of ${count}`,
    next: 'Next',
    nextPath: (title: string) => `Next path: ${title}`,
    start: 'Start',
    continue: 'Continue',
    again: 'Read again',
  },
  /** The Patterns section's groups, by the English name the frontmatter uses. */
  groups: {
    Cost: { name: 'Cost', blurb: 'Pay for what you use and know what each user costs.' },
    'Deploys and change': {
      name: 'Deploys and change',
      blurb: 'Ship and migrate without taking the system down.',
    },
    Foundations: {
      name: 'Foundations',
      blurb: 'The vocabulary the rest leans on: latency, availability, CAP and the tail.',
    },
    'Messaging and async': {
      name: 'Messaging and async',
      blurb: 'Queues, streams and the guarantees between them.',
    },
    'Operate and observe': {
      name: 'Operate and observe',
      blurb: 'See the system, set targets, and plan for the day it breaks.',
    },
    'Outside the game': {
      name: 'Outside the game',
      blurb: 'Patterns Quorum cannot build, with references worth reading.',
    },
    'Ran in production': {
      name: 'Ran in production',
      blurb: 'Shapes that real systems carried at scale, with the board that shows why.',
    },
    Resilience: {
      name: 'Resilience',
      blurb: 'Timeouts, retries, breakers and the other ways to fail small.',
    },
    'Scaling data': {
      name: 'Scaling data',
      blurb: 'Sharding, replication, quorums and the stores that fit each shape.',
    },
    'Scaling reads and compute': {
      name: 'Scaling reads and compute',
      blurb: 'Caches, replicas, load balancers and autoscaling.',
    },
    'Scaling steps': {
      name: 'Scaling steps',
      blurb: 'Build a system one step at a time, from a single box to several regions.',
    },
    'Security and edge': {
      name: 'Security and edge',
      blurb: 'The front door, encryption, secrets and where data may live.',
    },
    'When it broke': {
      name: 'When it broke',
      blurb: 'Outages that changed the design, and the board that shows the dependency.',
    },
  },
  search: {
    placeholder: 'Search',
    label: 'Search the wiki',
    results: 'Search results',
    searching: 'Searching…',
    unavailable: 'Search is unavailable.',
    none: 'No page matches.',
    /** What a page's section is called, so "tutorial" and "guide" find those pages. */
    kinds: {
      tutorials: 'tutorial',
      guides: 'guide',
      patterns: 'pattern',
      explanation: 'explanation',
    },
  },
  spoilers: {
    title: 'Spoilers',
    all: 'All',
    allShow: 'All Eras show',
    hidingAfter: (era: string) => `Hiding after ${era}`,
    groupLabel: 'Hide content after the Era you reached',
    showEvery: 'Show every Era',
    hideAfter: (era: string) => `Hide after ${era}`,
    upTo: (era: string) => `Up to ${era}`,
  },
  quiz: {
    title: 'Check yourself',
    right: 'Right. ',
    wrong: 'Not quite. ',
    retry: 'Try again',
  },
  project: {
    stars: 'Stars',
    forks: 'Forks',
    contributors: 'Contributors',
    issues: 'Open issues',
    blurb: 'Read the code, report a bug, or send a fix.',
    star: 'Star on GitHub',
    contribute: 'How to contribute',
    source: (language: string) => `${language} source`,
  },
}
