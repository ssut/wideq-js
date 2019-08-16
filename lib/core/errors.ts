export class NotLoggedInError extends Error { }

export class NotConnectedError extends Error { }

export class APIError extends Error {
  public constructor(
    public code: string,
    public message: string,
  ) {
    super(message);
  }
}

export class TokenError extends Error {
  public constructor() {
    super('An authentication token was rejected.');
  }
}

export class MonitorError extends Error {
  public constructor(
    public deviceId: string,
    public code: string,
  ) {
    super('Monitoring a device failed, possibly because the monitoring session failed and needs to be restarted.');
  }
}
