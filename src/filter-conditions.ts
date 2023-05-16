import Condition from './conditions';
import FilterAttribute from './filter-attribute';

export type FilterValue = string | number | boolean | Buffer | null;

export type IFilterConditionOperators =
  | 'EQ'
  | 'NE'
  | 'IN'
  | 'LE'
  | 'LT'
  | 'GE'
  | 'GT'
  | 'BETWEEN'
  | 'NOT_NULL'
  | 'NULL'
  | 'EXISTS'
  | 'NOT_EXISTS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'BEGINS_WITH';

export class FilterCondition extends Condition<FilterValue> {
  public and(condition: FilterCondition): FilterCondition {
    super.and(condition);
    return this;
  }

  public or(condition: FilterCondition): FilterCondition {
    return this.combine(condition, 'OR') as FilterCondition;
  }

  public not(): FilterCondition {
    this.expression = `NOT (${this.expression})`;
    return this;
  }
}

export const not = (condition: FilterCondition): FilterCondition => condition.not();

export const attr = (field: string) => new FilterAttribute(field);
