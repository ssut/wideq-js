#!/usr/bin/env node

import commander from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import { Client } from './client';
import { Auth } from './core/auth';
import * as constants from './core/constants';
import { NotLoggedInError } from './core/errors';
import { Gateway } from './core/gateway';

const version = fs.existsSync(path.join(__dirname, '../package.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')).toString()).version : '';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const input = (question: string) => new Promise<string>((resolve) => {
  const rl = readline.createInterface(process.stdin, process.stdout);
  rl.question(question, (answer) => resolve(answer));
});

const options = {
  country: constants.DEFAULT_COUNTRY,
  language: constants.DEFAULT_LANGUAGE,
  statePath: 'wideq-state.json',
};

const program = new commander.Command('WideQJS');
program
  .version(version)
  .option('-c, --country <type>', 'Country code for account', constants.DEFAULT_COUNTRY)
  .on('option:country', (value) => options.country = value)
  .option('-l, --language <type>', 'Language code for account', constants.DEFAULT_LANGUAGE)
  .on('option:language', (value) => options.language = value)
  .option('-s, --state-path <type>', 'State file path', 'wideq-state.json')
  .on('option:statePath', (value) => options.statePath = value);

program
  .command('auth')
  .description('Authenticate')
  .action(async () => {
    const { country, language, statePath } = options;

    const client = await init(country, language, statePath);

    console.info('Refresh token: ' + client.auth.refreshToken);

    saveState(statePath, client);
    process.exit(0);
  });

program
  .command('ls', { isDefault: true })
  .description('List devices')
  .action(async () => {
    const { country, language, statePath } = options;
    const client = await init(country, language, statePath);

    for (const device of client.devices) {
      console.info(String(device));
    }

    saveState(statePath, client);
    process.exit(0);
  });

program
  .command('monitor <deviceId>')
  .description('Monitor any device, displaying generic information about its status.')
  .action(async (deviceId: string) => {
    const { country, language, statePath } = options;
    const client = await init(country, language, statePath);

    const dev = await client.getDevice(deviceId);
    saveState(statePath, client);

    await dev.load();
    await dev.startMonitor();
    try {
      for (; ;) {
        await delay(1000);
        console.info('polling...');

        try {

          const status = await dev.poll();
          if (!status) {
            console.info('no status');
            continue;
          }

          const keys = Reflect.ownKeys((status as any).constructor.prototype);
          for (const key of keys) {
            if (typeof key === 'string' && !['constructor'].includes(key)) {
              console.info(`- ${key}: ${String(Reflect.get(status, key))}`);
            }
          }
        } catch (e) {
          if (e instanceof NotLoggedInError) {
            await dev.stopMonitor();
            await client.refresh();
            console.info(client.devices);
          }

          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      await dev.stopMonitor();
    }
  });

async function authenticate(gateway: Gateway) {
  const loginUrl = gateway.oauthUrl;

  console.info('Log in here:', loginUrl);
  const callbackUrl = await input('Then paste the URL where the browser is redirected: ');

  return Auth.fromUrl(gateway, callbackUrl);
}

async function init(country: string, language: string, stateFilePath?: string) {
  let state: any = {};

  if (stateFilePath) {
    if (fs.existsSync(stateFilePath)) {
      try {
        state = JSON.parse(fs.readFileSync(stateFilePath).toString());
      } catch { }
    }
  }

  const client = Client.loadFromState({
    country,
    language,

    ...state,
  });

  if (!client.gateway) {
    client.gateway = await Gateway.discover(country, language);
  }

  if (!client.auth) {
    client.auth = await authenticate(client.gateway);
  }

  if (!client.session && client.auth) {
    ({
      session: client.session,
      items: client.devices,
    } = await client.auth.startSession());
  }

  try {
    await client.updateDevices();
  } catch (e) {
    if (e instanceof NotLoggedInError) {
      await client.refresh();
      await client.updateDevices();
    } else {
      throw e;
    }
  }

  return client;
}

function saveState(stateFilePath: string, client: Client) {
  fs.writeFileSync(stateFilePath, JSON.stringify(client.toStateObject()));
}

program.parse(process.argv);
