export class NotLoggedInError extends Error {
  public name = 'NotLoggedInError';
}

export class NotConnectedError extends Error {
  public name = 'NotConnectedError';
}

export class APIError extends Error {
  public name = 'APIError';

  public constructor(
    public code: string,
    public message: string,
  ) {
    super(message);
  }
}

export class TokenError extends Error {
  public name = 'TokenError';

  public constructor() {
    super('An authentication token was rejected.');
  }
}

export class MonitorError extends Error {
  public name = 'MonitorError';

  public constructor(
    public deviceId: string,
    public code: string,
  ) {
    super('Monitoring a device failed, possibly because the monitoring session failed and needs to be restarted.');
  }
}
