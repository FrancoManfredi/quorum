/**
 * The part of a D1 database the stores use. `D1Database` satisfies it, and so
 * does a `node:sqlite` shim in tests, so both run the same SQL.
 */
export interface SqlStatement {
  bind(...values: Array<unknown>): SqlStatement
  all<T = Record<string, unknown>>(): Promise<{ results: Array<T> }>
}

export interface SqlRunner {
  prepare(query: string): SqlStatement
}
