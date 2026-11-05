---
title: 6. Runtimes and frameworks
summary: Languages, runtime variants, and frameworks as tradeoffs, not tiers.
section: design
order: 6
---

This document is the main application of [pillar 2: tradeoffs, not tiers](/design/01-vision#pillar-2-tradeoffs-not-tiers).
Every App Server and Worker runs a **Stack**: a language, a runtime variant, and a framework. A
Stack is not a level. It is a cost profile that suits some designs and fails in others.

The point of this system: "PHP is slow" is true and incomplete. PHP-FPM is slow per request, it
cannot leak memory between requests, and it deploys by copying files. Node.js is fast on I/O and
stalls the whole process on one CPU-heavy request. The game models why, so the player learns where
each choice wins.

## The six axes

Every Stack choice moves along these axes. The Tradeoff card shows all six as a radar chart, plus
the simulated effect on the player's own design ([Interface](/design/15-ui-ux#tradeoff-cards)).

| Axis        | Measures                                      | Driven by                                                             |
| ----------- | --------------------------------------------- | --------------------------------------------------------------------- |
| Throughput  | Requests per second per dollar of instance    | CPU speed, concurrency model, memory per unit of concurrency          |
| Tail        | p99 latency under load                        | GC pauses, event-loop blocking, warmup, scheduling                    |
| Memory      | RAM per process and per in-flight request     | Runtime base, framework, concurrency model                            |
| Velocity    | Dev Hours per feature                         | Language, framework, ecosystem ([Team](/design/08-team-and-velocity)) |
| Resilience  | How much a crash, leak, or bad request breaks | Blast radius, isolation, memory leaks                                 |
| Operability | Deploy time, build time, startup, hiring      | Toolchain, runtime startup, talent pool                               |

## The capacity model

An App Server's capacity is the minimum of four limits. The tightest one is the bottleneck, and
the card always names it ([Observability](/design/12-observability#the-visibility-ladder)).

```text
capacity = min(cpu_limit, concurrency_limit, memory_limit, network_limit)
```

| Limit               | Formula                                    | What it means                                                                                                          |
| ------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `cpu_limit`         | `usable_cores / cpu_time_per_request`      | How much CPU work the box can do.                                                                                      |
| `concurrency_limit` | `slots / residence_time`                   | How many requests can be in flight, divided by how long each one stays ([Little's law](/design/glossary#littles-law)). |
| `memory_limit`      | RAM used against the RAM the instance has. | Past it the box swaps and CPU efficiency falls; a thread-per-request runtime also cannot start another thread.         |
| `network_limit`     | `instance_bandwidth / bytes_per_request`   | Matters for `media` and `upload`.                                                                                      |

Where:

```text
cpu_time_per_request = Σ_kind share(kind) × ref_cpu_ms(kind) × framework_overhead / speed
residence_time       = cpu_time_per_request + Σ synchronous_downstream_latency
usable_cores         = min(vCPU, processes × cores_per_process)
```

The concurrency model decides what `slots` and `cores_per_process` are. That is where runtimes
differ most.

## Concurrency models

| Model                  | Examples                                              | Slots                                                         | Cores per process                                                          | Waiting on I/O holds…  |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------- |
| Process per request    | PHP-FPM, Gunicorn sync, Unicorn                       | Worker processes: the pool size the player sets               | 1                                                                          | A whole worker process |
| Thread pool            | Tomcat with Spring MVC, Puma                          | Threads: processes × threads per process                      | All cores, or 1 with a [GIL](/design/glossary#gil-global-interpreter-lock) | A whole thread         |
| Event loop             | Node.js, Python asyncio, Swoole, Spring WebFlux       | Effectively unlimited (memory per in-flight request is small) | 1 per process                                                              | A few KB of memory     |
| Green threads (M\:N)   | Go goroutines, Java virtual threads, Erlang processes | Effectively unlimited                                         | All cores                                                                  | A few KB of memory     |
| Async on a thread pool | Rust Tokio, .NET async                                | Effectively unlimited                                         | All cores                                                                  | A few KB of memory     |

The key consequence: **with process-per-request and thread-pool runtimes, a slow database lowers
app server capacity**, because each waiting request holds a worker. With event loops and green
threads, a slow database only adds latency. Capacity is then limited by CPU.

Example. A 4-vCPU PHP-FPM box with OPcache and 20 workers serves `read` at 4 ms of CPU
(1.5 ref ms ÷ 0.375) and waits 16 ms on the database.
Residence is 20 ms, so the concurrency limit is 20 / 0.020 = 1,000 rps. If the database slows to
96 ms per query, residence is 100 ms and the limit falls to 200 rps, while the CPU sits at 20%.
The player sees a full box with idle CPU. The fixes are more workers (more RAM), a faster database,
or a runtime that does not hold a worker while it waits.

### Event loops and blocking

An event loop runs one piece of JavaScript at a time per process. A CPU-heavy request blocks every
other request on that process until it finishes. The game models this as a tail event:

```text
loop_block_ms = Σ_kind share(kind) × cpu_ms(kind)²  /  Σ_kind share(kind) × cpu_ms(kind)
added_p99     = loop_block_ms × min(1, ρ × 2)
```

The squared term means rare heavy requests dominate. With 2% `login` at 80 ms of bcrypt and 98%
`read` at 1.5 ms, the p99 of every `read` on that process rises by tens of milliseconds. This is the
real "don't block the event loop" rule ([Reality check](/design/reality-check#runtimes)).

The fixes, each with its own cost:

| Fix               | Effect                                                                                                                    | Cost                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Async crypto      | Research "libuv thread pool" takes the `login` hash off the event loop, so logins stop stalling the requests behind them. | Dev Hours for the Research. No RAM cost. A modelled pool of 4 threads, with its queue and its RAM cost, is Not built yet.                                                                   |
| Worker threads    | Moves CPU-heavy kinds to a pool of worker threads.                                                                        | Each worker thread is a separate V8 isolate, about 10 MB. Dev Hours to adopt. Built: `worker-threads` adds a pool of 4 threads, 40 MB, and takes `upload`, `report` and `job` off the loop. |
| Separate service  | Routes `login` or `upload` to a separate App Server group.                                                                | Another service: more Nodes, a load balancer route, a team boundary.                                                                                                                        |
| Auth Provider     | Takes `login` off your servers.                                                                                           | Per-user price ([Components](/design/05-components#auth-provider)).                                                                                                                         |
| Different runtime | Go, Java, and Elixir do not stall other requests on one heavy request.                                                    | A migration ([Team](/design/08-team-and-velocity#migrations)).                                                                                                                              |

### Preemptive scheduling on the BEAM

Erlang and Elixir processes are preempted after a budget of reductions. A heavy request cannot
starve others, so the p99 stays flat under mixed load. The cost: raw CPU speed is lower than the JVM
or Go. Long-running native functions (NIFs) are the exception: they are not preempted, and a crash
in one takes down the whole VM.

## Language profiles

Speeds are stylized and relative to Go = 1.0. They follow the order seen in public benchmarks such
as TechEmpower and the Computer Language Benchmarks Game, compressed so that no language is useless
([Reality check](/design/reality-check#runtimes)).

| Language | Default variant     | Speed     | Model (default)      | RAM per process            | Velocity | Build time | Startup       | Blast radius |
| -------- | ------------------- | --------- | -------------------- | -------------------------- | -------- | ---------- | ------------- | ------------ |
| PHP      | Apache `mod_php`    | 0.15      | Process per request  | 60 MB per worker           | 1.20     | 0.5 min    | Instant       | Request      |
| Ruby     | Puma                | 0.25      | Thread pool with GVL | 180 MB (250 MB with Rails) | 1.10     | 1 min      | 10 s          | Request      |
| Python   | Gunicorn sync       | 0.20      | Process per request  | 120 MB per worker          | 1.15     | 1 min      | 5 s           | Request      |
| Node.js  | Single process      | 0.70      | Event loop           | 80 MB                      | 1.15     | 3 min      | 1 s           | Process      |
| Java     | Tomcat, 200 threads | 1.10 warm | Thread pool          | 500 MB                     | 0.90     | 6 min      | 20 s + warmup | Request      |
| C#       | Kestrel             | 1.10      | Async thread pool    | 150 MB                     | 1.00     | 4 min      | 3 s + warmup  | Request      |
| Go       | `net/http`          | 1.00      | Goroutines           | 30 MB                      | 0.95     | 1.5 min    | Instant       | Request      |
| Elixir   | Phoenix on the BEAM | 0.45      | BEAM processes       | 100 MB                     | 1.00     | 2 min      | 3 s           | Request      |
| Rust     | Tokio               | 1.40      | Async thread pool    | 10 MB                      | 0.60     | 12 min     | Instant       | Task         |

Blast radius is what a poison request (a request that triggers a crash) takes down. "Request" means
only that request fails. "Process" means every in-flight request on that process fails and the
process restarts. Node.js exits on an unhandled exception or rejection by default. This column is
display only: it describes the resilience axis, and in the build every instance failure takes the
whole Node down whatever the runtime.

### Zig and Haskell profiles

Series A research also unlocks two configured servers. Their numeric values are game-balance
choices, not measured language rankings. [Research sources and model limits](https://github.com/elianiva/quorum/blob/main/docs/research/zig-haskell.md)
describe the assumptions.

- **Zig threaded server:** native code, explicit allocators, no GC, and 64 OS-thread slots across
  cores. Waiting requests occupy slots. Manual lifetimes and persistent state can still cause leaks.
  The profile has 24 MB base memory, 1.3 CPU speed, 0.7 feature velocity, and specialist hiring.
- **Haskell (GHC + Warp):** lightweight threads with multicore GHC enabled. Socket waits release OS
  threads, but the shared heap has GC pauses. The profile has 80 MB base memory, 0.85 CPU speed,
  and 1.15 feature velocity, paid for through slower builds, specialist hiring, and a 1.4 salary
  factor. WAI is the application interface, not an extra framework unlock.

### Hiring and salaries

| Language                  | Hiring pool | Time to hire | Salary |
| ------------------------- | ----------- | ------------ | ------ |
| JavaScript and TypeScript | Very large  | 1.0×         | 1.00×  |
| Python                    | Very large  | 1.0×         | 1.05×  |
| Java                      | Large       | 1.1×         | 1.05×  |
| C#                        | Large       | 1.1×         | 1.00×  |
| PHP                       | Large       | 1.0×         | 0.85×  |
| Go                        | Medium      | 1.4×         | 1.15×  |
| Ruby                      | Medium      | 1.5×         | 1.10×  |
| Rust                      | Small       | 2.0×         | 1.25×  |
| Zig                       | Small       | 3.0×         | 1.25×  |
| Haskell                   | Small       | 2.5×         | 1.40×  |
| Elixir                    | Small       | 2.5×         | 1.20×  |

Pool sizes follow the order of the Stack Overflow Developer Survey usage results. A company that
writes everything in Elixir hires slowly. A company that writes everything in PHP hires quickly and
cheaply ([Team](/design/08-team-and-velocity#hiring)).

## Runtime behaviors

These behaviors are what make runtimes feel different during play.

| Behavior           | Who has it                                                                           | Game effect                                                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JIT warmup         | Java (strong), C# (medium), Node.js (light), PHP with OPcache (cache fill)           | A new or restarted process runs at a fraction of its speed and ramps up. Java starts at 30% and reaches 100% after 30 s. Hurts autoscaling and deploys under load.                                                                                                                     |
| Interpreter warmup | Puma (90%), Gunicorn (95%)                                                           | A restarted process runs at a fraction of its speed and reaches full speed after 15 s. Hurts autoscaling and deploys under load.                                                                                                                                                       |
| GC pauses          | Java (Tomcat), C# (Kestrel), Go, Haskell (Warp)                                      | Above 70% heap use, some requests pause. Adds to the p99, not the p50. Java G1: 30 ms. Parallel GC: 150 ms with +5% throughput. ZGC: 1 ms with +10% CPU. Go: under 1 ms, and up to 25% of CPU goes to GC under heap pressure. Node.js, Ruby, and Python have no GC pause in the build. |
| No GC              | Rust, Zig, PHP (request-scoped memory)                                               | No pause tail. PHP frees all memory at the end of every request.                                                                                                                                                                                                                       |
| Per-process GC     | Elixir                                                                               | No global pause. Each BEAM process collects alone.                                                                                                                                                                                                                                     |
| Memory leaks       | Persistent runtimes: Node.js, Ruby, Python, Java, C#, Go, Elixir, Rust, Zig, Haskell | RSS grows with uptime. When the process reaches its RAM, it is killed (`oom`) and restarts cold. Fixes: restart the server, or Dev Hours to fix the leak. Periodic restarts (`pm.max_requests`, Puma worker killer) are Not built yet.                                                 |
| Shared nothing     | PHP-FPM classic                                                                      | Each request starts clean. No leaks, no state bleeding between requests. This is PHP's real strength.                                                                                                                                                                                  |
| Fault isolation    | Elixir (supervisors), PHP (per request)                                              | A crash affects one request. Elixir restarts the crashed process in microseconds.                                                                                                                                                                                                      |
| Hot code reload    | Elixir (release upgrades), PHP (file swap)                                           | Deploys with zero restarts. A deploy that ships Features restarts every App Server cold except a PHP or Elixir one, which reloads the code in place. Elixir hot upgrades cost 4 Dev Hours per release (proposed: the design gives the cost, not its length).                           |
| Cold start         | Java (worst), then Ruby, Python, C#, Node.js, then Go and Rust (best)                | Matters for Serverless Functions and autoscaling ([Components](/design/05-components#serverless-function)).                                                                                                                                                                            |

## Variants by language

A variant is a runtime choice inside a language. Research unlocks it, and adopting it on a service
costs Dev Hours ([Team](/design/08-team-and-velocity#migrations)). No variant is strictly better than its
siblings.

### PHP

| Variant                                              | Model                      | Speed                                       | Profile                                                                                                                                                                                                                              |
| ---------------------------------------------------- | -------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Apache `mod_php` (start)                             | Process per request        | 0.15                                        | Every Apache process embeds PHP, including the processes that serve static files, so memory runs out early. Simple to deploy.                                                                                                        |
| PHP-FPM with NGINX                                   | Process pool               | 0.15                                        | NGINX serves static files. PHP workers handle only PHP. Pool modes below.                                                                                                                                                            |
| + OPcache                                            | —                          | ×2.5                                        | Skips compiling scripts on every request. A restarted box fills the cache again. With `validate_timestamps=0` a deploy would have to reset the cache, or the old code would keep running: that stale-code incident is Not built yet. |
| + JIT (PHP 8)                                        | —                          | ×1.05 on web kinds, ×1.6 on CPU-heavy kinds | Helps `upload` and `report`, barely helps `page` and `read`. A deliberate lesson: the JIT is not a general speedup for web work. Built: research `php-jit`, over every PHP runtime.                                                  |
| Worker mode (FrankenPHP, RoadRunner, Laravel Octane) | Persistent workers         | ×1.0, framework overhead removed            | The app boots once, not on every request. Framework-heavy apps gain 2× to 4×. Loses shared nothing: memory leaks and state bleed between requests become possible. Built as `PHP worker mode`; its 1.1× overhead row is not modeled. |
| Swoole                                               | Event loop with coroutines | ×1.0, overhead removed                      | Async I/O like Node.js. Can hold `rt` connections. Blocking extensions stall the loop. Built; 60 MB and 20 KB per connection are proposed.                                                                                           |

PHP-FPM pool modes (a Tradeoff card):

| `pm` mode  | Behavior                                                   | Cost                                                    |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `static`   | A fixed number of workers, always running.                 | Uses its full RAM all the time. Fastest.                |
| `dynamic`  | Keeps the busy workers plus 2 spares, up to the pool size. | 2% of requests wait 20 ms for a fork during a burst.    |
| `ondemand` | Keeps the busy workers, up to the pool size.               | 10% of requests wait 50 ms for a fork. Lowest idle RAM. |

`pm.max_children` is the pool size. Setting it above what RAM allows causes swapping, then `oom`.
Setting it too low leaves CPU idle while requests queue. The right value is RAM divided by the memory
of one worker, which is the real sizing rule ([Reality check](/design/reality-check#runtimes)).

### Ruby

| Variant      | Model                             | Speed | Profile                                                                                                                                                                 |
| ------------ | --------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unicorn      | Process per request               | 0.25  | Simple and robust. Memory-heavy: one Rails process per slot. Built; `lang-ruby` unlocks it with Puma, and it refuses `rt` connections.                                  |
| Puma (start) | Processes × 5 threads, with a GVL | 0.25  | Threads overlap I/O waits. CPU work runs on one core per process, so Puma runs one process per core.                                                                    |
| + YJIT       | —                                 | ×1.3  | Faster CPU work, +20% memory. Built as research `yjit`, over every Ruby runtime.                                                                                        |
| Falcon       | Fibers (event loop)               | 0.25  | Many idle connections per process. Gems that block stall the loop. Built; 100 KB per connection is proposed (the design gives Ruby's figure without naming the server). |

### Python

| Variant               | Model                           | Speed | Profile                                                                                                                                                                                                            |
| --------------------- | ------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gunicorn sync (start) | Process per request             | 0.20  | One request per worker. Like PHP-FPM, with more memory per worker.                                                                                                                                                 |
| Gunicorn with gevent  | Green threads, with a GIL       | 0.20  | Many I/O waits per process. Monkey patching breaks some libraries (a small chance of a "Library incompatibility" incident on adoption). Built; that incident is not modeled, and 30 KB per connection is proposed. |
| Uvicorn ASGI          | Event loop, with a GIL          | 0.20  | Async like Node.js, but slower CPU. Blocking calls stall the loop. Built as `Uvicorn ASGI`, with 30 KB per connection.                                                                                             |
| Free-threaded CPython | Threads without a GIL           | ×0.9  | Real parallel threads on all cores. Single-thread speed is lower, and some C extensions are not ready, which costs Dev Hours. Built; 8 threads and 100 KB per connection are proposed.                             |
| PyPy                  | Process per request, with a JIT | ×3    | Much faster pure-Python CPU work. Poor support for C extensions such as NumPy and PyTorch, so it cannot use the ML ecosystem bonus. Built; 200 MB per worker is proposed.                                          |

**ML ecosystem.** A Python service can run small models in process (embeddings, reranking) without a
GPU Node, which raises `ai` value by 20% when a Vector Index is in the path. Every other language
must call a GPU Node or an LLM API. Built: every Python App Server except PyPy earns +20% on `ai`
when it links into a live Vector Index, and FastAPI adds 15% on top. The condition is part of the
build: a Python server that answers `ai` with no index to retrieve from earns nothing extra.

### Node.js

| Variant                | Model                       | Speed | Profile                                                                                                                                                                        |
| ---------------------- | --------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Single process (start) | Event loop                  | 0.70  | Uses one core. Resizing the instance adds no CPU throughput. A deliberate lesson.                                                                                              |
| Cluster mode (PM2)     | One event loop per core     | 0.70  | Uses all cores. Memory × processes. In-process caches are not shared between processes.                                                                                        |
| + Worker threads       | —                           | —     | Offloads CPU-heavy kinds. See [event loops and blocking](#event-loops-and-blocking). Built as research `worker-threads`.                                                       |
| Bun                    | Event loop                  | 0.85  | Faster startup and throughput in benchmarks. Less mature: a small chance per calendar month of a "Runtime compatibility" incident. Built; its incident and 60 MB are proposed. |
| Deno                   | Event loop with permissions | 0.70  | Permissions block most supply-chain attacks ([Incidents](/design/11-incidents#catalog)). Fewer compatible packages: −10% velocity. Built.                                      |

### Java

| Variant                    | Model                | Speed     | Profile                                                                                                                                                                    |
| -------------------------- | -------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tomcat thread pool (start) | 200 platform threads | 1.10 warm | Each thread holds about 1 MB of stack. Above 200 waiting requests, new requests queue even with idle CPU.                                                                  |
| Virtual threads            | Green threads        | 1.10 warm | Waiting no longer holds a platform thread. Since JDK 24, `synchronized` no longer pins. Native (JNI) calls still pin the carrier thread. Built; 10 KB per `rt` connection. |
| Spring WebFlux             | Event loop           | 1.10 warm | Very high concurrency. Hard to write and debug: −20% velocity. Built; 100 MB is proposed.                                                                                  |
| GraalVM native image       | Thread pool          | 0.80      | Starts in under 100 ms with no warmup and −60% memory. Lower peak speed. Slower builds. Great for Serverless Functions. Built; slower builds are not modeled.              |

| GC option  | p99 pause | Throughput | Memory |
| ---------- | --------- | ---------- | ------ |
| G1 (start) | 30 ms     | 1.00×      | 1.00×  |
| Parallel   | 150 ms    | 1.05×      | 0.95×  |
| ZGC        | 1 ms      | 0.90×      | 1.15×  |

**Mature tooling.** JVM services earn +25% Insight from sampled traffic, because profilers such as
Java Flight Recorder expose so much ([Observability](/design/12-observability#earning-insight)). Not
built yet: Insight comes only from samples and failures, with no bonus for the JVM.

### C#

| Variant         | Model             | Speed | Profile                                                                                             |
| --------------- | ----------------- | ----- | --------------------------------------------------------------------------------------------------- |
| Kestrel (start) | Async thread pool | 1.10  | Fast, async by default. Tiered JIT warmup is shorter than the JVM's.                                |
| Native AOT      | Async thread pool | 0.90  | Fast startup, smaller memory. Reflection-heavy libraries need Dev Hours. Built; 100 MB is proposed. |

### Go

| Variant            | Model      | Speed | Profile                                                                                                                                                                  |
| ------------------ | ---------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `net/http` (start) | Goroutines | 1.00  | A goroutine starts with a 2 KB stack. Static binary, instant startup. `net/http` recovers panics in handlers, but a panic in a background goroutine crashes the process. |
| fasthttp           | Goroutines | 1.25  | Faster, with a non-standard API. No HTTP/2. Some middleware does not work: −10% velocity. Built.                                                                         |

| `GOGC` setting     | Memory | GC CPU | p99 effect                           |
| ------------------ | ------ | ------ | ------------------------------------ |
| 50                 | 0.7×   | High   | Small                                |
| 100 (start)        | 1.0×   | Medium | Small                                |
| 200 + `GOMEMLIMIT` | 1.5×   | Low    | Rare large pause when near the limit |

### Elixir

| Variant                     | Model          | Speed                    | Profile                                                                                                                                                                                                                                 |
| --------------------------- | -------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phoenix on the BEAM (start) | BEAM processes | 0.45 (0.55 with the JIT) | Preemptive scheduling, per-process GC, supervisors. Very flat p99. Best for `rt`.                                                                                                                                                       |
| + Distributed Erlang        | —              | —                        | Nodes form a cluster with built-in presence and pub/sub. Replaces a separate Realtime Hub backbone. Network partitions cause split-brain incidents. Built: a BEAM Realtime Hub clusters without the option; split brain is not modeled. |
| + NIFs                      | —              | ×3 on CPU-heavy kinds    | Native code for heavy work. Not preempted, and a crash takes down the whole VM: blast radius becomes "Process". Built: the VM stops absorbing the supervisor's crashes.                                                                 |

### Rust

| Variant                 | Model             | Speed | Profile                                                                                                                                                              |
| ----------------------- | ----------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tokio with Axum (start) | Async thread pool | 1.40  | Lowest memory and no GC. Cooperative scheduling: a CPU-heavy task blocks one worker thread, a milder form of the Node.js problem. A task panic fails that task only. |
| + `spawn_blocking`      | —                 | —     | Moves CPU-heavy kinds to a blocking pool. Removes the tail. Built; the pool's own memory is not modeled.                                                             |
| Allocator: jemalloc     | —                 | ×1.05 | Less fragmentation in long-running services. +5% memory at start. Built.                                                                                             |

Rust's cost is not on the server. It is in Dev Hours: velocity 0.60 and 12-minute builds, which lower
deploy frequency ([Team](/design/08-team-and-velocity#deploy-frequency)).

## Realtime connections

`rt` holds a connection open per online user. Memory per connection decides how many fit on a box.

| Runtime and variant             | Memory per connection | Notes                                                           |
| ------------------------------- | --------------------- | --------------------------------------------------------------- |
| PHP-FPM, Gunicorn sync, Unicorn | Not supported         | A worker per connection would hold the whole pool.              |
| Java with platform threads      | ~1 MB                 | A thread per connection.                                        |
| Ruby (Action Cable on Puma)     | ~100 KB               |                                                                 |
| Python ASGI                     | ~30 KB                | Built: Uvicorn ASGI holds them, at the design's figure.         |
| Node.js                         | ~20 KB                |                                                                 |
| Go                              | ~10 KB                | Goroutine plus buffers.                                         |
| Java with virtual threads       | ~10 KB                | Built.                                                          |
| Rust                            | ~5 KB                 |                                                                 |
| Elixir                          | ~5 KB                 | Phoenix reached 2 million connections on one large box in 2015. |

A runtime that cannot hold connections needs a Realtime Hub on a different runtime. This is a real
reason that teams add a second language. In the build, the Realtime Hub
([Components](/design/05-components#realtime-hub)) holds them: its box gives 8 GB to connections
divided by the row above, so a BEAM Hub holds about 1.6 million connections, a Go one 800,000, and
a Java one 8,000. An App Server holds the same `rt` connections itself while its runtime can, and
refuses them when it cannot: PHP-FPM and Gunicorn sync never hold one, on an App Server or on a
Hub.

## Frameworks

A framework belongs to one language. It multiplies three terms: CPU overhead per request, velocity,
and a special effect. The default for each language is "No framework".

| Framework    | Language | CPU overhead      | Velocity | Special effect                                                                                                                                                                                                                                    |
| ------------ | -------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No framework | Any      | 1.0×              | 0.8×     | Fast and slow to build features. Tech debt grows faster as the codebase grows.                                                                                                                                                                    |
| Laravel      | PHP      | 1.8×              | 1.45×    | Eloquent ORM: [N+1 queries](/design/glossary#n1-query) multiply `q-read` by 3 until research "Eager loading". Queues and scheduler built in: Workers cost −20% Dev Hours. Not built yet: the worker-mode overhead (1.1×) and the Worker discount. |
| Symfony      | PHP      | 1.5× in FPM       | 1.25×    | Strict structure: −30% tech debt growth and a smaller coordination penalty.                                                                                                                                                                       |
| Rails        | Ruby     | 1.5×              | 1.50×    | Active Record N+1 (×3 `q-read` until "Eager loading"). Convention over configuration: new hires are productive 2× sooner. Hotwire: `page` value +20%.                                                                                             |
| Sinatra      | Ruby     | 1.1×              | 1.10×    | Light.                                                                                                                                                                                                                                            |
| Django       | Python   | 1.4×              | 1.40×    | ORM N+1. The admin site: internal tools cost −30% Dev Hours. Not built yet.                                                                                                                                                                       |
| Flask        | Python   | 1.1×              | 1.10×    | Light.                                                                                                                                                                                                                                            |
| FastAPI      | Python   | 1.15× (ASGI only) | 1.30×    | Validation with Pydantic. `ai` value +15% (best ecosystem for model glue). Built: the overhead applies only on an ASGI server, and 10 MB is proposed.                                                                                             |
| Express      | Node.js  | 1.1×              | 1.20×    | Minimal and everywhere. Middleware sprawl: +10% tech debt growth. Built, but the tech-debt growth is not modeled.                                                                                                                                 |
| Fastify      | Node.js  | 1.0×              | 1.15×    | Schema-based serialization: `read` CPU −20%. Built; 5 MB is proposed.                                                                                                                                                                             |
| NestJS       | Node.js  | 1.3×              | 1.30×    | Structure for large teams: the coordination penalty is 30% smaller ([Team](/design/08-team-and-velocity#coordination)). Built, but the coordination penalty is not modeled.                                                                       |
| Next.js      | Node.js  | 1.6× on `page`    | 1.35×    | Server rendering and incremental static regeneration: `page` value ×1.5, and 40% of `page` becomes CDN-cacheable. Built, except the CDN hit; 30 MB is proposed.                                                                                   |
| Spring Boot  | Java     | 1.3×, +200 MB     | 1.10×    | Structure for large teams (coordination penalty −30%). Slow startup (+15 s). Built, but only Symfony lowers the coordination penalty.                                                                                                             |
| Quarkus      | Java     | 1.1×              | 1.05×    | Built for native images: halves GraalVM build time. Built, except the build time; 100 MB is proposed.                                                                                                                                             |
| ASP.NET Core | C#       | 1.05×             | 1.15×    | Fast and complete.                                                                                                                                                                                                                                |
| Gin          | Go       | 1.05×             | 1.10×    | Light router.                                                                                                                                                                                                                                     |
| Fiber        | Go       | 1.0× (fasthttp)   | 1.15×    | Express-style API. Inherits fasthttp limits. Built.                                                                                                                                                                                               |
| Phoenix      | Elixir   | 1.1×              | 1.30×    | Channels for `rt` built in. LiveView: `page` value +30%, and each connected user holds a BEAM process (memory per user).                                                                                                                          |
| Axum         | Rust     | 1.0×              | 1.15×    | Built on Tokio and Tower.                                                                                                                                                                                                                         |
| Actix Web    | Rust     | 0.95×             | 1.10×    | Among the fastest in benchmarks.                                                                                                                                                                                                                  |

## Worked tradeoffs

These scenarios are the dominance test in prose. Each runtime wins at least one. One known gap: BEAM
never beats Go or Kestrel on any score, and the dominance test logs that as a known gap.

| Situation                                                                      | Strong choice                  | Why                                                                                                                                               |
| ------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Garage, tiny team, mostly `page` and `read`, cheap hires                       | PHP-FPM with Laravel, or Rails | Velocity matters more than CPU. One box is enough. Shared nothing means no leaks.                                                                 |
| Slow database you cannot fix yet, lots of I/O wait                             | Node.js, Go, or Tokio          | Waiting does not hold a worker.                                                                                                                   |
| Many `login` or `upload` requests on the same service                          | Go, Java, or Elixir            | No event-loop stall. Node.js stalls its loop until the libuv pool Research.                                                                       |
| `rt` at scale                                                                  | Elixir, then Go or Rust        | Memory per connection and flat p99.                                                                                                               |
| Steady, CPU-bound, high volume, long-lived processes                           | Java with ZGC, C#, or Rust     | Highest throughput per dollar once warm.                                                                                                          |
| Spiky traffic on Serverless Functions                                          | Go or Rust                     | Cold starts. A GraalVM native image fits here too: it starts in under 100 ms.                                                                     |
| `ai` glue, embeddings, reranking                                               | Python with FastAPI            | The ML ecosystem bonus: +20% on `ai` in Python, and FastAPI adds 15%.                                                                             |
| A hot path service where p99 matters more than Dev Hours (Discord read states) | Rust                           | No GC pauses. Discord moved a service from Go to Rust for this reason in 2020.                                                                    |
| 40 engineers in one codebase                                                   | Symfony                        | The only framework the build models as structured: −30% tech debt and coordination. Spring Boot and NestJS are built, but their structure is not. |
| Pre-IPO cost cutting on a large fleet                                          | Go or Rust on ARM instances    | Low memory and good speed on cheaper instances.                                                                                                   |

## Migrations

Changing a service's language is a migration. Changing a variant or framework inside the same
language is an adoption. Both cost Dev Hours and take calendar time. During a migration, the service
runs both versions, and traffic shifts in steps ([Team: migrations](/design/08-team-and-velocity#migrations)).
The "big rewrite" is a real trap: it stops feature work while the competition ships.
