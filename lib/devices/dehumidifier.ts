import { Device } from '../core/device';
import { asEnum, lookupEnum } from '../utils';

export enum DehumidifierOperationMode {
  SLEEP = '@AP_MAIN_MID_OPMODE_SLEEP_W',
  SILENT = '@AP_MAIN_MID_OPMODE_SILENT_W',
  /** should be silent */
  CLIENT = '@AP_MAIN_MID_OPMODE_CILENT_DEHUM_W',
  AUTO = '@AP_MAIN_MID_OPMODE_AUTO_W',
  SMART = '@AP_MAIN_MID_OPMODE_SMART_DEHUM_W',
  FAST = '@AP_MAIN_MID_OPMODE_FAST_DEHUM_W',
  CONCENTRATION_DRY = '@AP_MAIN_MID_OPMODE_CONCENTRATION_DRY_W',
  CLOTHING_DRY = '@AP_MAIN_MID_OPMODE_CLOTHING_DRY_W',
}

/**
 * WindStrength
 *
 * As I tested with my Dehumidifier, both Low and High are available.
 */
export enum DehumidifierWindStrength {
  LowestOfTheLow = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_LOWST_LOW_W',
  Lowest = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_LOWST_W',
  Low = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_LOW_W',
  LowMid = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_LOW_MID_W',
  Mid = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_MID_W',
  MidHigh = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_MID_HIGH_W',
  High = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_HIGH_W',
  Power = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_POWER_W',
  Auto = '@AP_MAIN_MID_WINDSTRENGTH_DHUM_AUTO_W',
}

export enum DehumidifierRACMode {
  OFF = '@AP_OFF_W',
  ON = '@AP_ON_W',
}

export enum DehumidifierOperation {
  OFF = '@operation_off',
  ON = '@operation_on',
}

export class DehumidifierDevice extends Device {
  public async poll() {
    if (!this.monitor) {
      return null;
    }

    const resp = await this.monitor.poll();
    if (resp) {
      const data = this.model.decodeMonitor(resp);
      return new DehumidifierStatus(this, data);
    }

    return null;
  }

  /**
   * Turn on or off the device
   * @param isOn
   */
  public async setOn(isOn: boolean) {
    const op = isOn ? DehumidifierOperation.ON : DehumidifierOperation.OFF;
    const opValue = this.model.enumValue('Operation', op);

    await this.setControl('Operation', opValue);
  }

  public async setMode(mode: DehumidifierOperationMode) {
    const opValue = this.model.enumValue('OpMode', mode);

    await this.setControl('OpMode', opValue);
  }

  public async setWindStrength(windStrength: DehumidifierWindStrength) {
    const opValue = this.model.enumValue('WindStrength', windStrength);

    await this.setControl('WindStrength', opValue);
  }

  public async setAirRemoval(airRemoval: DehumidifierRACMode) {
    const opValue = this.model.enumValue('AirRemoval', airRemoval);

    await this.setControl('AirRemoval', opValue);
  }
}

export class DehumidifierStatus {
  public constructor(
    public device: DehumidifierDevice,
    public data: any,
  ) {
  }

  public get mode() {
    const key = lookupEnum('OpMode', this.data, this.device);
    return asEnum(DehumidifierOperationMode, key);
  }

  public get windStrength() {
    const key = lookupEnum('WindStrength', this.data, this.device);
    return asEnum(DehumidifierWindStrength, key);
  }

  public get isAirRemovalOn() {
    const key = lookupEnum('AirRemoval', this.data, this.device);
    return asEnum(DehumidifierRACMode, key) !== DehumidifierRACMode.OFF;
  }

  public get targetHumidity() {
    return Number(this.data.HumidityCfg);
  }

  public get currentHumidity() {
    return Number(this.data.SensorHumidity);
  }

  public get isOn() {
    const key = lookupEnum('Operation', this.data, this.device);
    return asEnum(DehumidifierOperation, key) !== DehumidifierOperation.OFF;
  }
}
