import { Device } from '../core/device';
import { asEnum, lookupEnum } from '../utils';
/**
 * The vertical swing mode for an AC/HVAC device.
 *
 * Blades are numbered vertically from 1 (topmost) to 6.
 * All is 100.
 */
export enum ACVSwingMode {
  OFF = '@OFF',
  ONE = '@1',
  TWO = '@2',
  THREE = '@3',
  FOUR = '@4',
  FIVE = '@5',
  SIX = '@6',
  ALL = '@100',
}

/**
 * The horizontal swing mode for an AC/HVAC device.
 *
 * Blades are numbered horizontally from 1 (leftmost) to 5.
 *
 * Left half goes from 1 - 3, and right half goes from 3 - 5.
 *
 * All is 100.
 */
export enum ACHSwingMode {
  OFF = '@OFF',
  ONE = '@1',
  TWO = '@2',
  THREE = '@3',
  FOUR = '@4',
  FIVE = '@5',
  LEFT_HALF = '@13',
  RIGHT_HALF = '@35',
  ALL = '@100',
}

/**
 * The operation mode for an AC/HVAC device.
 */
export enum ACMode {
  COOL = "@AC_MAIN_OPERATION_MODE_COOL_W",
  DRY = "@AC_MAIN_OPERATION_MODE_DRY_W",
  FAN = "@AC_MAIN_OPERATION_MODE_FAN_W",
  AI = "@AC_MAIN_OPERATION_MODE_AI_W",
  HEAT = "@AC_MAIN_OPERATION_MODE_HEAT_W",
  AIRCLEAN = "@AC_MAIN_OPERATION_MODE_AIRCLEAN_W",
  ACO = "@AC_MAIN_OPERATION_MODE_ACO_W",
  AROMA = "@AC_MAIN_OPERATION_MODE_AROMA_W",
  ENERGY_SAVING = "@AC_MAIN_OPERATION_MODE_ENERGY_SAVING_W",
  ENERGY_SAVER = "@AC_MAIN_OPERATION_MODE_ENERGY_SAVER_W",
}

/**
 * The fan speed for an AC/HVAC device.
 */
export enum ACFanSpeed {
  SLOW = '@AC_MAIN_WIND_STRENGTH_SLOW_W',
  SLOW_LOW = '@AC_MAIN_WIND_STRENGTH_SLOW_LOW_W',
  LOW = '@AC_MAIN_WIND_STRENGTH_LOW_W',
  LOW_MID = '@AC_MAIN_WIND_STRENGTH_LOW_MID_W',
  MID = '@AC_MAIN_WIND_STRENGTH_MID_W',
  MID_HIGH = '@AC_MAIN_WIND_STRENGTH_MID_HIGH_W',
  HIGH = '@AC_MAIN_WIND_STRENGTH_HIGH_W',
  POWER = '@AC_MAIN_WIND_STRENGTH_POWER_W',
  AUTO = '@AC_MAIN_WIND_STRENGTH_AUTO_W',
}

/**
 * Whether a device is on or off.
 */
export enum ACOperation {
  OFF = "@AC_MAIN_OPERATION_OFF_W",
  /** This one seems to mean "on" ? */
  RIGHT_ON = "@AC_MAIN_OPERATION_RIGHT_ON_W",
  LEFT_ON = "@AC_MAIN_OPERATION_LEFT_ON_W",
  ALL_ON = "@AC_MAIN_OPERATION_ALL_ON_W",
}

export class ACDevice extends Device {
  public get f2c(): any {
    const mapping = this.model.value('TempFahToCel');
    if (mapping) {
      if (mapping.type === 'Enum') {
        return Object.entries(mapping.options).reduce((obj, [f, c]) => ({
          ...obj,
          [Number(f)]: c,
         }), {});
      }
    }

    return {};
  }

  public get c2f(): any {
    const mapping = this.model.value('TempCelToFah');
    const out = {};
    if (mapping) {
      if (mapping.type === 'Enum') {
        return Object.entries(mapping.options).reduce((obj, [f, c]) => ({
          ...obj,
          [Number(c)]: c,
         }), {});
      }
    }

    return out;
  }

  public async setCelsius(c: any) {
    await this.setControl('TempCfg', c);
  }

  public async setFahrenheit(f: any) {
    await this.setCelsius(this.f2c[f]);
  }

  /**
   * Turn off or on the device's zones.
   *
   * The `zones` parameter is a list of dicts with these keys:
   * - "No": The zone index. A string containing a number,
   *   starting from 1.
   * - "Cfg": Whether the zone is enabled. A string, either "1" or
   *   "0".
   * - "State": Whether the zone is open. Also "1" or "0".
   */
  public async setZones(zones: any) {
    const onCount: number = zones.reduce((accum: number, zone: any) => accum + Number(zone), 0);
    if (onCount > 0) {
      const zoneCmd = zones.filter((zone: any) => zone.Cfg === '1').map((zone: any) => `${zone.No}_${zone.State}`).join('/');
      await this.setControl('DuctZone', zoneCmd);
    }
  }

  public async getZones() {
    return this.getConfig('DuctZone');
  }

  public async setFanSpeed(speed: ACFanSpeed) {
    const speedValue = this.model.enumValue('WindStrength', speed);
    await this.setControl('WindStrength', speedValue);
  }

  public async setHorizontalSwing(swing: ACHSwingMode) {
    const swingValue = this.model.enumValue('WDirHStep', swing);
    await this.setControl('WDirHStep', swingValue);
  }

  public async setVerticalSwing(swing: ACVSwingMode) {
    const swingValue = this.model.enumValue('WDirVStep', swing);
    await this.setControl('WDirVStep', swingValue);
  }

  public async setMode(mode: ACMode) {
    await this.setControl('OpMode', mode);
  }

  public async setOn(isOn: boolean) {
    const op = isOn ? ACOperation.RIGHT_ON : ACOperation.OFF;
    const opValue = this.model.enumValue('OpMode', op);

    await this.setControl('OpMode', opValue);
  }

  public async getFilterState() {
    return this.getConfig('Filter');
  }

  public async getMFilterState() {
    return this.getConfig('MFilter');
  }

  public async getEnergyTarget() {
    return this.getConfig('EnergyDesiredValue');
  }

  public async getLight() {
    const value = await this.getControl('DisplayControl');
    return value === '0';
  }

  public async getVolume() {
    const value = this.getControl('SpkVolume');
    return Number(value);
  }

  public async poll() {
    if (!this.monitor) {
      return null;
    }

    const resp = await this.monitor.poll();
    if (resp) {
      const data = this.model.decodeMonitor(resp);
      return new ACStatus(this, data);
    }

    return null;
  }
}
export class ACStatus {
  public constructor(
    public ac: ACDevice,
    public data: any
  ) { }

  public get currentTempInCelsius() {
    return Number(this.data.TempCur);
  }

  public get currentTempInFahrenheit() {
    return Number(this.ac.c2f[this.currentTempInCelsius]);
  }

  public get targetTempInCelsius() {
    return Number(this.data.TempCfg);
  }

  public get targetTempInFahrenheit() {
    return Number(this.ac.c2f[this.targetTempInCelsius]);
  }

  public get mode() {
    const key = lookupEnum('OpMode', this.data, this.ac);
    const op = asEnum(ACMode, key);

    return op;
  }

  public get fanSpeed() {
    const key = lookupEnum('WindStrength', this.data, this.ac);
    const fanSpeed = asEnum(ACFanSpeed, key);

    return fanSpeed;
  }

  public get HorizontalSwing() {
    const key = lookupEnum('WDirHStep', this.data, this.ac);
    const swing = asEnum(ACOperation, key);

    return swing;
  }

  public getVerticalSwing() {
    const key = lookupEnum('WDirVStep', this.data, this.ac);
    const swing = asEnum(ACOperation, key);

    return swing;
  }

  public get isOn() {
    const key = lookupEnum('Operation', this.data, this.ac);
    const op = asEnum(ACOperation, key);

    return op !== ACOperation.OFF;
  }
}
