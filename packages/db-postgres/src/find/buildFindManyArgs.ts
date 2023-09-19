import type { DBQueryConfig } from 'drizzle-orm'
import type { ArrayField, Block, Field } from 'payload/types'

import type { PostgresAdapter } from '../types'

import { traverseFields } from './traverseFields'

type BuildFindQueryArgs = {
  adapter: PostgresAdapter
  depth: number
  fields: Field[]
  tableName: string
}

export type Result = DBQueryConfig<'many', true, any, any>

// Generate the Drizzle query for findMany based on
// a collection field structure
export const buildFindManyArgs = ({
  adapter,
  depth,
  fields,
  tableName,
}: BuildFindQueryArgs): Record<string, unknown> => {
  const result: Result = {
    with: {},
  }

  const _locales: Result = {
    columns: {
      id: false,
      _parentID: false,
    },
  }

  if (adapter.tables[`${tableName}_relationships`]) {
    result.with._relationships = {
      columns: {
        id: false,
        parent: false,
      },
      orderBy: ({ order }, { asc: ASC }) => [ASC(order)],
    }
  }

  if (adapter.tables[`${tableName}_locales`]) {
    result.with._locales = _locales
  }

  const locatedBlocks: Block[] = []
  const locatedArrays: { [path: string]: ArrayField } = {}

  traverseFields({
    _locales,
    adapter,
    currentArgs: result,
    currentTableName: tableName,
    depth,
    fields,
    locatedArrays,
    locatedBlocks,
    path: '',
    topLevelArgs: result,
    topLevelTableName: tableName,
  })

  return result
}