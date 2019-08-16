import { NotLoggedInError, NotConnectedError, APIError } from './errors';
import axios, { AxiosInstance } from 'axios';

import * as constants from './constants';

const debug = require('debug')('wideq:core:request');

export interface LGEDMAxiosInstance extends AxiosInstance {
  lgedmPost(url: string, data: any, accessToken?: string, sessionId?: string): Promise<any>;
}

const client = axios.create();
client.defaults.headers['post'] = {
  'x-thinq-application-key': constants.APP_KEY,
  'x-thinq-security-key': constants.SECURITY_KEY,
  'Accept': 'application/json',
};

client.interceptors.request.use((config) => {
  debug(' -> %s', config.url);

  return config;
});

client.interceptors.response.use((resp) => {
  debug(' <- %s', resp.config.url);

  return resp;
});

(client as any).lgedmPost = (async (url, data, accessToken, sessionId) => {
  const headers: { [key: string]: string } = {};


  if (typeof accessToken === 'string') {
    headers['x-thinq-token'] = accessToken;
  }
  if (typeof sessionId === 'string') {
    headers['x-thinq-jsessionId'] = sessionId;
  }

  const resp = await client.post(url, { [constants.DATA_ROOT]: data }, {
    headers,
  });
  const out = resp.data[constants.DATA_ROOT];

  if ('returnCd' in out) {
    const code = out.returnCd as string;

    if (code !== '0000') {
      switch (code) {
        case '0102':
          throw new NotLoggedInError();

        case '0106':
          throw new NotConnectedError();

        default:
          const message = (out.returnMsg || '') as string;
          throw new APIError(code, message);
      }
    }

    return out;
  }

}) as LGEDMAxiosInstance['lgedmPost'];

export const requestClient = client as LGEDMAxiosInstance;
