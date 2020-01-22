import * as assert from 'assert';
import crypto from 'crypto';
import { DateTime } from 'luxon';
import * as qs from 'qs';
import { resolve as resolveUrl, URL } from 'url';

import * as constants from './constants';
import { TokenError } from './errors';
import { Gateway } from './gateway';
import { requestClient } from './request';
import { Session } from './session';

export class Auth {
  public constructor(
    public gateway: Gateway,
    public accessToken: string | null,
    public refreshToken: string,
  ) {
  }

  public static fromUrl(gateway: Gateway, url: string) {
    const urlObject = new URL(url);
    const params = qs.parse(urlObject.search.slice(1));

    assert.ok('access_token' in params);
    assert.ok('refresh_token' in params);

    const accessToken = params.access_token;
    const refreshToken = params.refresh_token;

    return new Auth(gateway, accessToken, refreshToken);
  }

  public static async login(apiRoot: string, accessToken: string, countryCode: string, langCode: string) {
    const url = resolveUrl(apiRoot + '/', 'member/login');
    const data = {
      countryCode,
      langCode,
      loginType: 'EMP',
      token: accessToken,
    };

    return requestClient.lgedmPost(url, data);
  }

  public async startSession(): Promise<{ session: Session, items: any[] }> {
    const sessionInfo = await Auth.login(
      this.gateway.apiRoot,
      this.accessToken!,
      this.gateway.country,
      this.gateway.language,
    );
    const sessionId = sessionInfo.jsessionId;

    return {
      session: new Session(this, sessionId),
      items: sessionInfo.items ? (
        Array.isArray(sessionInfo.items) ? sessionInfo.items : [sessionInfo.items]
      ) : [],
    };
  }

  public static oauth2Signature(message: string, secret: string) {
    return crypto.createHmac('sha1', Buffer.from(secret)).update(message).digest('base64');
  }

  public static async refreshAuth(oauthRoot: string, refreshToken: string) {
    const tokenUrl = resolveUrl(oauthRoot + '/', 'oauth2/token');
    const data = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const timestamp = DateTime.utc().toRFC2822();

    const requestUrl = '/oauth2/token' + qs.stringify(data, { addQueryPrefix: true });
    const signature = this.oauth2Signature(`${requestUrl}\n${timestamp}`, constants.OAUTH_SECRET_KEY);

    const headers = {
      'lgemp-x-app-key': constants.OAUTH_CLIENT_KEY,
      'lgemp-x-signature': signature,
      'lgemp-x-date': timestamp,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const resp = await requestClient.post(tokenUrl, qs.stringify(data), { headers }).then(resp => resp.data);
    if (resp.status !== 1) {
      throw new TokenError();
    }

    return resp.access_token as string;
  }

  public async refresh() {
    const newAccessToken = await Auth.refreshAuth(this.gateway.oauthRoot, this.refreshToken);

    return new Auth(this.gateway, newAccessToken, this.refreshToken);
  }
}
