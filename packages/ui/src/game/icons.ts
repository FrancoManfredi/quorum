import { Activity, Cpu, Database, Globe, type IconNode } from 'lucide'
import {
  siAdonisjs,
  siCodeigniter,
  siDjango,
  siDotnet,
  siElixir,
  siExpress,
  siFastapi,
  siFastify,
  siFlask,
  siGin,
  siGo,
  siHono,
  siKoa,
  siLaravel,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPhoenixframework,
  siPhp,
  siPython,
  siQuarkus,
  siRuby,
  siRocket,
  siRubyonrails,
  siRust,
  siSanic,
  siZig,
  siHaskell,
  siActix,
  siTokio,
  siSpringboot,
  siSymfony,
} from 'simple-icons'
import { COMPONENT_VIEWS } from '../components/index.ts'
import type { BuildGroup, ComponentId, FrameworkId, LanguageId } from '@quorum/simulation/catalog'

/** One glyph per Component, shared by the board, the dock and the inspector. */
export const COMPONENT_ICONS = Object.fromEntries(
  Object.entries(COMPONENT_VIEWS).map(([id, view]) => [id, view.icon]),
) as Record<ComponentId, IconNode>

export const GROUP_ICONS: Record<BuildGroup, IconNode> = {
  edge: Globe,
  compute: Cpu,
  data: Database,
  ops: Activity,
}

/**
 * Each build group has a colour and a badge shape, so a Node's place in the
 * Design reads before its name: Edge hexagons, Compute chips, Data discs,
 * Ops diamonds. The colours are `--group-*` tokens in styles.css.
 */
export type GroupShape = 'hexagon' | 'chip' | 'disc' | 'diamond'

export const GROUP_SHAPES: Record<BuildGroup, GroupShape> = {
  edge: 'hexagon',
  compute: 'chip',
  data: 'disc',
  ops: 'diamond',
}

export type StackLogoId = LanguageId | Exclude<FrameworkId, 'none'>

/**
 * Brand marks for languages and frameworks, from Simple Icons (CC0), as one
 * filled 24×24 path each. `color` is null for a mark that is black by brand,
 * so it takes the ink colour and stays visible on the dark theme.
 */
export const STACK_LOGOS: Record<StackLogoId, Readonly<{ path: string; color: string | null }>> = {
  php: { path: siPhp.path, color: `#${siPhp.hex}` },
  ruby: { path: siRuby.path, color: `#${siRuby.hex}` },
  node: { path: siNodedotjs.path, color: `#${siNodedotjs.hex}` },
  python: { path: siPython.path, color: `#${siPython.hex}` },
  laravel: { path: siLaravel.path, color: `#${siLaravel.hex}` },
  rails: { path: siRubyonrails.path, color: `#${siRubyonrails.hex}` },
  express: { path: siExpress.path, color: null },
  // Django's brand green is near black; its lighter secondary green reads on both themes.
  django: { path: siDjango.path, color: '#44B78B' },
  symfony: { path: siSymfony.path, color: null },
  // Simple Icons has no Sinatra mark: it wears Ruby's.
  sinatra: { path: siRuby.path, color: '#B4302A' },
  flask: { path: siFlask.path, color: `#${siFlask.hex}` },
  go: { path: siGo.path, color: `#${siGo.hex}` },
  java: { path: siOpenjdk.path, color: null },
  // Simple Icons has no C# mark: C# and ASP.NET Core wear .NET's.
  csharp: { path: siDotnet.path, color: `#${siDotnet.hex}` },
  elixir: { path: siElixir.path, color: `#${siElixir.hex}` },
  rust: { path: siRust.path, color: null },
  zig: { path: siZig.path, color: `#${siZig.hex}` },
  haskell: { path: siHaskell.path, color: `#${siHaskell.hex}` },
  gin: { path: siGin.path, color: `#${siGin.hex}` },
  'spring-boot': { path: siSpringboot.path, color: `#${siSpringboot.hex}` },
  aspnet: { path: siDotnet.path, color: `#${siDotnet.hex}` },
  phoenix: { path: siPhoenixframework.path, color: `#${siPhoenixframework.hex}` },
  axum: { path: siTokio.path, color: null },
  actix: { path: siActix.path, color: null },
  fastapi: { path: siFastapi.path, color: `#${siFastapi.hex}` },
  fastify: { path: siFastify.path, color: null },
  nextjs: { path: siNextdotjs.path, color: null },
  nestjs: { path: siNestjs.path, color: `#${siNestjs.hex}` },
  // Simple Icons has no Fiber mark: it wears Go's.
  fiber: { path: siGo.path, color: `#${siGo.hex}` },
  quarkus: { path: siQuarkus.path, color: `#${siQuarkus.hex}` },
  hono: { path: siHono.path, color: `#${siHono.hex}` },
  // Simple Icons has no Elysia mark: this is Elysia's own logo, flattened to one path, in the
  // pink of elysiajs.com.
  elysia: {
    path: 'M12.87,11.08l-0.06,-0.7c-0.04,-0.43 -0.22,-0.84 -0.51,-1.16c-0.01,-0.01 -0.02,-0.01 -0.03,-0.02h0.69c0.57,0 1.15,-0.08 1.7,-0.22l0.4,-0.11c0.23,-0.06 0.45,-0.14 0.66,-0.23l0.54,-0.23c0.39,-0.17 0.73,-0.44 0.98,-0.77c0.03,-0.04 0.02,-0.09 -0.03,-0.11l-0.93,-0.46c-0.2,-0.1 -0.4,-0.22 -0.58,-0.34l-0.42,-0.29c-0.51,-0.36 -0.88,-0.89 -1.04,-1.49l-0.17,-0.64c-0.37,-0.98 -1.15,-1.75 -2.14,-2.11l-0.72,-0.26c-0.24,-0.11 -0.44,-0.27 -0.6,-0.48l-0.24,-0.32c-0.11,-0.15 -0.23,-0.29 -0.36,-0.42c0.64,-0.11 1.31,-0.16 1.98,-0.16c6.63,0 12,5.37 12,12c0,2.62 -0.84,5.04 -2.26,7.01l-0.01,0.02l-0.04,0.05c-0.05,0.07 -0.11,0.14 -0.16,0.21l-0.29,0.39l-0.54,0.61l-0.49,0.47c-0.45,0.43 -0.94,0.82 -1.47,1.15l-0.17,0.11l-0.32,0.15c-0.08,0.04 -0.15,-0.07 -0.08,-0.13l0.45,-0.42l0.09,-0.1c0.25,-0.26 0.43,-0.58 0.52,-0.92l0.04,-0.16c0.02,-0.07 0.03,-0.15 0.03,-0.22c0,-0.41 -0.29,-0.76 -0.69,-0.84c-0.25,-0.05 -0.5,0.02 -0.7,0.17l-0.44,0.36l-0.78,0.64c-0.51,0.42 -1.06,0.78 -1.65,1.08l-0.8,0.41l-1.36,0.52l-0.29,0.08c-0.5,0.14 -1,0.23 -1.52,0.28l-0.38,0.04h-1.22l-1.62,-0.18l-0.88,-0.19c-0.84,-0.18 -1.63,-0.56 -2.29,-1.1l-0.68,-0.55c-0.82,-0.63 -1.33,-1.57 -1.41,-2.6l-0.04,-0.54l0.05,-0.76c0.11,-1.68 0.97,-3.21 2.35,-4.18l0.14,-0.1c0.6,-0.42 1.27,-0.73 1.97,-0.92l0.48,-0.13c0.62,-0.16 1.27,-0.18 1.89,-0.05l0.5,0.1c0.12,0.03 0.15,0.19 0.04,0.25h0l-0.02,0.01c-0.59,0.34 -0.91,0.97 -0.88,1.65c0.01,0.19 0.2,0.37 0.39,0.32l0.34,-0.1c0.44,-0.13 0.85,-0.35 1.2,-0.65l0.99,-0.86l0.29,-0.22c0.11,-0.08 0.22,-0.16 0.33,-0.23c0.2,-0.44 0.29,-0.93 0.25,-1.41zM0,12.52c0,-3.81 1.77,-7.2 4.54,-9.4c0.09,0.55 0.3,1.07 0.62,1.53l0.08,0.12c0.08,0.11 0.17,0.22 0.26,0.32l0.09,0.1c0.02,0.02 0.04,0.04 0.06,0.05c-0.06,0.03 -0.12,0.06 -0.17,0.1l-0.08,0.05c-0.39,0.25 -0.72,0.57 -0.97,0.96l-0.21,0.33c-0.32,0.59 -0.82,1.07 -1.43,1.36l-0.19,0.09c-0.03,0.03 -0.01,0.08 0.03,0.08l0.14,-0.01l0.19,-0.02l0.28,-0.03l0.28,-0.05l0.26,-0.02l0.34,-0.04c0.17,-0.02 0.34,-0.05 0.51,-0.1c-0.71,0.2 -1.36,0.57 -1.89,1.08l-0.26,0.25c-0.53,0.51 -0.97,1.1 -1.28,1.77l-0.2,0.43l-0.27,0.8c-0.13,0.39 -0.23,0.78 -0.29,1.19l-0.01,0.04c-0.13,0.89 -0.08,1.81 0.15,2.68c-0.37,-1.15 -0.57,-2.38 -0.57,-3.65zM12.71,5.83c-0.72,-0.01 -1.31,-0.57 -1.36,-1.29c0,-0.02 0.01,-0.03 0.03,-0.04c0.02,-0.01 0.04,0 0.05,0.01l0.07,0.09c0.11,0.15 0.24,0.28 0.39,0.4l0.06,0.05c0.19,0.16 0.39,0.29 0.61,0.41l0.32,0.17c0.08,0.04 0.17,0.08 0.25,0.1c0.05,0.02 0.04,0.1 -0.02,0.1l-0.41,0z',
    color: '#F06292',
  },
  // Koa's brand colour is near black.
  koa: { path: siKoa.path, color: null },
  adonis: { path: siAdonisjs.path, color: `#${siAdonisjs.hex}` },
  codeigniter: { path: siCodeigniter.path, color: `#${siCodeigniter.hex}` },
  sanic: { path: siSanic.path, color: `#${siSanic.hex}` },
  rocket: { path: siRocket.path, color: `#${siRocket.hex}` },
  // Simple Icons has no Jetzig or Tokamak mark: both wear Zig's. Jetzig keeps Zig's yellow, and
  // Tokamak takes the foreground ink so the two read apart in the picker.
  jetzig: { path: siZig.path, color: `#${siZig.hex}` },
  tokamak: { path: siZig.path, color: null },
  // Simple Icons has no Servant or IHP mark: both wear Haskell's path. Servant takes Haskell's
  // purple and IHP its teal.
  servant: { path: siHaskell.path, color: `#${siHaskell.hex}` },
  ihp: { path: siHaskell.path, color: '#026B86' },
}
