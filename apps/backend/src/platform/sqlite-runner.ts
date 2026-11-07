import { readdirSync, readFileSync } from 'node:fs'
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import type { SqlRunner, SqlStatement } from './sql.ts'

const MIGRATIONS = new URL('../../migrations/', import.meta.url)

/**
 * An in-memory SQLite database with the D1 migrations applied in order, behind
 * the same `SqlRunner` shape as D1, so tests run the schema and SQL the API
 * Worker runs.
 */
export const sqliteRunner = (): SqlRunner => {
  const db = new DatabaseSync(':memory:')
  const files = readdirSync(MIGRATIONS)
    .filter((name) => name.endsWith('.sql'))
    .sort()
  for (const file of files) db.exec(readFileSync(new URL(file, MIGRATIONS), 'utf8'))
  const statement = (query: string, values: Array<unknown>): SqlStatement => ({
    bind: (...next) => statement(query, next),
    all: <T>() =>
      Promise.resolve({
        results: db.prepare(query).all(...(values as Array<SQLInputValue>)) as Array<T>,
      }),
  })
  return { prepare: (query) => statement(query, []) }
}
