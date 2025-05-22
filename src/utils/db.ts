/**
 * Converts an entity, ID string, or object with `id` into a `{ id }` shape,
 * suitable for use in TypeORM `where` clauses.
 *
 * @example
 * fk('123') → { id: '123' }
 * fk(groupEntity) → { id: groupEntity.id }
 */
export function fk<T extends { id: string }>(input: string | T | { id: string }): { id: string } {
  if (typeof input === 'string') {
    return { id: input };
  }

  if (input && typeof input === 'object' && typeof input.id === 'string') {
    return { id: input.id };
  }

  throw new Error('Invalid relation input: expected string or object with "id"');
}
