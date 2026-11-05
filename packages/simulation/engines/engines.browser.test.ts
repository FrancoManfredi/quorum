import { commands } from 'vitest/browser'
import { expect, test } from 'vitest'
import { report, type Report } from './report.ts'

/* Runs in Chromium, Firefox and WebKit (`pnpm test:engines`): the same hashes as Node, which the
   `node` command computes beside the browser. */

test('every engine ends the golden Company and every reference replay where Node does', async () => {
  const node = (await (commands as unknown as { node: () => Promise<Report> }).node()) as Report
  expect(report()).toEqual(node)
}, 600_000)
