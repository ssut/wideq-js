import { Device } from '../core/device';
import { lookupEnum, asEnum, lookupReference } from '../utils';

/**
 * The state of the dishwasher device.
 */
export enum DishwasherState {
  INITIAL = '@DW_STATE_INITIAL_W',
  RUNNING = '@DW_STATE_RUNNING_W',
  PAUSED = "@DW_STATE_PAUSE_W",
  OFF = '@DW_STATE_POWER_OFF_W',
  COMPLETE = '@DW_STATE_COMPLETE_W',
  POWER_FAIL = "@DW_STATE_POWER_FAIL_W"
}

/**
 * The process within the dishwasher state.
 */
export enum DishwasherProcess {
  RESERVE = '@DW_STATE_RESERVE_W',
  RUNNING = '@DW_STATE_RUNNING_W',
  RINSING = '@DW_STATE_RINSING_W',
  DRYING = '@DW_STATE_DRYING_W',
  COMPLETE = '@DW_STATE_COMPLETE_W',
  NIGHT_DRYING = '@DW_STATE_NIGHTDRY_W',
  CANCELLED = '@DW_STATE_CANCEL_W'
}

export class DishwasherDevice extends Device {
  public async poll() {
    if (!this.monitor) {
      return null;
    }

    const resp = await this.monitor.poll();
    if (resp) {
      const data = this.model.decodeMonitor(resp);
      return new DishwasherStatus(this, data);
    }

    return null;
  }
}

export class DishwasherStatus {
  public constructor(
    public device: DishwasherDevice,
    public data: any
  ) { }

  public get state() {
    const key = lookupEnum('DishwasherState', this.data, this.device);
    return asEnum(DishwasherState, key);
  }

  public get process() {
    const key = lookupEnum('Process', this.data, this.device);
    return key !== '-' ? asEnum(DishwasherProcess, key) : null;
  }

  public get isOn() {
    return this.state !== DishwasherState.OFF;
  }

  public get remainingTime() {
    return Number(this.data['Remain_Time_H']) * 60 + Number(this.data['Remain_Time_M']);
  }

  public get initialTime() {
    return Number(this.data['Initial_Time_H']) * 60 + Number(this.data['Initial_Time_M']);
  }

  public get reserveTime() {
    return Number(this.data['Reserve_Time_H']) * 60 + Number(this.data['Reserve_Time_M']);
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
