import { MonitorError } from './errors';
import { Session, WorkId } from './session';

export class Monitor {
  public workId?: WorkId;

  public constructor(
    public session: Session,
    public deviceId: string,
  ) {
  }

  public async start() {
    this.workId = await this.session.startMonitor(this.deviceId);
  }

  public async stop() {
    this.workId && await this.session.stopMonitor(this.deviceId, this.workId);
  }

  public async poll() {
    if (!this.workId) {
      return null;
    }

    try {
      return await this.session.pollMonitor(this.deviceId, this.workId);
    } catch (e) {
      if (e instanceof MonitorError) {
        await this.stop();
        await this.start();
      } else {
        throw e;
      }
    }

    return null;
  }
}
