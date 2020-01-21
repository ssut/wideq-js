import { Device } from '../core/device';
import { asEnum, asTime, lookupEnum, lookupReference } from '../utils';

/**
 * The state of the washer device.
 */
export enum WasherState {
  ADD_DRAIN = '@WM_STATE_ADD_DRAIN_W',
  COMPLETE = '@WM_STATE_COMPLETE_W',
  DETECTING = '@WM_STATE_DETECTING_W',
  DETERGENT_AMOUNT = '@WM_STATE_DETERGENT_AMOUNT_W',
  DRYING = '@WM_STATE_DRYING_W',
  END = '@WM_STATE_END_W',
  ERROR_AUTO_OFF = '@WM_STATE_ERROR_AUTO_OFF_W',
  FRESH_CARE = '@WM_STATE_FRESHCARE_W',
  FROZEN_PREVENT_INITIAL = '@WM_STATE_FROZEN_PREVENT_INITIAL_W',
  FROZEN_PREVENT_PAUSE = '@WM_STATE_FROZEN_PREVENT_PAUSE_W',
  FROZEN_PREVENT_RUNNING = '@WM_STATE_FROZEN_PREVENT_RUNNING_W',
  INITIAL = '@WM_STATE_INITIAL_W',
  OFF = '@WM_STATE_POWER_OFF_W',
  PAUSE = '@WM_STATE_PAUSE_W',
  PRE_WASH = '@WM_STATE_PREWASH_W',
  RESERVE = '@WM_STATE_RESERVE_W',
  RINSING = '@WM_STATE_RINSING_W',
  RINSE_HOLD = '@WM_STATE_RINSE_HOLD_W',
  RUNNING = '@WM_STATE_RUNNING_W',
  SMART_DIAGNOSIS = '@WM_STATE_SMART_DIAG_W',
  SMART_DIAGNOSIS_DATA = '@WM_STATE_SMART_DIAGDATA_W',
  SPINNING = '@WM_STATE_SPINNING_W',
  TCL_ALARM_NORMAL = 'TCL_ALARM_NORMAL',
  TUBCLEAN_COUNT_ALARM = '@WM_STATE_TUBCLEAN_COUNT_ALRAM_W',
}

export class WasherDevice extends Device {
  public async poll() {
    if (!this.monitor) {
      return null;
    }

    const resp = await this.monitor.poll();
    if (resp) {
      const data = this.model.decodeMonitor(resp);
      return new WasherStatus(this, data);
    }

    return null;
  }
}

export class WasherStatus {
  public constructor(
    public device: WasherDevice,
    public data: any,
  ) { }

  public get state() {
    const key = lookupEnum('State', this.data, this.device);
    return asEnum(WasherState, key);
  }

  public get previousState() {
    const key = lookupEnum('PreState', this.data, this.device);
    return asEnum(WasherState, key);
  }

  public get isOn() {
    return this.state !== WasherState.OFF;
  }

  public get remainingTime() {
    return asTime('Remain_Time_H', 'Remain_Time_M', this.data);
  }

  public get initialTime() {
    return asTime('Initial_Time_H', 'Initial_Time_M', this.data);
  }

  public get course() {
    const value = lookupReference('APCourse', this.data, this.device);
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
