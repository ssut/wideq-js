import _ from 'lodash';

export interface LangValue {
  packs: any;
}

/**
 * A description of a device model's capabilities.
 */
export class LangPackModel {
  public constructor(
    public data: any
  ) {
  }

  /**
   * Look up information about a value.
   */
  public value() {
    return {
      packs: this.data.pack,
    } as LangValue;
  }

  /**
   * Look up the encoded value for a friendly enum name.
   */
  public enumValue(name: string) {
    const packs = (this.value() as LangValue).packs || {};
    // invert them pa
    const packsInv = _.invert(packs);

    return packsInv[name];
  }

  /**
   * Look up the friendly enum name for an encoded value.
   */
  public enumName(value: string) {
    const packs = (this.value() as LangValue).packs || {};
    if (!(value in packs)) {
      return null;
    }

    return packs[value];
  }
}
