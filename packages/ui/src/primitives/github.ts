import type { Html, HtmlBuilder } from 'foldkit/html'
import { siGithub } from 'simple-icons'

/**
 * The GitHub mark, as one filled 24×24 path from Simple Icons (CC0). Lucide has no brand marks, so
 * every surface that links to the repository draws this one.
 */
export const githubMark = <M>(h: HtmlBuilder<M>, className = 'size-4 shrink-0'): Html =>
  h.svg(
    [
      h.AriaHidden(true),
      h.Class(className),
      h.Xmlns('http://www.w3.org/2000/svg'),
      h.ViewBox('0 0 24 24'),
      h.Fill('currentColor'),
    ],
    [h.path([h.D(siGithub.path)])],
  )
