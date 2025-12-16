/**
 * Minimal base entity for a hexagonal / DDD-ish approach.
 * Keep domain free of NestJS, persistence, and transport concerns.
 */
export abstract class BaseEntity<TId> {
  protected constructor(public readonly id: TId) {}
}


