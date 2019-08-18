import { Device } from './../core/device';
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
export enum ACOp {
  OFF = "@AC_MAIN_OPERATION_OFF_W",
  /** This one seems to mean "on" ? */
  RIGHT_ON = "@AC_MAIN_OPERATION_RIGHT_ON_W",
  LEFT_ON = "@AC_MAIN_OPERATION_LEFT_ON_W",
  ALL_ON = "@AC_MAIN_OPERATION_ALL_ON_W",
}

export class ACDevice extends Device {
  public get f2c() {
    const mapping = this.model.value('TempFahToCel');
    if (mapping) {
      if (mapping.type === 'Enum') {
      }
    }

    return null;
  }

}
