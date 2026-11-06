import { Effect, Schema } from 'effect'
import { def } from './define.ts'

/**
 * Object Storage price per GB stored per second. Like every time-billed price, a sim second bills
 * a real hour: S3 Standard is $0.023 per GB-month, about $0.000032 per GB-hour.
 */
export const STORAGE_PRICE = 0.000032

/**
 * Object Storage classes (07 "Object Storage"): the share of the standard storage price the class
 * bills, the fee per GB read back out of it, and whether a read waits hours. Infrequent access is
 * half the storage price and pays S3's $0.01 per GB retrieved. Archive is a tenth, and its objects
 * must be restored before they can be read, so a `media` request for one fails as `timeout`.
 */
export const STORAGE_CLASSES = {
  standard: { name: 'Standard', price: 1, retrieval: 0, archived: false },
  infrequent: { name: 'Infrequent access', price: 0.5, retrieval: 0.01, archived: false },
  archive: { name: 'Archive', price: 0.1, retrieval: 0, archived: true },
} as const

/**
 * Lifecycle rules (07 "Object Storage"): an object older than this many calendar days moves one
 * class cheaper, so Standard becomes Infrequent access and Infrequent access becomes Archive.
 * Days offered, and the age model below, are
 */
export const LIFECYCLE_DAYS = [0, 30, 90, 365] as const

/** Milliseconds R2 adds to a read outside its own CDN: with a CDN on the board there is none. */
export const R2_FIRST_BYTE_MS = 15
/**
 * What each product bills per request, before the cost index (09 "Base prices"). Per-use prices
 * take the list price times 1,200, the multiple the functions' prices take: S3 bills $0.0004 per
 * thousand reads and $0.005 per thousand writes, R2 $0.36 and $4.50 per million.
 */
export const STORE_VARIANTS = {
  s3: { name: 'S3', egress: true, get: 0.00048, put: 0.006 },
  r2: { name: 'R2', egress: false, get: 0.000432, put: 0.0054 },
} as const

/** The Glossary entries a Company meets once it runs this Component (15 "Glossary"). */
export const storageGlossary: ReadonlyArray<string> = ['object-storage']

/** The class Object Storage keeps its objects in (07 "Object Storage"). */
export const StorageClass = Schema.Literals(['standard', 'infrequent', 'archive'])
export type StorageClass = typeof StorageClass.Type

/** The product an Object Storage Node is (07 "Object Storage"). */
export const StoreVariant = Schema.Literals(['s3', 'r2'])
export type StoreVariant = typeof StoreVariant.Type

/** The saved properties of a storage Node, with the defaults an old save decodes to. */
export const storageFields = {
  /** The product an Object Storage Node is (07 "Object Storage"). */
  storeVariant: StoreVariant.pipe(Schema.withDecodingDefaultKey(Effect.succeed('s3' as const))),
  /** The class Object Storage keeps its objects in (07 "Object Storage"). */
  storageClass: StorageClass.pipe(
    Schema.withDecodingDefaultKey(Effect.succeed('standard' as const)),
  ),
  /** The class an object older than this many calendar days moves to (07 "Object Storage"). */
  lifecycle: Schema.Finite.pipe(Schema.withDecodingDefaultKey(Effect.succeed(0))),
} as const

export const storageDef = def({
  id: 'storage',
  code: 's3',
  name: 'Object Storage',
  product: 'Amazon S3',
  group: 'data',
  blurb: 'Holds uploaded files. No limit. Pay for what it stores.',
  cost: 280,
  burn: 0.01,
  latency: 40,
  accepts: ['blob-put', 'blob-get'],
  maxOut: 0,
  unlock: 'object-storage',
})
