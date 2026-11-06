/* Languages, runtime variants and frameworks: the Stack of an App Server. */

import type { RequestKind } from './kinds.ts'
import type { ResearchId } from './research.ts'

export const LANGUAGE_IDS = [
  'php',
  'ruby',
  'node',
  'python',
  'go',
  'java',
  'csharp',
  'elixir',
  'rust',
  'zig',
  'haskell',
] as const
export type LanguageId = (typeof LANGUAGE_IDS)[number]

export type LanguageDef = Readonly<{
  id: LanguageId
  name: string
  /** Velocity: how fast this language ships features. */
  velocity: number
  /** Salary relative to the base (06 "Hiring and salaries"). */
  salary: number
  /** Time to hire relative to one calendar day. */
  hireTime: number
  /** Minutes one build takes (06 "Language profiles"). */
  buildMinutes: number
  /** What a poison request takes down (06 "Language profiles"): its request, its process, or its task. */
  blast: 'request' | 'whole' | 'task'
}>

/** A crash fails this multiple of the requests a process holds, by blast radius. */
export const BLAST_FACTOR = { request: 1, whole: 1.5, task: 0.75 } as const

export const LANGUAGES: Record<LanguageId, LanguageDef> = {
  php: {
    id: 'php',
    name: 'PHP',
    velocity: 1.2,
    salary: 0.85,
    hireTime: 1,
    buildMinutes: 0.5,
    blast: 'request',
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    velocity: 1.1,
    salary: 1.1,
    hireTime: 1.5,
    buildMinutes: 1,
    blast: 'request',
  },
  node: {
    id: 'node',
    name: 'Node.js',
    velocity: 1.15,
    salary: 1,
    hireTime: 1,
    buildMinutes: 3,
    blast: 'whole',
  },
  python: {
    id: 'python',
    name: 'Python',
    velocity: 1.15,
    salary: 1.05,
    hireTime: 1,
    buildMinutes: 1,
    blast: 'request',
  },
  go: {
    id: 'go',
    name: 'Go',
    velocity: 0.95,
    salary: 1.15,
    hireTime: 1.4,
    buildMinutes: 1.5,
    blast: 'request',
  },
  java: {
    id: 'java',
    name: 'Java',
    velocity: 0.9,
    salary: 1.05,
    hireTime: 1.1,
    buildMinutes: 6,
    blast: 'request',
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    velocity: 1,
    salary: 1,
    hireTime: 1.1,
    buildMinutes: 4,
    blast: 'request',
  },
  elixir: {
    id: 'elixir',
    name: 'Elixir',
    velocity: 1,
    salary: 1.2,
    hireTime: 2.5,
    buildMinutes: 2,
    blast: 'request',
  },
  rust: {
    id: 'rust',
    name: 'Rust',
    velocity: 0.6,
    salary: 1.25,
    hireTime: 2,
    buildMinutes: 12,
    blast: 'task',
  },
  zig: {
    id: 'zig',
    name: 'Zig',
    velocity: 0.7,
    salary: 1.25,
    hireTime: 3,
    buildMinutes: 6,
    blast: 'whole',
  },
  haskell: {
    id: 'haskell',
    name: 'Haskell',
    velocity: 1.15,
    salary: 1.4,
    hireTime: 2.5,
    buildMinutes: 8,
    blast: 'request',
  },
}

export const RUNTIME_IDS = [
  'mod_php',
  'php_fpm',
  'php_worker',
  'swoole',
  'puma',
  'unicorn',
  'falcon',
  'node',
  'node_cluster',
  'bun',
  'deno',
  'gunicorn',
  'gevent',
  'uvicorn',
  'python_ft',
  'pypy',
  'go',
  'fasthttp',
  'tomcat',
  'java_virtual',
  'webflux',
  'graal',
  'kestrel',
  'native_aot',
  'beam',
  'tokio',
  'zig',
  'warp',
] as const
export type RuntimeId = (typeof RUNTIME_IDS)[number]

/**
 * How a runtime runs requests (06 "Concurrency models"). Green threads (goroutines, BEAM
 * processes) and async on a thread pool (Tokio, .NET) hold no slot while they wait.
 */
export type ConcurrencyModel = 'process' | 'threads' | 'loop' | 'green' | 'async'

/** The six axes of a Stack choice (06 "The six axes"), 1 to 5; higher is better, so 5 memory is lean. */
export const AXES = [
  'throughput',
  'tail',
  'memory',
  'velocity',
  'resilience',
  'operability',
] as const
export type Axis = (typeof AXES)[number]
export type Axes = Readonly<Record<Axis, 1 | 2 | 3 | 4 | 5>>

export type RuntimeDef = Readonly<{
  id: RuntimeId
  axes: Axes
  /** Anchors in apps/wiki/content/design/glossary.md for the behavior behind the axes. */
  glossary: ReadonlyArray<string>
  language: LanguageId
  name: string
  model: ConcurrencyModel
  /** CPU speed relative to Go = 1.0. */
  speed: number
  /** MB per worker process, or per process for threads and event loops. */
  memory: number
  /** The player sets the pool size (pm.max_children, Gunicorn workers). */
  pool: boolean
  /** Threads per process for thread pools. */
  threads: number
  /** Database connections each process holds. */
  connections: number
  /** Processes live across requests, so memory can leak. */
  persistent: boolean
  /** Seconds the runtime needs to boot after a restart. */
  startup: number
  /** Share of full speed a cold process runs at, before JIT warmup. PHP warms through OPcache instead. */
  warmFrom: number
  /** Seconds a cold process takes to reach full speed. */
  warmup: number
  /** One process runs on every core: no GIL, no one-loop-per-process. */
  parallel: boolean
  /**
   * What a CPU-heavy request stalls: every request on its event loop, one of the
   * worker threads of an async pool, or nothing (preemptive or one request per slot).
   */
  blocking: 'loop' | 'worker' | null
  /** Garbage collection above 70% heap: the pause on the slowest requests, and CPU spent collecting. */
  gc: Readonly<{ pauseMs: number; cpu: number }> | null
  /** KB each open realtime connection holds, or null when the runtime cannot hold one (a worker per connection). */
  connectionKB: number | null
  /** Framework CPU overhead this runtime keeps: worker mode and Swoole boot the app once, so 0. */
  overheadFactor?: number
  /** Multiplier on the language's feature velocity: Deno, WebFlux and fasthttp cost some. */
  velocity?: number
  /** A deploy swaps the code in place, so the runtime never restarts on a release. */
  hotReload?: boolean
  /** Multiplier on the minutes a build takes: a native image compiles the whole program ahead of time. */
  build?: number
  research: ResearchId | null
  blurb: string
}>

export const RUNTIMES: Record<RuntimeId, RuntimeDef> = {
  mod_php: {
    id: 'mod_php',
    axes: { throughput: 1, tail: 3, memory: 1, velocity: 4, resilience: 5, operability: 5 },
    glossary: ['process-per-request', 'shared-nothing'],
    language: 'php',
    name: 'Apache mod_php',
    model: 'process',
    speed: 0.15,
    memory: 60,
    pool: false,
    threads: 1,
    connections: 1,
    persistent: false,
    startup: 0,
    warmFrom: 1,
    warmup: 15,
    parallel: false,
    blocking: null,
    gc: null,
    connectionKB: null,
    hotReload: true,
    research: null,
    blurb:
      'Apache starts a process per request in flight, up to 150. Every process embeds PHP, so RAM runs out early.',
  },
  php_fpm: {
    id: 'php_fpm',
    axes: { throughput: 2, tail: 4, memory: 3, velocity: 4, resilience: 5, operability: 4 },
    glossary: ['process-per-request', 'shared-nothing'],
    language: 'php',
    name: 'PHP-FPM',
    model: 'process',
    speed: 0.15,
    memory: 40,
    pool: true,
    threads: 1,
    connections: 1,
    persistent: false,
    startup: 0,
    warmFrom: 1,
    warmup: 15,
    parallel: false,
    blocking: null,
    gc: null,
    connectionKB: null,
    hotReload: true,
    research: 'php-fpm',
    blurb:
      'A fixed pool of PHP workers behind NGINX. Each waiting request holds a worker. Shared nothing: no leaks.',
  },
  // PHP worker mode (06 "PHP"): the app boots once, and Laravel Octane still spends 1.1× per request.
  php_worker: {
    id: 'php_worker',
    axes: { throughput: 3, tail: 3, memory: 2, velocity: 5, resilience: 2, operability: 4 },
    glossary: ['process-per-request', 'tech-debt'],
    language: 'php',
    name: 'PHP worker mode',
    model: 'process',
    speed: 0.15,
    memory: 60,
    pool: true,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 0,
    parallel: false,
    blocking: null,
    gc: null,
    connectionKB: null,
    overheadFactor: 0,
    hotReload: true,
    research: 'php-worker-mode',
    blurb:
      'FrankenPHP, RoadRunner or Octane: the app boots once, so the framework’s per-request overhead goes. Loses shared nothing, so memory leaks and state bleed become possible.',
  },
  // Swoole (06 "PHP"): an event loop with coroutines.
  swoole: {
    id: 'swoole',
    axes: { throughput: 4, tail: 3, memory: 3, velocity: 4, resilience: 3, operability: 3 },
    glossary: ['event-loop', 'async-io'],
    language: 'php',
    name: 'Swoole',
    model: 'loop',
    speed: 0.15,
    memory: 60,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 0,
    parallel: false,
    blocking: 'loop',
    gc: null,
    connectionKB: 20,
    overheadFactor: 0,
    hotReload: true,
    research: 'swoole',
    blurb:
      'Coroutines on an event loop, async I/O like Node.js, and no framework overhead per request. Blocking extensions stall the loop. Holds realtime connections at 20 KB each.',
  },
  puma: {
    id: 'puma',
    axes: { throughput: 3, tail: 3, memory: 2, velocity: 4, resilience: 4, operability: 2 },
    glossary: ['gil-global-interpreter-lock', 'cold-start'],
    language: 'ruby',
    name: 'Puma',
    model: 'threads',
    speed: 0.25,
    memory: 180,
    pool: false,
    threads: 5,
    connections: 5,
    persistent: true,
    startup: 10,
    warmFrom: 0.9,
    warmup: 15,
    parallel: false,
    blocking: null,
    gc: null,
    connectionKB: 100,
    research: 'lang-ruby',
    blurb:
      'One process per core, 5 threads each. Threads overlap waits; the GVL keeps CPU on one core.',
  },
  // Unicorn (06 "Ruby"): a process per request. `lang-ruby` unlocks it with Puma; the design gives it no research row of its own.
  unicorn: {
    id: 'unicorn',
    axes: { throughput: 2, tail: 3, memory: 1, velocity: 5, resilience: 5, operability: 4 },
    glossary: ['process-per-request', 'shared-nothing'],
    language: 'ruby',
    name: 'Unicorn',
    model: 'process',
    speed: 0.25,
    memory: 180,
    pool: true,
    threads: 1,
    connections: 1,
    persistent: true,
    startup: 10,
    warmFrom: 0.9,
    warmup: 15,
    parallel: false,
    blocking: null,
    gc: null,
    connectionKB: null,
    research: 'lang-ruby',
    blurb:
      'A Rails process per slot: simple and robust, and memory-heavy. One waiting request holds a whole process, so it refuses realtime connections.',
  },
  // Falcon (06 "Ruby"): fibers, an event loop per process.
  falcon: {
    id: 'falcon',
    axes: { throughput: 4, tail: 4, memory: 2, velocity: 4, resilience: 4, operability: 1 },
    glossary: ['event-loop', 'async-io'],
    language: 'ruby',
    name: 'Falcon',
    model: 'loop',
    speed: 0.25,
    memory: 180,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 10,
    warmFrom: 0.9,
    warmup: 15,
    parallel: false,
    blocking: 'loop',
    gc: null,
    connectionKB: 100,
    research: 'falcon',
    blurb:
      'Fibers hold many idle connections per process. A gem that blocks stalls the loop. 100 KB per connection.',
  },
  node: {
    id: 'node',
    axes: { throughput: 4, tail: 2, memory: 4, velocity: 4, resilience: 2, operability: 4 },
    glossary: ['event-loop', 'blast-radius'],
    language: 'node',
    name: 'Node.js',
    model: 'loop',
    speed: 0.7,
    memory: 80,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 1,
    warmFrom: 0.8,
    warmup: 15,
    parallel: false,
    blocking: 'loop',
    gc: null,
    connectionKB: 20,
    research: 'lang-node',
    blurb:
      'One event loop. Waiting costs nothing, but it uses one core, and one slow request stalls every other.',
  },
  node_cluster: {
    id: 'node_cluster',
    axes: { throughput: 5, tail: 2, memory: 3, velocity: 4, resilience: 3, operability: 4 },
    glossary: ['event-loop', 'vertical-and-horizontal-scaling'],
    language: 'node',
    name: 'Node.js cluster',
    model: 'loop',
    speed: 0.7,
    memory: 80,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 1,
    warmFrom: 0.8,
    warmup: 15,
    parallel: false,
    blocking: 'loop',
    gc: null,
    connectionKB: 20,
    research: 'node-cluster',
    blurb: 'One event loop per core. Uses every core; memory and connections grow with the cores.',
  },
  // Bun (06 "Node.js"): faster startup and throughput, and a package that works on Node.js can break on it.
  bun: {
    id: 'bun',
    axes: { throughput: 5, tail: 2, memory: 3, velocity: 4, resilience: 2, operability: 5 },
    glossary: ['event-loop', 'cold-start'],
    language: 'node',
    name: 'Bun',
    model: 'loop',
    speed: 0.85,
    memory: 60,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 0,
    parallel: false,
    blocking: 'loop',
    gc: null,
    connectionKB: 20,
    research: 'bun',
    blurb:
      'A faster event loop with an instant start, so it autoscales and deploys better than Node.js. 60 MB and no startup. Less mature: a package that works on Node.js can break on it.',
  },
  // Deno (06 "Node.js"): the same loop, with permissions and −10% velocity.
  deno: {
    id: 'deno',
    axes: { throughput: 5, tail: 3, memory: 4, velocity: 3, resilience: 3, operability: 4 },
    glossary: ['event-loop', 'dependency-scanning'],
    language: 'node',
    name: 'Deno',
    model: 'loop',
    speed: 0.7,
    memory: 80,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 1,
    warmFrom: 0.8,
    warmup: 15,
    parallel: false,
    blocking: 'loop',
    gc: null,
    connectionKB: 20,
    velocity: 0.9,
    research: 'deno',
    blurb:
      'Permissions block most supply-chain attacks, at 10% slower feature work: fewer packages are compatible. The same event loop as Node.js.',
  },
  gunicorn: {
    id: 'gunicorn',
    axes: { throughput: 2, tail: 4, memory: 2, velocity: 5, resilience: 5, operability: 3 },
    glossary: ['process-per-request', 'gil-global-interpreter-lock'],
    language: 'python',
    name: 'Gunicorn',
    model: 'process',
    speed: 0.2,
    memory: 120,
    pool: true,
    threads: 1,
    connections: 1,
    persistent: true,
    startup: 5,
    warmFrom: 0.95,
    warmup: 15,
    parallel: false,
    blocking: null,
    gc: null,
    connectionKB: null,
    research: 'lang-python',
    blurb: 'A pool of sync workers, one request each. Like PHP-FPM with more memory per worker.',
  },
  // gevent (06 "Python"): green threads under a GIL. Monkey patching can break a library.
  gevent: {
    id: 'gevent',
    axes: { throughput: 4, tail: 4, memory: 3, velocity: 4, resilience: 3, operability: 2 },
    glossary: ['green-threads', 'gil-global-interpreter-lock'],
    language: 'python',
    name: 'Gunicorn with gevent',
    model: 'green',
    speed: 0.2,
    memory: 120,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 5,
    warmFrom: 0.95,
    warmup: 15,
    parallel: false,
    blocking: null,
    gc: null,
    connectionKB: 30,
    research: 'gevent',
    blurb:
      'Green threads hold many I/O waits per process, so a slow database stops holding a worker. Monkey patching can break a library. 30 KB per connection.',
  },
  // Uvicorn (06 "Python"): ASGI, an event loop under a GIL.
  uvicorn: {
    id: 'uvicorn',
    axes: { throughput: 3, tail: 2, memory: 4, velocity: 4, resilience: 3, operability: 3 },
    glossary: ['event-loop', 'async-io', 'gil-global-interpreter-lock'],
    language: 'python',
    name: 'Uvicorn ASGI',
    model: 'loop',
    speed: 0.2,
    memory: 120,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 5,
    warmFrom: 0.95,
    warmup: 15,
    parallel: false,
    blocking: 'loop',
    gc: null,
    connectionKB: 30,
    research: 'asgi',
    blurb:
      'Async like Node.js, with slower CPU: a blocking call stalls the loop. Holds realtime connections at the design’s 30 KB each.',
  },
  // Free-threaded CPython (06 "Python"): threads without the GIL, at 0.9× single-thread speed.
  python_ft: {
    id: 'python_ft',
    axes: { throughput: 5, tail: 5, memory: 3, velocity: 3, resilience: 4, operability: 2 },
    glossary: ['thread-pool', 'gil-global-interpreter-lock'],
    language: 'python',
    name: 'Free-threaded CPython',
    model: 'threads',
    speed: 0.18,
    memory: 120,
    pool: false,
    threads: 8,
    connections: 10,
    persistent: true,
    startup: 5,
    warmFrom: 0.95,
    warmup: 15,
    parallel: true,
    blocking: null,
    gc: null,
    connectionKB: 100,
    research: 'free-threading',
    blurb:
      'Real parallel threads on every core, 10% slower per thread, and a thread per connection is not cheap. C extensions that are not ready cost Dev Hours. 8 threads and 100 KB per connection.',
  },
  // PyPy (06 "Python"): process per request with a JIT, and no ML ecosystem.
  pypy: {
    id: 'pypy',
    axes: { throughput: 3, tail: 3, memory: 1, velocity: 5, resilience: 5, operability: 3 },
    glossary: ['process-per-request', 'jit-warmup'],
    language: 'python',
    name: 'PyPy',
    model: 'process',
    speed: 0.6,
    memory: 200,
    pool: true,
    threads: 1,
    connections: 1,
    persistent: true,
    startup: 5,
    warmFrom: 0.5,
    warmup: 15,
    parallel: false,
    blocking: null,
    gc: null,
    connectionKB: null,
    research: 'pypy',
    blurb:
      'Three times the pure-Python CPU of Gunicorn, after a JIT warmup. Poor C-extension support means no ML ecosystem bonus. 200 MB per worker.',
  },
  go: {
    id: 'go',
    axes: { throughput: 4, tail: 4, memory: 5, velocity: 3, resilience: 4, operability: 5 },
    glossary: ['green-threads', 'gc-pause'],
    language: 'go',
    name: 'Go net/http',
    model: 'green',
    speed: 1,
    memory: 30,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 15,
    parallel: true,
    blocking: null,
    gc: { pauseMs: 1, cpu: 0.25 },
    connectionKB: 10,
    research: 'lang-go',
    blurb:
      'Goroutines on every core. Waiting costs a few KB, not a worker. GC takes CPU when the heap is full.',
  },
  // fasthttp (06 "Go"): faster, non-standard API, no HTTP/2, −10% velocity.
  fasthttp: {
    id: 'fasthttp',
    axes: { throughput: 5, tail: 4, memory: 5, velocity: 2, resilience: 4, operability: 1 },
    glossary: ['green-threads', 'http2-and-http3'],
    language: 'go',
    name: 'fasthttp',
    model: 'green',
    speed: 1.25,
    memory: 30,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 0,
    parallel: true,
    blocking: null,
    gc: { pauseMs: 1, cpu: 0.25 },
    connectionKB: 10,
    velocity: 0.9,
    research: 'fasthttp',
    blurb:
      'A quarter faster than net/http at 10% slower feature work: the API is not standard, some middleware does not work, and there is no HTTP/2.',
  },
  tomcat: {
    id: 'tomcat',
    axes: { throughput: 5, tail: 3, memory: 1, velocity: 2, resilience: 4, operability: 4 },
    glossary: ['jit-warmup', 'gc-pause', 'cold-start'],
    language: 'java',
    name: 'Tomcat',
    model: 'threads',
    speed: 1.1,
    memory: 500,
    pool: false,
    threads: 200,
    connections: 10,
    persistent: true,
    startup: 20,
    warmFrom: 0.3,
    warmup: 30,
    parallel: true,
    blocking: null,
    gc: { pauseMs: 30, cpu: 0 },
    connectionKB: 1_024,
    research: 'lang-java',
    blurb:
      'One JVM, 200 threads on every core. Starts at 30% speed and warms for 30 s. Each waiting request holds a thread.',
  },
  // Java virtual threads (06 "Java"): green threads, so a wait no longer holds a platform thread.
  java_virtual: {
    id: 'java_virtual',
    axes: { throughput: 4, tail: 5, memory: 1, velocity: 2, resilience: 4, operability: 4 },
    glossary: ['green-threads', 'jit-warmup', 'gc-pause'],
    language: 'java',
    name: 'Java virtual threads',
    model: 'green',
    speed: 1.1,
    memory: 500,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 20,
    warmFrom: 0.3,
    warmup: 30,
    parallel: true,
    blocking: null,
    gc: { pauseMs: 30, cpu: 0 },
    connectionKB: 10,
    research: 'virtual-threads',
    blurb:
      'Waiting no longer holds a platform thread, so a slow database only adds latency. Native (JNI) calls still pin a carrier, and the JVM still warms for 30 s. Realtime connections cost 10 KB.',
  },
  // Spring WebFlux (06 "Java"): an event loop, at −20% velocity.
  webflux: {
    id: 'webflux',
    axes: { throughput: 5, tail: 3, memory: 5, velocity: 2, resilience: 3, operability: 3 },
    glossary: ['event-loop', 'jit-warmup', 'gc-pause'],
    language: 'java',
    name: 'Spring WebFlux',
    model: 'loop',
    speed: 1.1,
    memory: 100,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 20,
    warmFrom: 0.3,
    warmup: 30,
    parallel: false,
    blocking: 'loop',
    gc: { pauseMs: 30, cpu: 0 },
    connectionKB: 10,
    velocity: 0.8,
    research: 'webflux',
    blurb:
      'Very high concurrency on one loop per process, and 20% slower to build and debug. A blocking call stalls the loop, and the JVM still warms up. 400 MB.',
  },
  // GraalVM native image (06 "Java"): 0.80 speed, under 100 ms start, −60% memory, slower builds.
  graal: {
    id: 'graal',
    axes: { throughput: 4, tail: 5, memory: 3, velocity: 2, resilience: 4, operability: 3 },
    glossary: ['cold-start', 'jit-warmup', 'thread-pool'],
    language: 'java',
    name: 'GraalVM native image',
    model: 'threads',
    speed: 0.8,
    memory: 200,
    pool: false,
    threads: 200,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 0,
    parallel: true,
    blocking: null,
    gc: { pauseMs: 30, cpu: 0 },
    connectionKB: 1_024,
    build: 3,
    research: 'graal-native',
    blurb:
      'Starts in under 100 ms with no warmup at 60% of the JVM’s memory and 0.80× its speed, with builds three times as long. A thread per connection, like Tomcat. Great for Serverless Functions.',
  },
  kestrel: {
    id: 'kestrel',
    axes: { throughput: 5, tail: 4, memory: 3, velocity: 3, resilience: 4, operability: 3 },
    glossary: ['async-io', 'jit-warmup', 'gc-pause'],
    language: 'csharp',
    name: 'Kestrel',
    model: 'async',
    speed: 1.1,
    memory: 150,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 3,
    warmFrom: 0.6,
    warmup: 15,
    parallel: true,
    blocking: null,
    gc: { pauseMs: 15, cpu: 0 },
    connectionKB: 10,
    research: 'lang-csharp',
    blurb: '.NET async on every core. Waiting holds no thread. A shorter JIT warmup than the JVM.',
  },
  // .NET Native AOT (06 "C#"): 0.90 speed, fast startup, smaller memory.
  native_aot: {
    id: 'native_aot',
    axes: { throughput: 3, tail: 5, memory: 4, velocity: 3, resilience: 4, operability: 3 },
    glossary: ['cold-start', 'async-io'],
    language: 'csharp',
    name: 'Native AOT',
    model: 'async',
    speed: 0.9,
    memory: 100,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 0,
    parallel: true,
    blocking: null,
    gc: { pauseMs: 15, cpu: 0 },
    connectionKB: 10,
    research: 'native-aot',
    blurb:
      'No JIT, so it starts at full speed, and smaller: 100 MB. 0.90× the speed, and reflection-heavy libraries need Dev Hours.',
  },
  beam: {
    id: 'beam',
    axes: { throughput: 2, tail: 5, memory: 4, velocity: 4, resilience: 5, operability: 3 },
    glossary: ['green-threads', 'blast-radius'],
    language: 'elixir',
    name: 'BEAM',
    model: 'green',
    speed: 0.45,
    memory: 100,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 3,
    warmFrom: 1,
    warmup: 15,
    parallel: true,
    blocking: null,
    gc: null,
    connectionKB: 5,
    hotReload: true,
    research: 'lang-elixir',
    blurb:
      'Preemptive processes on every core. No request stalls another, and each process collects its own garbage. Slow CPU.',
  },
  tokio: {
    id: 'tokio',
    axes: { throughput: 5, tail: 4, memory: 5, velocity: 1, resilience: 4, operability: 4 },
    glossary: ['async-io', 'event-loop'],
    language: 'rust',
    name: 'Tokio',
    model: 'async',
    speed: 1.4,
    memory: 10,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 15,
    parallel: true,
    blocking: 'worker',
    gc: null,
    connectionKB: 5,
    research: 'lang-rust',
    blurb:
      'Async tasks on every core, no GC, little memory. A CPU-heavy task blocks one worker thread.',
  },
  zig: {
    id: 'zig',
    axes: { throughput: 5, tail: 4, memory: 4, velocity: 2, resilience: 2, operability: 2 },
    glossary: ['thread-pool', 'blast-radius'],
    language: 'zig',
    name: 'Zig threaded server',
    model: 'threads',
    speed: 1.3,
    memory: 24,
    pool: false,
    threads: 64,
    connections: 10,
    persistent: true,
    startup: 0,
    warmFrom: 1,
    warmup: 0,
    parallel: true,
    blocking: null,
    gc: null,
    connectionKB: 256,
    research: 'lang-zig',
    blurb:
      'Native code with explicit allocators and no GC. A 64-thread server uses every core, but each waiting request holds a thread. Persistent state can leak.',
  },
  warp: {
    id: 'warp',
    axes: { throughput: 4, tail: 3, memory: 3, velocity: 4, resilience: 4, operability: 1 },
    glossary: ['green-threads', 'gc-pause'],
    language: 'haskell',
    name: 'Haskell (GHC + Warp)',
    model: 'green',
    speed: 0.85,
    memory: 80,
    pool: false,
    threads: 1,
    connections: 10,
    persistent: true,
    startup: 1,
    warmFrom: 1,
    warmup: 0,
    parallel: true,
    blocking: null,
    gc: { pauseMs: 12, cpu: 0.15 },
    connectionKB: 16,
    research: 'lang-haskell',
    blurb:
      'Warp runs lightweight GHC threads across cores. Productive specialists, but slower builds and hiring. I/O waits hold no OS thread; shared-heap GC adds pauses and CPU cost.',
  },
}

/** Apache MaxRequestWorkers, and the spare processes it keeps. */
export const APACHE_MAX_WORKERS = 150
export const APACHE_SPARE = 5
/** OPcache multiplies PHP CPU speed. */
export const OPCACHE_SPEED = 2.5
/** YJIT multiplies Ruby CPU speed, for 20% more memory (06 "Ruby"). */
export const YJIT_SPEED = 1.3
export const YJIT_MEMORY = 1.2
/** jemalloc multiplies Rust CPU speed, for 5% more memory at start (06 "Rust"). */
export const JEMALLOC_SPEED = 1.05
export const JEMALLOC_MEMORY = 1.05
/** The PHP 8 JIT: 1.05 on every kind, 1.6 on CPU-heavy ones (06 "PHP"). */
export const PHP_JIT_SPEED = 1.05
export const PHP_JIT_HEAVY = 1.6
/** NIFs multiply Elixir's CPU-heavy kinds by 3, and a crash in one takes the VM (06 "Elixir"). */
export const NIF_SPEED = 3
/**
 * The kinds 06 calls CPU-heavy: the design names `upload` and `report`, and `job`
 * is the same shape of work.
 */
export const CPU_HEAVY_KINDS: ReadonlyArray<RequestKind> = ['upload', 'report', 'job']
/** Node.js worker threads: a pool each about 10 MB (06 "Event loops and blocking"). */
export const WORKER_THREADS = 4
export const WORKER_THREAD_MB = 10
/** Insight a Java App Server's profilers earn on top of what Analytics samples from it (06 "Java": +25%). */
export const JVM_INSIGHT = 0.25
/** Sim seconds between one process's recycles: a worker restarts every few hours of calendar time. */
export const RECYCLE_CYCLE = 1_800
/** Node.js hashes passwords on libuv's thread pool: UV_THREADPOOL_SIZE's default of four threads, about 2 MB of stack each. */
export const LIBUV_THREADS = 4
export const LIBUV_THREAD_MB = 2
/** Tokio's `spawn_blocking` pool in this game: eight threads, about 2 MB of stack each. */
export const SPAWN_BLOCKING_THREADS = 8
export const SPAWN_BLOCKING_THREAD_MB = 2
/** Python's ML ecosystem raises `ai` value by 20% (06 "ML ecosystem"). PyPy cannot use it. */
export const ML_AI_BONUS = 1.2
/**
 * Sim seconds one Dev Hour is worth on the Team's calendar, for a cost the design gives in
 * Dev Hours: an Elixir hot upgrade takes 4 per release (06 "Runtime behaviors").
 */
export const ELIXIR_HOT_UPGRADE_DEV_HOURS = 4
export const SIM_SECONDS_PER_DEV_HOUR = 0.3125
/** Pool sizes the player can pick from for pooled runtimes. */
export const POOL_LIMITS = { min: 1, max: 400 } as const
/** PHP-FPM ships with pm.max_children = 5. */
export const DEFAULT_FPM_WORKERS = 5

export const FRAMEWORK_IDS = [
  'none',
  'laravel',
  'rails',
  'express',
  'django',
  'symfony',
  'sinatra',
  'flask',
  'gin',
  'spring-boot',
  'aspnet',
  'phoenix',
  'axum',
  'actix',
  'fastapi',
  'fastify',
  'nextjs',
  'nestjs',
  'fiber',
  'quarkus',
] as const
export type FrameworkId = (typeof FRAMEWORK_IDS)[number]

export type FrameworkDef = Readonly<{
  id: FrameworkId
  axes: Axes
  /** Anchors in apps/wiki/content/design/glossary.md for the behavior behind the axes. */
  glossary: ReadonlyArray<string>
  name: string
  language: LanguageId | null
  /** CPU overhead per request. */
  overhead: number
  /** CPU multiplier per request kind, on top of `overhead` (Fastify's reads, Next.js's pages). */
  cpu?: Partial<Record<RequestKind, number>>
  /** The overhead applies only on an ASGI server (FastAPI). */
  asgi?: boolean
  /** Velocity multiplier. */
  velocity: number
  /** Extra MB per process. */
  memory: number
  /** The ORM makes N+1 queries until Eager loading. */
  orm: boolean
  /** Revenue multiplier per request kind. */
  value: Partial<Record<RequestKind, number>>
  /** Seconds it adds to a restart. */
  startup: number
  /**
   * CPU overhead the framework keeps when the app boots once, in worker mode or on Swoole: Laravel
   * Octane still spends 1.1× per request. A framework without it drops its overhead altogether.
   */
  workerOverhead?: number
  /** Multiplier on the team's coordination constant: a structured framework means less to agree on. */
  coordination?: number
  /** Multiplier on the tech debt each shipped Feature adds. */
  debt?: number
  /** Multiplier on the minutes one GraalVM native-image build takes (Quarkus). */
  nativeBuild?: number
  /** Share of `page` requests a CDN can answer, with the framework's incremental static regeneration. */
  cacheable?: number
  /** Multiplier on the Dev Hours of internal tools (Django's admin). */
  internalTools?: number
  /** Multiplier on the Dev Hours a Worker costs (Laravel's queues and scheduler). */
  workerHours?: number
  blurb: string
}>

export const FRAMEWORKS: Record<FrameworkId, FrameworkDef> = {
  none: {
    id: 'none',
    axes: { throughput: 5, tail: 4, memory: 5, velocity: 1, resilience: 2, operability: 5 },
    glossary: ['tech-debt'],
    name: 'No framework',
    language: null,
    overhead: 1,
    velocity: 0.8,
    memory: 0,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'Fast to run, slow to build features.',
  },
  laravel: {
    id: 'laravel',
    axes: { throughput: 2, tail: 3, memory: 4, velocity: 5, resilience: 3, operability: 3 },
    glossary: ['n1-query'],
    name: 'Laravel',
    language: 'php',
    overhead: 1.8,
    velocity: 1.45,
    memory: 10,
    orm: true,
    value: {},
    startup: 0,
    workerOverhead: 1.1,
    workerHours: 0.8,
    blurb:
      'Ships features fast, and background work costs 20% fewer Dev Hours. 1.8× CPU (1.1× in worker mode), and Eloquent makes 3 read queries where 1 would do.',
  },
  rails: {
    id: 'rails',
    axes: { throughput: 3, tail: 3, memory: 2, velocity: 5, resilience: 3, operability: 3 },
    glossary: ['n1-query'],
    name: 'Rails',
    language: 'ruby',
    overhead: 1.5,
    velocity: 1.5,
    memory: 70,
    orm: true,
    value: { page: 1.2 },
    startup: 0,
    blurb: 'Ships features fast, page views earn 20% more. 1.5× CPU and N+1 queries.',
  },
  express: {
    id: 'express',
    axes: { throughput: 4, tail: 4, memory: 4, velocity: 3, resilience: 2, operability: 4 },
    glossary: ['tech-debt'],
    name: 'Express',
    language: 'node',
    overhead: 1.1,
    velocity: 1.2,
    memory: 10,
    orm: false,
    value: {},
    startup: 0,
    debt: 1.1,
    blurb: 'Minimal and everywhere. 1.1× CPU, and middleware sprawl grows tech debt 10% faster.',
  },
  django: {
    id: 'django',
    axes: { throughput: 3, tail: 3, memory: 3, velocity: 5, resilience: 3, operability: 3 },
    glossary: ['n1-query'],
    name: 'Django',
    language: 'python',
    overhead: 1.4,
    velocity: 1.4,
    memory: 30,
    orm: true,
    value: {},
    startup: 0,
    internalTools: 0.7,
    blurb:
      'Ships features fast, and internal tools cost 30% fewer Dev Hours with the admin site. 1.4× CPU and N+1 queries.',
  },
  symfony: {
    id: 'symfony',
    axes: { throughput: 3, tail: 3, memory: 4, velocity: 4, resilience: 4, operability: 3 },
    glossary: ['tech-debt'],
    name: 'Symfony',
    language: 'php',
    overhead: 1.5,
    velocity: 1.25,
    memory: 10,
    orm: false,
    value: {},
    startup: 0,
    coordination: 0.7,
    debt: 0.7,
    blurb:
      'Strict structure: 30% less coordination and 30% slower tech debt. 1.5× CPU and no N+1 queries.',
  },
  sinatra: {
    id: 'sinatra',
    axes: { throughput: 4, tail: 4, memory: 5, velocity: 3, resilience: 3, operability: 4 },
    glossary: [],
    name: 'Sinatra',
    language: 'ruby',
    overhead: 1.1,
    velocity: 1.1,
    memory: 5,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'Light. 1.1× CPU.',
  },
  flask: {
    id: 'flask',
    axes: { throughput: 4, tail: 4, memory: 4, velocity: 3, resilience: 3, operability: 4 },
    glossary: [],
    name: 'Flask',
    language: 'python',
    overhead: 1.1,
    velocity: 1.1,
    memory: 10,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'Light. 1.1× CPU.',
  },
  gin: {
    id: 'gin',
    axes: { throughput: 4, tail: 4, memory: 4, velocity: 3, resilience: 3, operability: 4 },
    glossary: [],
    name: 'Gin',
    language: 'go',
    overhead: 1.05,
    velocity: 1.1,
    memory: 5,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'A light router. 1.05× CPU.',
  },
  'spring-boot': {
    id: 'spring-boot',
    axes: { throughput: 3, tail: 3, memory: 2, velocity: 4, resilience: 4, operability: 3 },
    glossary: ['cold-start'],
    name: 'Spring Boot',
    language: 'java',
    overhead: 1.3,
    velocity: 1.1,
    memory: 200,
    orm: false,
    value: {},
    startup: 15,
    coordination: 0.7,
    blurb:
      'Structure for large teams: 30% less coordination. 1.3× CPU, 200 MB more, and 15 s more to start.',
  },
  aspnet: {
    id: 'aspnet',
    axes: { throughput: 4, tail: 4, memory: 4, velocity: 4, resilience: 3, operability: 3 },
    glossary: [],
    name: 'ASP.NET Core',
    language: 'csharp',
    overhead: 1.05,
    velocity: 1.15,
    memory: 20,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'Fast and complete. 1.05× CPU.',
  },
  phoenix: {
    id: 'phoenix',
    axes: { throughput: 3, tail: 4, memory: 4, velocity: 5, resilience: 4, operability: 3 },
    glossary: [],
    name: 'Phoenix',
    language: 'elixir',
    overhead: 1.1,
    velocity: 1.3,
    memory: 20,
    orm: false,
    value: { page: 1.3 },
    startup: 0,
    blurb: 'LiveView pages earn 30% more. 1.1× CPU.',
  },
  axum: {
    id: 'axum',
    axes: { throughput: 4, tail: 4, memory: 5, velocity: 3, resilience: 4, operability: 4 },
    glossary: [],
    name: 'Axum',
    language: 'rust',
    overhead: 1,
    velocity: 1.15,
    memory: 2,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'Built on Tokio and Tower. No extra CPU.',
  },
  actix: {
    id: 'actix',
    axes: { throughput: 5, tail: 4, memory: 5, velocity: 2, resilience: 3, operability: 4 },
    glossary: [],
    name: 'Actix Web',
    language: 'rust',
    overhead: 0.95,
    velocity: 1.1,
    memory: 2,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'Among the fastest in benchmarks. 0.95× CPU.',
  },
  // FastAPI (06 "Frameworks"): Pydantic validation, the ML ecosystem's glue, at 1.15× CPU on ASGI.
  fastapi: {
    id: 'fastapi',
    axes: { throughput: 3, tail: 2, memory: 4, velocity: 5, resilience: 3, operability: 3 },
    glossary: ['model-inference'],
    name: 'FastAPI',
    language: 'python',
    overhead: 1.15,
    asgi: true,
    velocity: 1.3,
    memory: 10,
    orm: false,
    value: { ai: 1.15 },
    startup: 0,
    blurb:
      'Validation with Pydantic, and the best ecosystem for model glue: `ai` requests earn 15% more. 1.15× CPU, and only on an ASGI server. 10 MB.',
  },
  // Fastify (06 "Frameworks"): schema-based serialization, so reads cost 20% less CPU.
  fastify: {
    id: 'fastify',
    axes: { throughput: 4, tail: 4, memory: 4, velocity: 4, resilience: 2, operability: 3 },
    glossary: [],
    name: 'Fastify',
    language: 'node',
    overhead: 1,
    cpu: { read: 0.8 },
    velocity: 1.15,
    memory: 5,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'Schema-based serialization: reads cost 20% less CPU. No overhead of its own. 5 MB.',
  },
  // Next.js (06 "Frameworks"): 1.6× CPU on pages, for 1.5× their value. A CDN can answer part of the pages.
  nextjs: {
    id: 'nextjs',
    axes: { throughput: 3, tail: 3, memory: 4, velocity: 4, resilience: 2, operability: 4 },
    glossary: ['cdn-content-delivery-network'],
    name: 'Next.js',
    language: 'node',
    overhead: 1,
    cpu: { page: 1.6 },
    velocity: 1.35,
    memory: 30,
    orm: false,
    value: { page: 1.5 },
    startup: 0,
    cacheable: 0.4,
    blurb:
      'Server rendering and incremental static regeneration: pages earn 50% more, at 1.6× their CPU, and a CDN can answer 40% of them. 30 MB per process.',
  },
  // NestJS (06 "Frameworks"): structure for large teams.
  nestjs: {
    id: 'nestjs',
    axes: { throughput: 3, tail: 3, memory: 3, velocity: 5, resilience: 2, operability: 4 },
    glossary: ['conways-law'],
    name: 'NestJS',
    language: 'node',
    overhead: 1.3,
    velocity: 1.3,
    memory: 20,
    orm: false,
    value: {},
    startup: 0,
    coordination: 0.7,
    blurb: 'Structure for large teams: 30% less coordination. 1.3× CPU and 20 MB per process.',
  },
  // Fiber (06 "Frameworks"): Express-style API on fasthttp, so it inherits fasthttp's limits.
  fiber: {
    id: 'fiber',
    axes: { throughput: 5, tail: 4, memory: 4, velocity: 4, resilience: 3, operability: 3 },
    glossary: ['http2-and-http3'],
    name: 'Fiber',
    language: 'go',
    overhead: 1,
    velocity: 1.15,
    memory: 5,
    orm: false,
    value: {},
    startup: 0,
    blurb: 'An Express-style API on fasthttp: no CPU overhead, and no HTTP/2. 5 MB per process.',
  },
  // Quarkus (06 "Frameworks"): built for native images, so a GraalVM build takes half the time.
  quarkus: {
    id: 'quarkus',
    axes: { throughput: 4, tail: 4, memory: 2, velocity: 4, resilience: 3, operability: 3 },
    glossary: ['cold-start'],
    name: 'Quarkus',
    language: 'java',
    overhead: 1.1,
    velocity: 1.05,
    memory: 100,
    orm: false,
    value: {},
    startup: 0,
    nativeBuild: 0.5,
    blurb:
      'Built for native images: a GraalVM build takes half the time. 1.1× CPU and 100 MB per process.',
  },
}

/**
 * Java collectors (06 "Runtime behaviors"): the pause, throughput and memory of each.
 * G1 is the default; ZGC needs its research.
 */
export const COLLECTORS = {
  g1: { label: 'G1', pauseMs: 30, speed: 1, memory: 1 },
  parallel: { label: 'Parallel', pauseMs: 150, speed: 1.05, memory: 0.95 },
  zgc: { label: 'ZGC', pauseMs: 1, speed: 0.9, memory: 1.15 },
} as const
/** GOGC settings (10 `gogc-tuning`): memory per process, and how much more often the GC runs. */
export const GOGC = [
  { gogc: 50, memory: 0.7, cpu: 2 },
  { gogc: 100, memory: 1, cpu: 1 },
  { gogc: 200, memory: 1.5, cpu: 0.5 },
] as const

/** N+1 queries multiply ORM reads. */
export const ORM_READS = 3

/**
 * PHP-FPM process managers (06): spare workers kept, the share of requests that wait for a fork,
 * and how long they wait. Dynamic's spares absorb most of a fork, so its requests wait less.
 */
export const PM_MODES = {
  static: { label: 'Static', spares: null, spawnShare: 0, spawnMs: 0 },
  dynamic: { label: 'Dynamic', spares: 2, spawnShare: 0.02, spawnMs: 20 },
  ondemand: { label: 'On demand', spares: 0, spawnShare: 0.1, spawnMs: 50 },
} as const

/**
 * The BEAM's supervisors restart one process per this many requests (06 "Fault isolation").
 * The request is retried inside the VM, so the user sees no failure.
 */
export const BEAM_CRASHES_PER_REQUESTS = 100
/** The Let It Crash milestone: supervised crashes one service survives (14 "Achievements"). */
export const LET_IT_CRASH = 1_000
