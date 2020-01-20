import { LangPackModel } from './core/lang-pack-model';
import { LangPackProduct } from './core/lang-pack-product';
import { ACDevice } from './devices/ac';
import { DishwasherDevice } from './devices/dishwasher';
import { Auth } from './core/auth';
import { Gateway } from './core/gateway';
import { Session } from './core/session';
import * as constants from './core/constants';
import { Device } from './core/device';
import { DeviceInfo } from './core/device-info';
import { ModelInfo } from './core/model-info';
import { DehumidifierDevice } from './devices/dehumidifier';
import { RefrigeratorDevice } from './devices/refrigerator';
import { DryerDevice } from './devices/dryer';
import { WasherDevice } from './devices/washer';
import { DeviceType } from './core/constants';

export class Client {
  public devices: DeviceInfo[] = [];
  public modelInfo: { [key: string]: any } = {};
  public langPackProduct: { [key: string]: any } = {};
  public langPackModel: { [key: string]: any } = {};

  public constructor(
    public gateway: Gateway,
    public auth: Auth,
    public session: Session | null,
    public country = constants.DEFAULT_COUNTRY,
    public language = constants.DEFAULT_LANGUAGE,
  ) {
  }

  public static async loadFromToken(refreshToken: string, country: string = constants.DEFAULT_COUNTRY, language: string = constants.DEFAULT_LANGUAGE) {
    const gateway = await Gateway.discover(country, language);
    const auth = new Auth(gateway, null, refreshToken);

    const client = new Client(gateway, auth, null, country, language);
    await client.refresh();

    return client;
  }

  public static loadFromState(state: {
    [key in 'gateway' | 'auth' | 'session' | 'modelInfo' | 'country' | 'language' | 'langPackProduct' | 'langPackModel']: any;
  }) {
    let gateway: Gateway;
    let auth: Auth;
    let session: Session;
    let modelInfo: Client['modelInfo'] = {};
    let country: string = constants.DEFAULT_COUNTRY;
    let language: string = constants.DEFAULT_LANGUAGE;
    let lang_pack_product: Client['langPackProduct'] = {};
    let lang_pack_model: Client['langPackModel'] = {};

    for (const key of Object.keys(state)) {
      switch (key) {
        case 'gateway': {
          const data = state.gateway;
          gateway = new Gateway(
            data.authBase,
            data.apiRoot,
            data.oauthRoot,
            data.country || constants.DEFAULT_COUNTRY,
            data.language || constants.DEFAULT_LANGUAGE,
          );
        } break;

        case 'auth': {
          const data = state.auth;
          auth = new Auth(
            gateway!,
            data.accessToken,
            data.refreshToken,
          );
        } break;

        case 'session':
          session = new Session(auth!, state.session);
          break;

        case 'modelInfo':
          modelInfo = state.modelInfo;
          break;

        case 'country':
          country = state.country;
          break;

        case 'language':
          language = state.language;
          break;

        case 'langPackProduct':
          lang_pack_product = state.langPackProduct;
          break;

        case 'langPackModel':
          lang_pack_model = state.langPackModel;
          break;
      }
    }

    const client = new Client(
      gateway!,
      auth!,
      session!,
      country,
      language,
    );
    client.modelInfo = modelInfo;

    return client;
  }

  public toStateObject() {
    return {
      modelInfo: this.modelInfo,

      gateway: !this.gateway
        ? undefined
        : {
          authBase: this.gateway.authBase,
          apiRoot: this.gateway.apiRoot,
          oauthRoot: this.gateway.oauthRoot,
          country: this.gateway.country,
          language: this.gateway.language,
        },

      auth: !this.auth
        ? undefined
        : {
          accessToken: this.auth.accessToken,
          refreshToken: this.auth.refreshToken,
        },

      session: !this.session
        ? undefined
        : this.session.sessionId,

      country: this.country,
      language: this.language,

      langPackProduct: this.langPackProduct,
      langPackModel: this.langPackModel
    };
  }

  public async updateDevices() {
    const devices: any[] = await this.session!.getDevices();
    const deviceInfos = devices.map(device => new DeviceInfo(device));

    this.devices = deviceInfos;
  }

  public async getDeviceInfo(deviceId: string) {
    if (!Array.isArray(this.devices) || this.devices.length === 0) {
      await this.updateDevices();
    }

    return this.devices.find(({ id }) => id === deviceId);
  }

  public async getDevice(deviceId: string) {
    const deviceInfo = await this.getDeviceInfo(deviceId);
    if (!deviceInfo) {
      throw new Error(`Device not found: ${deviceInfo}`);
    }

    await this.getModelInfo(deviceInfo);
    await this.getLangPackProduct(deviceInfo);
    await this.getLangPackModel(deviceInfo);

    switch (deviceInfo.data.deviceType) {
      case DeviceType.AC:
        return new ACDevice(this, deviceInfo);
      case DeviceType.DEHUMIDIFIER:
        return new DehumidifierDevice(this, deviceInfo);
      case DeviceType.DISHWASHER:
        return new DishwasherDevice(this, deviceInfo);
      case DeviceType.DRYER:
        return new DryerDevice(this, deviceInfo);
      case DeviceType.WASHER:
        return new WasherDevice(this, deviceInfo);
      case DeviceType.REFRIGERATOR:
        return new RefrigeratorDevice(this, deviceInfo);
      default:
        // throw new Error(`Not supported productType: ${modelInfo.data.Info.productType}`);
        return new Device(this, deviceInfo);
    }
  }

  public async refresh() {
    this.auth = await this.auth.refresh();

    ({
      session: this.session,
      items: this.devices,
    } = await this.auth.startSession());
  }

  public async getModelInfo(device: DeviceInfo) {
    const url = device.modelInfoUrl;
    if (!(url in this.modelInfo)) {
      this.modelInfo[url] = await device.loadModelInfo();
    }

    return new ModelInfo(this.modelInfo[url]);
  }

  public async getLangPackProduct(device: DeviceInfo) {
    const url = device.langPackProductUrl;
    if (!(url in this.langPackProduct)) {
      this.langPackProduct[url] = await device.loadLangPackProduct();
    }

    return new LangPackProduct(this.langPackProduct[url]);
  }

  public async getLangPackModel(device: DeviceInfo) {
    const url = device.langPackModelUrl;
    if (!(url in this.langPackModel)) {
      this.langPackModel[url] = await device.loadLangPackModel();
    }

    return new LangPackModel(this.langPackModel[url]);
  }
}
