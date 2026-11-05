// Runs the golden Company and every Challenge's reference replay in workerd, the
// Workers runtime, and compares them with the hashes Node computes. Wall time
// is measured from here: inside a Worker the clock stops while code runs.
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const require = createRequire(import.meta.url)
const here = fileURLToPath(new URL('.', import.meta.url))
const workerd = join(require.resolve('workerd/package.json'), '..', 'bin', 'workerd')
const PORT = 8_791
const dir = mkdtempSync(join(tmpdir(), 'quorum-workerd-'))

const { report } = await import('./report.ts')
const expected = report()

await build({
  entryPoints: [join(here, 'workerd.ts')],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  outfile: join(dir, 'worker.js'),
  logLevel: 'error',
})
writeFileSync(
  join(dir, 'config.capnp'),
  `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [(name = "main", worker = .worker)],
  sockets = [(name = "http", address = "127.0.0.1:${PORT}", http = (), service = "main")],
);
const worker :Workerd.Worker = (
  modules = [(name = "worker.js", esModule = embed "worker.js")],
  compatibilityDate = "2026-10-08",
);
`,
)

const server = spawn(workerd, ['serve', join(dir, 'config.capnp')], {
  stdio: ['ignore', 'inherit', 'inherit'],
})
const stop = () => {
  server.kill()
  rmSync(dir, { recursive: true, force: true })
}

const fetchReport = async () => {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/`)
      return await response.json()
    } catch (error) {
      if (attempt > 50) throw error
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

try {
  const started = performance.now()
  const got = await fetchReport()
  const ms = (performance.now() - started).toFixed(0)
  const wrong = [
    ...(got.golden === expected.golden ? [] : ['golden']),
    ...Object.keys(expected.challenges).filter(
      (id) => got.challenges[id] !== expected.challenges[id],
    ),
  ]
  console.log(
    wrong.length === 0
      ? `ok   workerd matches Node on the golden Company and every reference replay in ${ms} ms`
      : `FAIL workerd differs from Node on: ${wrong.join(', ')}`,
  )
  process.exitCode = wrong.length === 0 ? 0 : 1
} finally {
  stop()
}
