import { foldkit } from '@foldkit/vite-plugin'
import { mkdirSync, writeFileSync } from 'node:fs'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import { simVersion } from '../../packages/simulation/sim-version.ts'

/**
 * Foldkit's view-identity transform wraps every function return in a module. The Simulation has
 * thousands of functions and never builds a view, so branding them only taxes every tick. The
 * localizing builder builds views for its caller, so branding it would give each element the
 * builder's identity and a locale switch would remount the board.
 */
const skipBranding = /\/packages\/simulation\/|\/src\/i18n\/builder\.ts/

const unbrandedModules = (plugin: Plugin): Plugin => {
  if (plugin.name !== 'foldkit:view-identity' || typeof plugin.transform !== 'function')
    return plugin
  const transform = plugin.transform
  return {
    ...plugin,
    transform(code, id, options) {
      if (skipBranding.test(id)) return null
      return transform.call(this, code, id, options)
    },
  }
}

/**
 * Source maps go to Sentry only from a build that has the upload token, and never into the
 * deployed assets: hidden maps carry no link in the bundle, and the plugin deletes them after.
 */
/**
 * The layout harness at `/harness.html` saves the player's arrangement into the
 * workspace, so an agent can read it back. Dev only: `configureServer` never runs
 * in a build.
 */
const layoutHarness = (): Plugin => ({
  name: 'layout-harness',
  configureServer(server) {
    server.middlewares.use('/harness/save', (request, response) => {
      if (request.method !== 'POST') {
        response.statusCode = 405
        response.end('POST only')
        return
      }
      let body = ''
      request.on('data', (chunk) => {
        body += chunk
      })
      request.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          const directory = new URL('../../.amp/in/artifacts/tidy/', import.meta.url)
          mkdirSync(directory, { recursive: true })
          writeFileSync(new URL('user-layout.json', directory), JSON.stringify(parsed, null, 2))
          response.statusCode = 200
          response.end('saved')
        } catch (error) {
          response.statusCode = 400
          response.end(`bad request: ${String(error)}`)
        }
      })
    })
  },
})

const authToken = process.env.SENTRY_AUTH_TOKEN
const release = process.env.VITE_SENTRY_RELEASE

export default defineConfig({
  build: { sourcemap: authToken ? 'hidden' : false },
  plugins: [
    layoutHarness(),
    tailwindcss(),
    foldkit().map(unbrandedModules),
    simVersion(),
    // Last, so it sees the final bundle.
    authToken
      ? sentryVitePlugin({
          authToken,
          // The plugin reads SENTRY_ORG and SENTRY_PROJECT from the environment itself.
          ...(release ? { release: { name: release } } : {}),
          sourcemaps: {
            // Alchemy builds the Worker (`dist/ssr`) first and the assets (`dist/client`) second,
            // and ships only `index.js` of the first and everything in the second. So every
            // build uploads both directories, and only the public assets lose their maps.
            assets: ['./dist/ssr/**', './dist/client/**'],
            filesToDeleteAfterUpload: ['./dist/client/**/*.map'],
          },
        })
      : null,
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['effect', 'foldkit'],
  },
})
