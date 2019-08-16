import * as url from 'url';
import * as qs from 'qs';

import { GATEWAY_URL } from './constants';
import { requestClient } from './request';
import * as constants from './constants';

export class Gateway {
  public constructor(
    public authBase: string,
    public apiRoot: string,
    public oauthRoot: string,
    public country: string,
    public language: string,
  ) {
  }

  public static async getGatewayInfo(countryCode: string, langCode: string) {
    return requestClient.lgedmPost(GATEWAY_URL, { countryCode, langCode });
  }

  public static async discover(country: string, language: string) {
    const gatewayInfo = await this.getGatewayInfo(country, language);

    return new Gateway(
      gatewayInfo.empUri,
      gatewayInfo.thinqUri,
      gatewayInfo.oauthUri,
      country,
      language,
    );
  }

  public get oauthUrl(): string {
    return url.resolve(this.authBase, 'login/sign_in') + qs.stringify({
      country: this.country,
      language: this.language,
      svcCode: constants.SVC_CODE,
      authSvr: 'oauth2',
      client_id: constants.CLIENT_ID,
      division: 'ha',
      grant_type: 'password',
    }, { addQueryPrefix: true });
  }
}
