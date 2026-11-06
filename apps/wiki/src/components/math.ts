import katex from 'katex'
import type { Html, HtmlBuilder } from 'foldkit/html'

/* A rule from the Simulation, typeset by KaTeX. A rule KaTeX cannot read fails the build rather
   than reaching a reader. */

export const mathView = <M>(source: string, h: HtmlBuilder<M>): Html =>
  h.figure(
    [
      h.Class('math'),
      h.InnerHTML(
        katex.renderToString(source, {
          displayMode: true,
          throwOnError: true,
          strict: 'error',
        }),
      ),
    ],
    [],
  )
