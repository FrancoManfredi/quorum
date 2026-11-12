import { catalog } from '@quorum/ui/i18n/catalog/es'
import { registerProse, type ProseModule } from '../content.ts'
import { es } from '../i18n/es/index.ts'
import { registerLocale } from '../i18n/lang.ts'

/* Everything Spanish, in one chunk: the interface copy, the catalog words and the prose of
   `content-es/`. Importing the module registers them (src/i18n/load.ts). */

registerLocale('es', es, catalog)
registerProse('es', import.meta.glob<ProseModule>('../../content-es/**/*.md', { eager: true }))
