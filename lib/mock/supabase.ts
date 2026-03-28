/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// ============================================================
// MOCK SUPABASE CLIENT — drop-in replacement para desarrollo local
// Activo cuando MOCK_MODE=true en .env.local
// ============================================================

import { MOCK_USER, MOCK_DB } from './data'

// Genera un UUID v4 válido para pasar validación Zod
function mockUuid(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16)
  const s = (n: number) => Array.from({ length: n }, hex).join('')
  return `${s(8)}-${s(4)}-4${s(3)}-${['8','9','a','b'][Math.floor(Math.random()*4)]}${s(3)}-${s(12)}`
}

type Row = Record<string, any>

// ── Query Builder ──────────────────────────────────────────
class MockQueryBuilder {
  private _table: string
  private _filters: Array<{ field: string; op: string; value: any }> = []
  private _orderField?: string
  private _orderAsc = true
  private _limitN?: number
  private _isSingle = false
  private _isCount = false
  private _isHead = false
  private _insertData?: Row | Row[]
  private _updateData?: Row
  private _isDelete = false
  private _selectFields = '*'

  constructor(table: string) {
    this._table = table
  }

  private get tableData(): Row[] {
    return MOCK_DB[this._table] ?? []
  }

  select(fields?: string, opts?: { count?: string; head?: boolean }) {
    if (fields) this._selectFields = fields
    if (opts?.count === 'exact') this._isCount = true
    if (opts?.head) this._isHead = true
    return this
  }

  eq(field: string, value: any) {
    this._filters.push({ field, op: 'eq', value })
    return this
  }

  neq(field: string, value: any) {
    this._filters.push({ field, op: 'neq', value })
    return this
  }

  gte(field: string, value: any) {
    this._filters.push({ field, op: 'gte', value })
    return this
  }

  in(field: string, values: any[]) {
    this._filters.push({ field, op: 'in', value: values })
    return this
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this._orderField = field
    this._orderAsc = opts?.ascending ?? true
    return this
  }

  limit(n: number) {
    this._limitN = n
    return this
  }

  insert(data: Row | Row[]) {
    this._insertData = data
    return this
  }

  update(data: Row) {
    this._updateData = data
    return this
  }

  delete() {
    this._isDelete = true
    return this
  }

  single() {
    this._isSingle = true
    return this._resolve()
  }

  maybeSingle() {
    this._isSingle = true
    return this._resolve().then((r: any) => {
      // maybeSingle: no error si no hay filas (a diferencia de single)
      if (r.error?.code === 'PGRST116') return { data: null, error: null }
      return r
    })
  }


  // Enables await without calling .single()
  then(resolve: (v: any) => any, reject?: (e: any) => any) {
    return this._resolve().then(resolve, reject)
  }

  // ── Execution ──────────────────────────────────────────

  private _applyFilters(rows: Row[]): Row[] {
    return rows.filter(row =>
      this._filters.every(f => {
        // Soporte para filtros con JOIN: 'tabla_relacionada.campo'
        // Ej: 'community_members.user_id' → busca en MOCK_DB.community_members
        if (f.field.includes('.')) {
          const [relTable, relField] = f.field.split('.')
          const relRows: Row[] = MOCK_DB[relTable] ?? []
          // FK: buscar cualquier campo '_id' en la tabla relacionada que apunte a row.id
          return relRows.some(rel => {
            const fkMatch = Object.entries(rel).some(([k, v]) => k.endsWith('_id') && v === row['id'])
            const fieldMatch = f.op === 'eq' ? rel[relField] === f.value
                             : f.op === 'neq' ? rel[relField] !== f.value
                             : f.op === 'in' ? (f.value as any[]).includes(rel[relField])
                             : true
            return fkMatch && fieldMatch
          })
        }
        switch (f.op) {
          case 'eq':  return row[f.field] === f.value
          case 'neq': return row[f.field] !== f.value
          case 'gte': return row[f.field] >= f.value
          case 'in':  return (f.value as any[]).includes(row[f.field])
          default:    return true
        }
      })
    )
  }

  private _resolve(): Promise<any> {
    // ── INSERT ──
    if (this._insertData !== undefined) {
      const rows = Array.isArray(this._insertData) ? this._insertData : [this._insertData]
      const newRows = rows.map(r => ({
        id: r.id ?? mockUuid(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...r,
      }))
      MOCK_DB[this._table] = [...this.tableData, ...newRows]
      const result = this._isSingle ? newRows[0] : newRows
      return Promise.resolve({ data: result ?? null, error: null })
    }

    // ── UPDATE ──
    if (this._updateData !== undefined) {
      const updated: Row[] = []
      MOCK_DB[this._table] = this.tableData.map(row => {
        const matches = this._applyFilters([row]).length > 0
        if (matches) {
          const newRow = { ...row, ...this._updateData, updated_at: new Date().toISOString() }
          updated.push(newRow)
          return newRow
        }
        return row
      })
      const result = this._isSingle ? (updated[0] ?? null) : updated
      return Promise.resolve({ data: result, error: null })
    }

    // ── DELETE ──
    if (this._isDelete) {
      MOCK_DB[this._table] = this.tableData.filter(
        row => this._applyFilters([row]).length === 0
      )
      return Promise.resolve({ data: null, error: null })
    }

    // ── SELECT ──
    let rows = this._applyFilters(this.tableData)

    if (this._orderField) {
      const field = this._orderField
      rows = [...rows].sort((a, b) => {
        if (a[field] < b[field]) return this._orderAsc ? -1 : 1
        if (a[field] > b[field]) return this._orderAsc ? 1 : -1
        return 0
      })
    }

    if (this._limitN !== undefined) {
      rows = rows.slice(0, this._limitN)
    }

    if (this._isCount) {
      if (this._isHead) return Promise.resolve({ count: rows.length, error: null })
      return Promise.resolve({ data: rows, count: rows.length, error: null })
    }

    if (this._isSingle) {
      return Promise.resolve({ data: rows[0] ?? null, error: rows.length === 0 ? { code: 'PGRST116', message: 'No rows found' } : null })
    }

    return Promise.resolve({ data: rows, error: null })
  }
}

// ── Storage Mock ───────────────────────────────────────────
const mockStorage = {
  from: (_bucket: string) => ({
    upload: async (_path: string, _file: any, _opts?: any) =>
      ({ data: { path: `mock-path/${Date.now()}` }, error: null }),
    remove: async (_paths: string[]) =>
      ({ data: null, error: null }),
    getPublicUrl: (_path: string) =>
      ({ data: { publicUrl: `https://placehold.co/400x300?text=Mock+Image` } }),
  }),
}

// ── Auth Mock ──────────────────────────────────────────────
const mockAuth = {
  getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
  getSession: async () => ({
    data: { session: { user: MOCK_USER, access_token: 'mock-token' } },
    error: null,
  }),
  signOut: async () => ({ error: null }),
  signInWithOtp: async () => ({ data: {}, error: null }),
}

// ── RPC Mock ───────────────────────────────────────────────
// rpc() en el cliente devuelve un objeto thenable con .maybeSingle()
function mockRpc(_fn: string, _params?: Record<string, any>) {
  const result = { data: null, error: null }
  return {
    maybeSingle: () => Promise.resolve(result),
    single: () => Promise.resolve(result),
    then: (resolve: (v: any) => any) => Promise.resolve(result).then(resolve),
  }
}

// ── Mock Client Factory ────────────────────────────────────
function createMockClient() {
  return {
    auth: mockAuth,
    storage: mockStorage,
    from: (table: string) => new MockQueryBuilder(table),
    rpc: mockRpc,
  }
}

// ── Exports ────────────────────────────────────────────────
export const mockServerClient = createMockClient
export const mockBrowserClient = createMockClient
