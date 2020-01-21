import { Device } from '../core/device';
import { asEnum, lookupEnum, lookupEnumLang } from '../utils';

export enum IcePlus {
  OFF = '@CP_OFF_EN_W',
  ON = '@CP_ON_EN_W',
  ICE_PLUS = '@RE_TERM_ICE_PLUS_W',
  ICE_PLUS_FREEZE = '@RE_MAIN_SPEED_FREEZE_TERM_W',
  ICE_PLUS_OFF = '@CP_TERM_OFF_KO_W',
}

export enum FreshAirFilter {
  OFF = '@CP_TERM_OFF_KO_W',
  AUTO = '@RE_STATE_FRESH_AIR_FILTER_MODE_AUTO_W',
  POWER = '@RE_STATE_FRESH_AIR_FILTER_MODE_POWER_W',
  REPLACE_FILTER = '@RE_STATE_REPLACE_FILTER_W',
  SMARTCARE_RUN = '@RE_SMARTCARE_RUN_W',
  SMARTCARE_ON = '@RE_STATE_SMART_SMART_CARE_ON',
  SMARTCARE_OFF = '@RE_STATE_SMART_SMART_CARE_OFF',
  EMPTY = '',
}

export enum SmartSavingMode {
  OFF = '@CP_TERM_USE_NOT_W',
  NIGHT = '@RE_SMARTSAVING_MODE_NIGHT_W',
  CUSTOM = '@RE_SMARTSAVING_MODE_CUSTOM_W',
  EMPTY = '',
}

export enum SmartSavingModeStatus {
  OFF = 'OFF',
  ON = 'ON',
  EMPTY = '',
}

export enum EcoFriendly {
  OFF = '@CP_OFF_EN_W',
  ON = '@CP_ON_EN_W',
}

export enum LockingStatus {
  UNLOCK = 'UNLOCK',
  LOCK = 'LOCK',
  EMPTY = '',
}

export enum DoorOpenState {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  EMPTY = '',
}

export enum TempUnit {
  F = 'Ｆ',
  C = '℃',
  EMPTY = '',
}

export class RefrigeratorDevice extends Device {
  public async poll() {
    if (!this.monitor) {
      return null;
    }

    const resp = await this.monitor.poll();
    if (resp) {
      const data = this.model.decodeMonitor(resp);
      return new RefrigeratorStatus(this, data);
    }

    return null;
  }

  public async setTempRefrigeratorC(temp: number) {
    // {
    //   "RETM":"{{TempRefrigerator}}",
    //   "REFT":"{{TempFreezer}}",
    //   "REIP":"{{IcePlus}}",
    //   "REEF":"{{EcoFriendly}}"
    // }
    const opValue = this.model.enumValue('TempRefrigerator', temp.toString());
    await this.setControl('RETM', opValue);
  }

  public async setTempFreezerC(temp: number) {
    const opValue = this.model.enumValue('TempFreezer', temp.toString());
    await this.setControl('REFT', opValue);
  }
}

export class RefrigeratorStatus {
  public constructor(
    public device: RefrigeratorDevice,
    public data: any,
  ) {
  }

  public get tempRefrigeratorC() {
    const key = lookupEnum('TempRefrigerator', this.data, this.device);
    return Number(key);
  }

  public get tempFreezerC() {
    const key = lookupEnum('TempFreezer', this.data, this.device);
    return Number(key);
  }

  public get icePlusStatus() {
    const key = lookupEnum('IcePlus', this.data, this.device);
    return asEnum(IcePlus, key);
  }

  public get icePlusStatusText() {
    return lookupEnumLang('IcePlus', this.data, this.device);
  }

  public get freshAirFilterStatus() {
    const key = lookupEnum('FreshAirFilter', this.data, this.device);
    return asEnum(FreshAirFilter, key);
  }

  public get energySavingMode() {
    const key = lookupEnum('SmartSavingMode', this.data, this.device);
    return asEnum(SmartSavingMode, key);
  }

  public get doorOpened() {
    const key = lookupEnum('DoorOpenState', this.data, this.device);
    return asEnum(DoorOpenState, key) === DoorOpenState.OPEN;
  }

  public get tempUnit() {
    const key = lookupEnum('TempUnit', this.data, this.device);
    return asEnum(TempUnit, key);
  }

  public get energySavingEnabled() {
    const key = lookupEnum('SmartSavingModeStatus', this.data, this.device);
    return asEnum(SmartSavingModeStatus, key) === SmartSavingModeStatus.ON;
  }

  public get locked() {
    const key = lookupEnum('LockingStatus', this.data, this.device);
    return asEnum(LockingStatus, key) === LockingStatus.LOCK;
  }

  public get activeSavingStatus() {
    return this.data['ActiveSavingStatus']
  }

  public get ecoEnabled() {
    const value = lookupEnum('EcoFriendly', this.data, this.device);
    return asEnum(EcoFriendly, value) === EcoFriendly.ON;
  }

  public get waterFilterUsedMonth() {
    return this.data['WaterFilterUsedMonth']
  }
}
