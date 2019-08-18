import { asEnum } from './../utils';
import { Device } from '../core/device';

export enum DehumidiferOperationMode {
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
 * As I tested with my dehumidifer, both Low and High are available.
 */
export enum DehumidiferWindStrength {
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

export enum DehumidiferRACMode {
  OFF = '@AP_OFF_W',
  ON = '@AP_ON_W',
}

export enum DehumidiferOperation {
  OFF = '@operation_off',
  ON = '@operation_on',
}

export class DehumidifierDevice extends Device {
  public async poll() {
    if (!this.monitor) {
      return null;
    }

    const resp = await this.monitor.pollObject();
    if (resp) {
      return new DehumidiferStatus(this, resp);
    }

    return null;
  }

  /**
   * Turn on or off the device
   * @param isOn
   */
  public async setOn(isOn: boolean) {
    const op = isOn ? DehumidiferOperation.ON : DehumidiferOperation.OFF;
    const opValue = this.model.enumValue('Operation', op);

    await this.setControl('Operation', opValue);
  }

  public async setMode(mode: DehumidiferOperationMode) {
    const opValue = this.model.enumValue('OpMode', mode);

    await this.setControl('OpMode', opValue);
  }

  public async setWindStrength(windStrength: DehumidiferWindStrength) {
    const opValue = this.model.enumValue('WindStrength', windStrength);

    await this.setControl('WindStrength', opValue);
  }

  public async setAirRemoval(airRemoval: DehumidiferRACMode) {
    const opValue = this.model.enumValue('AirRemoval', airRemoval);

    await this.setControl('AirRemoval', opValue);
  }
}

export class DehumidiferStatus {
  public constructor(
    public dehumidifer: DehumidifierDevice,
    public data: any,
  ) {
  }

  public get mode() {
    const key = this.dehumidifer.model.enumName('OpMode', this.data['OpMode']);
    const mode = asEnum(DehumidiferOperationMode, key);

    return mode;
  }

  public get windStrength() {
    const key = this.dehumidifer.model.enumName('WindStrength', this.data['WindStrength']);
    const windStrength = asEnum(DehumidiferWindStrength, key);

    return windStrength;
  }

  public get isAirRemovalOn() {
    const key = this.dehumidifer.model.enumName('AirRemoval', this.data['AirRemoval']);
    const racMode = asEnum(DehumidiferRACMode, key);

    return racMode !== DehumidiferRACMode.OFF;
  }

  public get targetHumidity() {
    return Number(this.data.HumidityCfg);
  }

  public get currentHumidity() {
    return Number(this.data.SensorHumidity);
  }

  public get isOn() {
    const key = this.dehumidifer.model.enumName('Operation', this.data['Operation']);
    const op = asEnum(DehumidiferOperation, key);

    return op !== DehumidiferOperation.OFF;
  }
}
