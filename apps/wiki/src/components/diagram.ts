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

export const diagramView = <M>(source: string, h: HtmlBuilder<M>): Html =>
  h.figure([h.Class('diagram'), h.InnerHTML(render(source, OPTIONS).svg)], [])
