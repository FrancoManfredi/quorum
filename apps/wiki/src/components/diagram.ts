import type { Html, HtmlBuilder } from 'foldkit/html'
import { render } from 'pele'

/* A Mermaid diagram, drawn by Pele as SVG. The colours come from CSS variables (styles.css), so
   it follows the theme. A diagram Pele cannot read fails the build. */

/** The article column is about 780px wide inside the frame: Pele lays the diagram out for it, at the page's text size. */
const OPTIONS = {
  maxWidth: 780,
  fontSize: 14,
  fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
}

/** A diagram may shrink to fit its column, but not below this share of its own size: past that, a phone scrolls it. */
const SHRINK_LIMIT = 0.85

export const diagramView = <M>(source: string, h: HtmlBuilder<M>): Html => {
  const { svg, width } = render(source, OPTIONS)
  return h.figure(
    [h.Class('diagram')],
    [h.div([h.Style({ minWidth: `${Math.round(width * SHRINK_LIMIT)}px` }), h.InnerHTML(svg)], [])],
  )
}
