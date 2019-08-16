import * as _ from 'lodash';

export interface ModelDataValue {
  type: string;

  [key: string]: any;
}

export interface ModelData {
  Value: ModelDataValue;

  [key: string]: any;
}

export interface BitValue {
  options: any;
}

export interface EnumValue {
  options: any;
}

export interface RangeValue {
  min: number;
  max: number;
  step: number;
}

export interface ReferenceValue {
  reference: any;
}

export type ValueType =
  | BitValue
  | EnumValue
  | RangeValue
  | ReferenceValue;

export class ModelInfo {
  public constructor(
    public data: ModelData,
  ) {
  }

  public value(name: string): any {
    const data = this.data.Value;

    switch (data.type.toLowerCase()) {
      case 'enum':
        return {
          options: data.option,
        } as EnumValue;

      case 'range':
        return {
          min: data.option.min,
          max: data.option.max,
          step: _.get(data.option, 'step', 1),
        } as RangeValue;

      case 'bit': {
        const bitValues = Object.values(data.option).reduce((obj, value) => ({
          ...obj,
          [(value as any).startbit]: (value as any).values,
        }), {});
        return { options: bitValues } as BitValue;
      }

      case 'reference': {
        const [ref] = data.option;
        return { reference: this.data[ref] } as ReferenceValue;
      }

      case 'string':
        return;

      default:
        throw new Error(`Unsupported value type: ${data.type}`);
    }
  }

  public default(name: string) {
    return this.data.Value[name].default;
  }

  public enumValue(key: string, name: string) {
    const options = (this.value(key) as EnumValue).options;
    // invert them pa
    const optionsInv = _.invert(options);

    return optionsInv[name];
  }

  public enumName(key: string, value: string) {
    const options = (this.value(key) as EnumValue).options;
    if (!(value in options)) {
      return null;
    }

    return options[value];
  }

  public referenceName(key: string, value: any): string | null {
    const val = String(value);
    const reference = (this.value(key) as ReferenceValue).reference;

    if (value in reference) {
      return reference[value]._comment;
    }

    return null;
  }

  public get binaryMonitorData() {
    return this.data.Monitoring.type === 'BINARY(BYTE)';
  }

  public decodeMonitorBinary(data: any) {
    const decoded: { [key: string]: any } = {};

    for (const item of this.data.Monitoring.protocol) {
      const key = item.value;
      let value = 0;

      for (let i = item.startByte; i < item.startByte + item.length; i++) {
        const v = data[i];
        value = (value << 8) + value;
        decoded[key] = String(value);
      }
    }

    return decoded;
  }

  public decodeMonitor(data: any) {
    if (this.binaryMonitorData) {
      return this.decodeMonitorBinary(data);
    }

    return data;
  }

}
