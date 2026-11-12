import type { Html, HtmlBuilder } from 'foldkit/html'
import { cn } from 'cn'
import { localeOf } from '../i18n/builder.ts'
import { langOf } from '../i18n/lang.ts'
import type { Message } from '../main.ts'
import type { Page } from '../page.ts'

/* The right rail: the page's headings. */

export const toc = (page: Page, h: HtmlBuilder<Message>): Html => {
  const t = langOf(localeOf(h)).t.toc
  return page.headings.length < 2
    ? h.empty
    : h.nav(
        [
          h.AriaLabel(t.onThisPage),
          h.Class('sticky top-[var(--header-height)] hidden self-start xl:block'),
        ],
        [
          h.div([h.Class('mb-2 text-[12px] font-semibold')], [t.onThisPage]),
          h.ul(
            [h.Class('border-l border-border')],
            page.headings.map((heading) =>
              h.li(
                [h.Key(heading.id)],
                [
                  h.a(
                    [
                      h.Href(`#${heading.id}`),
                      h.Class(
                        cn(
                          '-ml-px block border-l border-transparent py-1 text-[13px] text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                          heading.level === 3 ? 'pl-6' : 'pl-3',
                        ),
                      ),
                    ],
                    [heading.text],
                  ),
                ],
              ),
            ),
          ),
        ],
      )
}
