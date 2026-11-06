import { arg } from './arg.ts'
import type { Messages } from '../messages.ts'

export const research: Messages['research'] = {
  researched: 'Acquis',
  cost: (p0) => `Coût · ${arg(p0)}`,
  held: (p0) => `${arg(p0)} en réserve`,
  s: (p0) => `+${arg(p0)}/s`,
  glossary: (p0) => `Glossaire : ${arg(p0)}`,
  studyQueue: "File d'attente des études",
  queue: 'File d’attente',
  moveUp: 'Monter',
  moveDown: 'Descendre',
  cancel: 'Annuler',
  startStudy: (p0) => `Commencer l'étude · ${arg(p0)}`,
  opensIn: (p0) => `Disponible à l’étape ${arg(p0)}`,
  needs: (p0) => `Nécessite ${arg(p0)}`,
  studyNow: 'Étudier maintenant',
  studying: (p0) => `Étudier · ${arg(p0)}%`,
  openActionItemTheIncidentIt:
    "Ouvrir l'élément d'action. L’incident qu’il évite est deux fois plus probable jusqu’à ce que vous le recherchiez.",
  everyStudyBehindItWaits: (p0) => `${arg(p0)} Toutes les études derrière elle attendent.`,
  atTheFrontOfTheQueue: (p0) =>
    `${arg(p0)} En tête de file, elle bloque toutes les études derrière elle.`,
  requires: 'Nécessite',
  leadsTo: 'Conduit à',
  research: 'Recherche',
  closeEsc: 'Fermer (Échap)',
}
