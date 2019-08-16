export const GATEWAY_URL = 'https://kic.lgthinq.com:46030/api/common/gatewayUriList';
export const APP_KEY = 'wideq';
export const SECURITY_KEY = 'nuts_securitykey';
export const DATA_ROOT = 'lgedmRoot';
export const SVC_CODE = 'SVC202';
export const CLIENT_ID = 'LGAO221A02';
export const OAUTH_SECRET_KEY = 'c053c2a6ddeb7ad97cb0eed0dcb31cf8';
export const OAUTH_CLIENT_KEY = 'LGAO221A02';

export const DEFAULT_COUNTRY = 'US';
export const DEFAULT_LANGUAGE = 'en-US';

export enum DeviceType {
  REFRIGERATOR = 101,
  KIMCHI_REFRIGERATOR = 102,
  WATER_PURIFIER = 103,
  WASHER = 201,
  DRYER = 202,
  STYLER = 203,
  DISHWASHER = 204,
  OVEN = 301,
  MICROWAVE = 302,
  COOKTOP = 303,
  HOOD = 304,
  /** Includes heat pumps, etc., possibly all HVAC devices. */
  AC = 401,
  AIR_PURIFIER = 402,
  DEHUMIDIFIER = 403,
  /** Robot vacuum cleaner? */
  ROBOT_KING = 501,
  ARCH = 1001,
  MISSG = 3001,
  SENSOR = 3002,
  SOLAR_SENSOR = 3102,
  IOT_LIGHTING = 3003,
  IOT_MOTION_SENSOR = 3004,
  IOT_SMART_PLUG = 3005,
  IOT_DUST_SENSOR = 3006,
  EMS_AIR_STATION = 4001,
  AIR_SENSOR = 4003,
}
