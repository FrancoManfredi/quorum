import { Combobox } from '@foldkit/ui'
import type { FrameworkId, RuntimeId } from '@quorum/simulation/catalog'

/** The searchable Runtime and Framework pickers on an App Server or Worker. */
export const runtimePicker = Combobox.create<RuntimeId>()
export const frameworkPicker = Combobox.create<FrameworkId>()

export const initRuntimePicker = (): Combobox.Model => Combobox.init({ id: 'stack-runtime' })

export const initFrameworkPicker = (): Combobox.Model => Combobox.init({ id: 'stack-framework' })
