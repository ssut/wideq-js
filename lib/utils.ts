import { Device } from './core/device';

type Not<T> = [T] extends [never] ? unknown : never;
type Extractable<T, U> = Not<U extends any ? Not<T extends U ? unknown : never> : never>;

export function asEnum<E extends Record<keyof E, string | number>, K extends string | number>(
  e: E, k: K & Extractable<E[keyof E], K>
): Extract<E[keyof E], K> {
  // runtime guard, shouldn't need it at compiler time
  if (k && Object.values(e).indexOf(k) < 0) {
    throw new Error("Expected one of " + Object.values(e).join(", ") + '; got ' + k);
  }

  return k as any; // assertion
};

export function lookupEnum(attr: string, data: any, device: Device) {
  /**
   * Looks up an enum value for the provided attr.
   * @param attr: The attribute to lookup in the enum.
   * @param data: The JSON data from the API.
   * @param device: A sub-class instance of a Device.
   * @returns: The enum value.
   */
  return device.model.enumName(attr, data[attr]);
}

export function lookupReference(attr: string, data: any, device: Device) {
/**
 * Look up a reference value for the provided attribute.
 * @param attr: The attribute to find the value for.
 * @param data: The JSON data from the API.
 * @param device: A sub-class instance of a Device.
 * @returns: The looked up value.
 */
  return device.model.referenceName(attr, data[attr]);
}
