import { NotLoggedInError } from './core/errors';
import { Client } from './client';
import { Auth } from './core/auth';
import { Gateway } from './core/gateway';
import commander from 'commander';
import packageJson from '../package.json';
import * as constants from './core/constants';

import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

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
  .version(packageJson.version)
  .option('-C, --country <type>', 'Country code for account', constants.DEFAULT_COUNTRY)
  .on('option:country', (value) => options.country = value)
  .option('-l, --language <type>', 'Language code for account', constants.DEFAULT_LANGUAGE)
  .on('option:language', (value) => options.language = value)
  .option('-S, --state-path <type>', 'State file path', 'wideq-state.json')
  .on('option:statePath', (value) => options.statePath = value);

program
  .command('auth')
  .description('Authenticate')
  .action(async () => {
    const { country, language, statePath } = options;

    const client = await init(country, language, statePath);

    saveState(statePath, client);
  });

program
  .command('ls', { isDefault: true })
  .description('List devices')
  .action(async function (...args) {
    const { country, language, statePath } = options;
    const client = await init(country, language, statePath);

    for (const device of client.devices) {
      console.info(String(device));
    }

    saveState(statePath, client);
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

  await client.updateDevices();

  return client;
}

function saveState(stateFilePath: string, client: Client) {
  fs.writeFileSync(stateFilePath, JSON.stringify(client.toStateObject()));
}

program.parse(process.argv);
