import { Device } from '../core/device';
import { asEnum, asTime, lookupEnum, lookupReference } from '../utils';

/**
 * The state of the dryer device.
 */
export enum DryerState {
  COOLING = '@WM_STATE_COOLING_W',
  END = '@WM_STATE_END_W',
  ERROR = '@WM_STATE_ERROR_W',
  DRYING = '@WM_STATE_DRYING_W',
  INITIAL = '@WM_STATE_INITIAL_W',
  OFF = '@WM_STATE_POWER_OFF_W',
  PAUSE = '@WM_STATE_PAUSE_W',
  RUNNING = '@WM_STATE_RUNNING_W',
  SMART_DIAGNOSIS = '@WM_STATE_SMART_DIAGNOSIS_W',
  WRINKLE_CARE = '@WM_STATE_WRINKLECARE_W',
}

/**
 * Represents the dry level setting of the dryer.
 */
export enum DryLevel {
  CUPBOARD = '@WM_DRY27_DRY_LEVEL_CUPBOARD_W',
  DAMP = '@WM_DRY27_DRY_LEVEL_DAMP_W',
  EXTRA = '@WM_DRY27_DRY_LEVEL_EXTRA_W',
  IRON = '@WM_DRY27_DRY_LEVEL_IRON_W',
  LESS = '@WM_DRY27_DRY_LEVEL_LESS_W',
  MORE = '@WM_DRY27_DRY_LEVEL_MORE_W',
  NORMAL = '@WM_DRY27_DRY_LEVEL_NORMAL_W',
  OFF = '-',
  VERY = '@WM_DRY27_DRY_LEVEL_VERY_W',
}

/**
 * A dryer error.
 */
export enum DryerError {
  ERROR_AE = '@WM_US_DRYER_ERROR_AE_W',
  ERROR_CE1 = '@WM_US_DRYER_ERROR_CE1_W',
  ERROR_DE4 = '@WM_WW_FL_ERROR_DE4_W',
  ERROR_DOOR = '@WM_US_DRYER_ERROR_DE_W',
  ERROR_DRAINMOTOR = '@WM_US_DRYER_ERROR_OE_W',
  ERROR_EMPTYWATER = '@WM_US_DRYER_ERROR_EMPTYWATER_W',
  ERROR_F1 = '@WM_US_DRYER_ERROR_F1_W',
  ERROR_LE1 = '@WM_US_DRYER_ERROR_LE1_W',
  ERROR_LE2 = '@WM_US_DRYER_ERROR_LE2_W',
  ERROR_NOFILTER = '@WM_US_DRYER_ERROR_NOFILTER_W',
  ERROR_NP = '@WM_US_DRYER_ERROR_NP_GAS_W',
  ERROR_PS = '@WM_US_DRYER_ERROR_PS_W',
  ERROR_TE1 = '@WM_US_DRYER_ERROR_TE1_W',
  ERROR_TE2 = '@WM_US_DRYER_ERROR_TE2_W',
  ERROR_TE5 = '@WM_US_DRYER_ERROR_TE5_W',
  ERROR_TE6 = '@WM_US_DRYER_ERROR_TE6_W',
}

/**
 * Represents temperature control setting.
 */
export enum TempControl {
  OFF = '-',
  ULTRA_LOW = '@WM_DRY27_TEMP_ULTRA_LOW_W',
  LOW = '@WM_DRY27_TEMP_LOW_W',
  MEDIUM = '@WM_DRY27_TEMP_MEDIUM_W',
  MID_HIGH = '@WM_DRY27_TEMP_MID_HIGH_W',
  HIGH = '@WM_DRY27_TEMP_HIGH_W',
}

/**
 * Represents a timed dry setting.
 */
export enum TimeDry {
  OFF = '-',
  TWENTY = '20',
  THIRTY = '30',
  FOURTY = '40',
  FIFTY = '50',
  SIXTY = '60',
}

export class DryerDevice extends Device {
  public async poll() {
    if (!this.monitor) {
      return null;
    }

    const resp = await this.monitor.poll();
    if (resp) {
      const data = this.model.decodeMonitor(resp);
      return new DryerStatus(this, data);
    }

    return null;
  }
}

export class DryerStatus {
  public constructor(
    public device: DryerDevice,
    public data: any,
  ) { }

  public get state() {
    const key = lookupEnum('State', this.data, this.device);
    return asEnum(DryerState, key);
  }

  public get previousState() {
    const key = lookupEnum('PreState', this.data, this.device);
    return asEnum(DryerState, key);
  }

  public get dryLevel() {
    const key = lookupEnum('DryLevel', this.data, this.device);
    return asEnum(DryLevel, key);
  }

  public get temperatureControl() {
    const key = lookupEnum('TempControl', this.data, this.device);
    return asEnum(TempControl, key);
  }

  public get timeDry() {
    const key = lookupEnum('TimeDry', this.data, this.device);
    return asEnum(TimeDry, key);
  }

  public get isOn() {
    return this.state !== DryerState.OFF;
  }

  public get remainingTime() {
    return asTime('Remain_Time_H', 'Remain_Time_M', this.data);
  }

  public get initialTime() {
    return asTime('Initial_Time_H', 'Initial_Time_M', this.data);
  }

  public get course() {
    const value = lookupReference('Course', this.data, this.device);
    return value;
  }

  public get smartCourse() {
    const value = lookupReference('SmartCourse', this.data, this.device);
    return value;
  }

  public get error() {
    const value = lookupReference('Error', this.data, this.device);
    return value;
  }
}
