import { LogoId } from '../logos.ts'
import { Schema } from 'effect'

/** The companies Messages, as cases for the root union. */
export const companiesCases = {
  SavesLoaded: {
    index: Schema.NullOr(Schema.String),
    legacy: Schema.NullOr(Schema.String),
    now: Schema.Finite,
  },
  /** One Company's Game, read to continue it or to open it from the Companies page. */
  CompanyLoaded: {
    id: Schema.String,
    open: Schema.Boolean,
    json: Schema.NullOr(Schema.String),
    now: Schema.Finite,
  },
  CompanyNameChanged: { name: Schema.String },
  LogoChosen: { logo: LogoId },
  /** The Companies page opens one Company's file. */
  CompanyChosen: { id: Schema.String },
  CompanyClosed: {},
  CompanyOpened: { id: Schema.String },
  CompanyDeleteAsked: {},
  CompanyDeleteCancelled: {},
  CompanyDeleteConfirmed: {},
  CompanyDeleted: { id: Schema.String },
  /** The hidden recovery action: read the single save of the build before Company files. */
  OldSaveImportAsked: {},
  OldSaveLoaded: { json: Schema.NullOr(Schema.String), now: Schema.Finite },
  FounderLoaded: {
    json: Schema.NullOr(Schema.String),
    deviceId: Schema.String,
    today: Schema.String,
  },
  Saved: {},
  /** The title screen's connect sequence ended: the board it was opening shows. */
  CompanyFounded: {},
  PreseedStarted: {},
}
