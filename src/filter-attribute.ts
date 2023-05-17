import ConditionAttribute from './condition-attribute';
import { FilterValue, FilterCondition } from './filter-conditions';
import { KeyValue } from './base-model';

interface IAttributesValues {
  id: string;
  attr: Map<string, string>;
  values: Map<string, string | null>;
}

export default class FilterAttribute extends ConditionAttribute<FilterValue> {
  public eq(value: FilterValue): FilterCondition {
    return new FilterCondition(...super.prepareEq(value));
  }

  public gt(value: FilterValue): FilterCondition {
    return new FilterCondition(...super.prepareGt(value));
  }

  public ge(value: FilterValue): FilterCondition {
    return new FilterCondition(...super.prepareGe(value));
  }

  public lt(value: FilterValue): FilterCondition {
    return new FilterCondition(...super.prepareLt(value));
  }

  public le(value: FilterValue): FilterCondition {
    return new FilterCondition(...super.prepareLe(value));
  }

  public between(lower: KeyValue, upper: KeyValue): FilterCondition {
    return new FilterCondition(...super.prepareBetween(lower, upper));
  }

  public beginsWith(value: string): FilterCondition {
    return new FilterCondition(...super.prepareBeginsWith(value));
  }

  public neq(value: FilterValue): FilterCondition {
    const id = this.getAttributeUniqueIdentifier();
    const { attr, values } = this.fillMaps(id, value);
    return new FilterCondition(`#${id} <> :${id}`, attr, values);
  }

  public in(...values: FilterValue[]): FilterCondition {
    const id = this.getAttributeUniqueIdentifier();
    const attr: Map<string, string> = new Map();
    const val: Map<string, FilterValue> = new Map();
    attr.set(`#${id}`, this.field);
    values.forEach((value, idx) => {
      val.set(`:${id}${idx}`, value);
    });
    return new FilterCondition(`#${id} IN (${Array.from(val.keys()).join(',')})`, attr, val);
  }

  private prepareAttributes(): { id: string; attr: Map<string, string> } {
    const id = this.getAttributeUniqueIdentifier();
    const attr: Map<string, string> = new Map();
    attr.set(`#${id}`, this.field);
    return { id, attr };
  }

  private prepareAttributesAndValues(): IAttributesValues {
    const { id, attr } = this.prepareAttributes();
    const values: Map<string, string | null> = new Map();
    values.set(':null', null);
    return { id, attr, values };
  }

  private nullOperation(not = false): FilterCondition {
    const { id, attr, values } = this.prepareAttributesAndValues();
    return new FilterCondition(`#${id} ${not ? '<>' : '='} :null`, attr, values);
  }

  private existsOperation(not = false): FilterCondition {
    const { id, attr } = this.prepareAttributes();
    const operator = not ? 'attribute_not_exists' : 'attribute_exists';
    return new FilterCondition(`${operator}(#${id})`, attr, new Map());
  }

  private containsOperation(value: string, not = false): FilterCondition {
    const { id, attr, values } = this.prepareOp(value);
    const operator = not ? 'NOT contains' : 'contains';
    return new FilterCondition(`${operator}(#${id}, :${id})`, attr, values);
  }

  public null(): FilterCondition {
    return this.nullOperation();
  }

  public notNull(): FilterCondition {
    return this.nullOperation(true);
  }

  public exists(): FilterCondition {
    return this.existsOperation();
  }

  public notExists(): FilterCondition {
    return this.existsOperation(true);
  }

  public contains(value: string): FilterCondition {
    return this.containsOperation(value);
  }

  public notContains(value: string): FilterCondition {
    return this.containsOperation(value, true);
  }
}
