import { DeviceType } from './constants';
import { requestClient } from './request';

export interface DeviceData {
  modelNm: string;
  deviceId: string;
  modelJsonUrl: string;
  alias: string;
  deviceType: DeviceType;
}

export class DeviceInfo {
  public constructor(
    public data: DeviceData,
  ) {
  }

  public async loadModelInfo() {
    return requestClient.get(this.modelInfoUrl).then(resp => resp.data);
  }

  public get modelId() {
    return this.data.modelNm;
  }

  public get id() {
    return this.data.deviceId;
  }

  public get modelInfoUrl() {
    return this.data.modelJsonUrl;
  }

  public get name() {
    return this.data.alias;
  }

  public get type() {
    return DeviceType[this.data.deviceType];
  }

  public toString() {
    return `${this.id}: ${this.name} (${this.type} ${this.modelId})`;
  }
}
