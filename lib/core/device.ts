import { Monitor } from './monitor';

import { Client } from '../client';
import { DeviceInfo } from './device-info';
import { ModelInfo } from './model-info';

export class Device {
  public model!: ModelInfo;
  public monitor?: Monitor;

  public constructor(
    public client: Client,
    public device: DeviceInfo,
  ) {
  }

  public async load() {
    this.model = await this.client.getModelInfo(this.device);
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
    const [, value] = data.split(':').slice(0, -1);

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
