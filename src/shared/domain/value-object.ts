/**
 * Minimal value object base class with structural equality.
 * Concrete implementations should be immutable.
 */
export abstract class ValueObject<TProps extends Record<string, unknown>> {
  protected constructor(protected readonly props: TProps) {}

  equals(other: ValueObject<TProps>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}


