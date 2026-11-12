import type { Catalog } from '@quorum/ui/i18n/catalog/en'
import {
  ACHIEVEMENTS,
  BACKUPS,
  BUILD_GROUPS,
  CACHE_KEYS,
  CACHE_STRATEGIES,
  COLLECTORS,
  COMPONENTS,
  DB_RETENTIONS,
  DEPLOY_STRATEGIES,
  DOCK_GROUPS,
  ERAS,
  EXITS,
  FAMILIES,
  FEATURES,
  FRAMEWORKS,
  GLOSSARY,
  GPU_MODELS,
  INCIDENTS,
  KINDS,
  LB_POLICIES,
  LOG_ACKS,
  MUTATORS,
  PERKS,
  PM_MODES,
  POLICIES,
  POOLS,
  REGION_INFO,
  RESEARCH,
  RESEARCH_TRACKS,
  RUNTIMES,
  SHARD_KEYS,
  STORAGE_CLASSES,
  STORAGE_IOPS,
  TASKS,
  VEC_INDEXES,
  VENTURES,
} from '@quorum/simulation/catalog'
import { GUIDED } from '@quorum/simulation/sandbox'
import { slug } from '../page.ts'
import { en } from './en/index.ts'
import type { Locale } from './locale.ts'
import type { Messages } from './messages.ts'

/* What a view needs to speak a language: its interface copy, and the catalog tables with that
   language's words laid over them. The words come from `@quorum/ui/i18n/catalog/<language>`, the
   same tables the game reads, so a term has one translation in both places. A field a language
   does not translate keeps its English text. English is the Simulation's own tables, untouched. */

type Copy = Readonly<Record<string, object | undefined>>

const overlay = <T extends Readonly<Record<string, object>>>(
  table: T,
  copy: Copy | undefined,
): T =>
  copy === undefined
    ? table
    : (Object.fromEntries(
        Object.entries(table).map(([id, entry]) => [id, { ...entry, ...copy[id] }]),
      ) as T)

const overlayList = <E extends object>(
  list: ReadonlyArray<E>,
  key: keyof E,
  copy: Copy | undefined,
): ReadonlyArray<E> =>
  copy === undefined ? list : list.map((entry) => ({ ...entry, ...copy[String(entry[key])] }) as E)

const overlayIndexed = <E extends object>(
  list: ReadonlyArray<E>,
  copy: ReadonlyArray<object> | undefined,
): ReadonlyArray<E> =>
  copy === undefined ? list : list.map((entry, index) => ({ ...entry, ...copy[index] }) as E)

type GuidedWords = Readonly<{
  name?: string
  objectives?: ReadonlyArray<Readonly<{ goal?: string }>>
}>

const overlayGuided = (copy: Catalog['guided'] | undefined): typeof GUIDED =>
  copy === undefined
    ? GUIDED
    : (Object.fromEntries(
        Object.entries(GUIDED).map(([id, def]) => {
          const words = (copy as Readonly<Record<string, GuidedWords | undefined>>)[id]
          return [
            id,
            {
              ...def,
              name: words?.name ?? def.name,
              objectives: def.objectives.map((objective, index) => ({
                ...objective,
                goal: words?.objectives?.[index]?.goal ?? objective.goal,
              })),
            },
          ]
        }),
      ) as unknown as typeof GUIDED)

const catalogView = (copy: Catalog | null) => ({
  ACHIEVEMENTS: overlay(ACHIEVEMENTS, copy?.achievements),
  BACKUPS: overlay(BACKUPS, copy?.backups),
  BUILD_GROUPS: overlayList(BUILD_GROUPS, 'key', copy?.buildGroups),
  CACHE_KEYS: overlay(CACHE_KEYS, copy?.cacheKeys),
  CACHE_STRATEGIES: overlay(CACHE_STRATEGIES, copy?.cacheStrategies),
  COLLECTORS: overlay(COLLECTORS, copy?.collectors),
  COMPONENTS: overlay(COMPONENTS, copy?.components),
  DB_RETENTIONS: overlay(DB_RETENTIONS, copy?.dbRetentions),
  DEPLOY_STRATEGIES: overlay(DEPLOY_STRATEGIES, copy?.deployStrategies),
  DOCK_GROUPS: overlayList(DOCK_GROUPS, 'key', copy?.dockGroups),
  ERAS: overlayIndexed(ERAS, copy?.eras),
  EXITS: overlay(EXITS, copy?.exits),
  FAMILIES: overlay(FAMILIES, copy?.families),
  FEATURES: overlay(FEATURES, copy?.features),
  FRAMEWORKS: overlay(FRAMEWORKS, copy?.frameworks),
  GLOSSARY: overlayList(GLOSSARY, 'id', copy?.glossary),
  GPU_MODELS: overlay(GPU_MODELS, copy?.gpuModels),
  GUIDED: overlayGuided(copy?.guided),
  INCIDENTS: overlay(INCIDENTS, copy?.incidents),
  KINDS: overlay(KINDS, copy?.kinds),
  LB_POLICIES: overlay(LB_POLICIES, copy?.lbPolicies),
  LOG_ACKS: overlay(LOG_ACKS, copy?.logAcks),
  MUTATORS: overlay(MUTATORS, copy?.mutators),
  PERKS: overlay(PERKS, copy?.perks),
  PM_MODES: overlay(PM_MODES, copy?.pmModes),
  POLICIES: overlay(POLICIES, copy?.policies),
  POOLS: overlay(POOLS, copy?.pools),
  REGION_INFO: overlay(REGION_INFO, copy?.regionInfo),
  RESEARCH: overlay(RESEARCH, copy?.research),
  RESEARCH_TRACKS: overlayList(RESEARCH_TRACKS, 'key', copy?.researchTracks),
  RUNTIMES: overlay(RUNTIMES, copy?.runtimes),
  SHARD_KEYS: overlay(SHARD_KEYS, copy?.shardKeys),
  STORAGE_CLASSES: overlay(STORAGE_CLASSES, copy?.storageClasses),
  STORAGE_IOPS: overlay(STORAGE_IOPS, copy?.storageIops),
  TASKS: overlay(TASKS, copy?.tasks),
  VEC_INDEXES: overlay(VEC_INDEXES, copy?.vecIndexes),
  VENTURES: overlay(VENTURES, copy?.ventures),
})

/** The catalog tables the wiki reads, with a language's words laid over them. */
export type CatalogView = ReturnType<typeof catalogView>

/** A heading of a generated page: its text in the page's language, and the anchor it keeps in every language. */
export type Title = Readonly<{ id: string; text: string }>

export type Lang = Readonly<{
  locale: Locale
  t: Messages
  cat: CatalogView
  /** A heading of a generated page, by key. Its anchor is the English text's slug. */
  title: (key: keyof Messages['reference']['sections']) => Title
}>

const make = (locale: Locale, t: Messages, catalog: Catalog | null): Lang => ({
  locale,
  t,
  cat: catalogView(catalog),
  title: (key) => ({ id: slug(en.reference.sections[key]), text: t.reference.sections[key] }),
})

const langs: Partial<Record<Locale, Lang>> = { en: make('en', en, null) }

/** Makes a language known: its interface copy and its catalog words. Done once, by its bundle. */
export const registerLocale = (locale: Locale, t: Messages, catalog: Catalog): void => {
  langs[locale] = make(locale, t, catalog)
}

/** Whether a language's bundle has been loaded. English always is. */
export const isLoaded = (locale: Locale): boolean => langs[locale] !== undefined

/** A language's copy and catalog. A language that has not loaded reads English. */
export const langOf = (locale: Locale): Lang => langs[locale] ?? (langs['en'] as Lang)
