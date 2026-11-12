import { Runtime } from 'foldkit'
import { localeOfPath } from './i18n/locale.ts'
import { loadLocale } from './i18n/load.ts'
import { Message, Model, init, update } from './main.ts'
import { subscriptions } from './subscriptions.ts'
import { view } from './view.ts'
import { startAnalytics } from './platform/analytics.ts'
import './styles.css'

const application = Runtime.makeApplication({
  Model,
  init,
  update,
  view,
  subscriptions,
  container: document.getElementById('root'),
  routing: {
    onUrlRequest: (request) => Message.ClickedLink({ request }),
    onUrlChange: (url) => Message.ChangedUrl({ url }),
  },
  devTools: { Message },
})

// Every page was rendered at build time; the client adopts it (ADR 0009). A page in another
// language needs that language's copy and prose first, or the client would draw it differently.
void loadLocale(localeOfPath(window.location.pathname)).then(() => {
  Runtime.hydrate(application)
  startAnalytics()
})
