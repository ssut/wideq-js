import * as _ from 'lodash';
import * as url from 'url';
import * as uuid from 'uuid';
import { Auth } from './auth';
import { MonitorError } from './errors';
import { requestClient } from './request';

export type WorkId = typeof uuid['v4'];

export class Session {
  public constructor(
    public auth: Auth,
    public sessionId: string,
  ) {
  }

  public async post(path: string, data?: any) {
    const target = url.resolve(this.auth.gateway.apiRoot + '/', path.startsWith('/') ? path.slice(1) : path);
    return requestClient.lgedmPost(target, data, this.auth.accessToken!, this.sessionId);
  }

  public async getDevices() {
    const resp = await this.post('/device/deviceList');

    let { item: items = [] } = resp;
    if (!Array.isArray(items)) {
      items = [items];
    }

    return items;
  }

  public async startMonitor(deviceId: string) {
    const resp = await this.post('rti/rtiMon', {
      cmd: 'Mon',
      cmdOpt: 'Start',
      deviceId,
      workId: uuid.v4(),
    });

    return resp.workId;
  }

  public async pollMonitor(deviceId: string, workId: WorkId) {
    const works = [{ deviceId, workId }];
    const resp = await this.post('rti/rtiResult', { workList: works }).then(resp => resp.workList);

    if (!('returnCode' in resp)) {
      return null;
    }

    const code = _.get(resp, 'returnCode', '');
    if (code !== '0000') {
      throw new MonitorError(deviceId, code);
    }

    if (!('returnData' in resp)) {
      return null;
    }

    return Buffer.from(resp.returnData, 'base64');
  }

  public async stopMonitor(deviceId: string, workId: WorkId) {
    await this.post('rti/rtiMon', {
      cmd: 'Mon',
      cmdOpt: 'Stop',
      deviceId,
      workId,
    });
  }

  public async setDeviceControls(deviceId: string, values: any) {
    return this.post('rti/rtiControl', {
      cmd: 'Control',
      cmdOpt: 'Set',
      value: values,
      deviceId,
      workId: uuid.v4(),
      data: '',
    });
  }

  public async getDeviceConfig(deviceId: string, key: string, category = 'Config'): Promise<any> {
    const resp = await this.post('rti/rtiControl', {
      cmd: category,
      cmdOpt: 'Get',
      value: key,
      deviceId,
      workId: uuid.v4(),
      data: '',
    });

    return resp.returnData;
  }

}
