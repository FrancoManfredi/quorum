import { expect, test } from 'vitest'
import * as Markdown from '@foldkit/markdown'
import { blocksMarkdown, llmsTxt, markdownFiles, markdownPath, pageMarkdown } from './markdown.ts'
import { PAGES, pageAt } from './pages.ts'

/* The agent-facing contract: /llms.txt indexes every page, and every page has a Markdown twin. */

test('every page has a markdown twin, and every llms.txt link resolves to one', () => {
  const files = markdownFiles()
  expect(PAGES.filter((page) => !(markdownPath(page.path).slice(1) in files))).toEqual([])

  const links = [
    ...llmsTxt().matchAll(/^- \[[^\]]+\]\(https:\/\/wiki\.playquorum\.dev(\/[^)]*)\)/gm),
  ]
  const hrefs = links.map((match) => match[1] ?? '')
  expect(hrefs.filter((href) => !(href.slice(1) in files))).toEqual([])
  expect(new Set(hrefs).size).toBe(PAGES.length)
})

test('directives convert to readable Markdown with no :: syntax left', () => {
  const page = pageAt('/explanation/apdex-and-revenue')
  expect(page).not.toBeNull()
  const text = pageMarkdown(page!)
  expect(text).toMatch(/^# .+\n\n> .+/)
  expect(text).toContain('**Quiz:**')
  expect(text).toContain('Answer: ')
  expect(text).toMatch(/^> \*\*(Tip|Watch out|How real is it)\.\*\*/m)
  for (const [name, content] of Object.entries(markdownFiles())) {
    if (name.endsWith('.md')) expect(content, name).not.toMatch(/^\s*:{2,3}[A-Za-z]/m)
  }
})

test('an image keeps its alt text with an absolute URL, and a practice board becomes a text line', () => {
  const document = Markdown.decodeDocument({
    blocks: [
      {
        _tag: 'Paragraph',
        content: [{ _tag: 'Image', alt: 'The dock', url: '/play/dock.png', maybeTitle: null }],
      },
      { _tag: 'Island', name: 'Practice', attributes: { id: 'place' }, blocks: [] },
    ],
  })
  const text = blocksMarkdown(document.blocks)
  expect(text).toContain('![The dock](https://wiki.playquorum.dev/play/dock.png)')
  expect(text).toContain('Interactive practice board: place, open the page to use it')
})
