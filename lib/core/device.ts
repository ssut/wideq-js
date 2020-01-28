import { Monitor } from './monitor';

import { Client } from '../client';
import { DeviceInfo } from './device-info';
import { LangPackModel } from './lang-pack-model';
import { LangPackProduct } from './lang-pack-product';
import { ModelInfo } from './model-info';

export enum OnOffEnum {
  OFF = '@CP_OFF_EN_W',
  ON = '@CP_ON_EN_W',
}

export class Device {
  public model!: ModelInfo;
  public langPackProduct!: LangPackProduct;
  public langPackModel!: LangPackModel;
  public monitor?: Monitor;

  public constructor(
    public client: Client,
    public device: DeviceInfo,
  ) {
  }

  public async poll(): Promise<any> {
    throw new Error('Not implemented.');
  }

  public async load() {
    this.model = await this.client.getModelInfo(this.device);
    this.langPackProduct = await this.client.getLangPackProduct(this.device);
    this.langPackModel = await this.client.getLangPackModel(this.device);
  }

  public async setControl(key: string, value: any) {
    return this.client.session!.setDeviceControls(this.device.id, { [key]: value });
  }

  public async getConfig(key: string) {
    const data = await this.client.session!.getDeviceConfig(this.device.id, key);

    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  }

  public async getControl(key: string) {
    const data = await this.client.session!.getDeviceConfig(this.device.id, key, 'Control');

    // The response comes in a funky key / value format: "(key:value)".
    const value = (data.split(':')[1] || '').slice(0, -1);

    return value;
  }

  public async startMonitor() {
    const monitor = new Monitor(this.client.session!, this.device.id);
    await monitor.start();

    this.monitor = monitor;
  }

  public async stopMonitor() {
    if (!this.monitor) {
      return;
    }

    this.monitor.stop();
  }
}
