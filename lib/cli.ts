import { ValueType } from './core/model-info';
import { NotLoggedInError } from './core/errors';
import { Client } from './client';
import { Auth } from './core/auth';
import { Gateway } from './core/gateway';
import commander from 'commander';
import * as constants from './core/constants';

import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import { Monitor } from './core/monitor';

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
  .action(async () => {
    const { country, language, statePath } = options;
    const client = await init(country, language, statePath);

    for (const device of client.devices) {
      console.info(String(device));
    }

    saveState(statePath, client);
  });

program
  .command('monitor <deviceId>')
  .description('Monitor any device, displaying generic information about its status.')
  .option('-v --verbose', 'like debug')
  .action(async (deviceId: string, { verbose }) => {
    const { country, language, statePath } = options;
    const client = await init(country, language, statePath);

    const device = await client.getDevice(deviceId);
    const modelInfo = await client.getModelInfo(device);

    saveState(statePath, client);

    const monitor = new Monitor(client.session!, deviceId);
    await monitor.start();

    try {
      for (; ;) {
        await delay(1000);
        console.info('polling...');

        try {
          const data = await monitor.poll();
          if (!data) {
            continue;
          }

          const resp = modelInfo.decodeMonitor(data);
          for (const [key, value] of Object.entries(resp)) {
            try {
              const desc = modelInfo.value(key);
              if (!desc) {
                console.info('-', `${key}:`, value);
                continue;
              }

              switch (desc.type) {
                case ValueType.Enum:
                  console.info('-', `${key}:`, desc.options[value as any] || value);
                  break;

                case ValueType.Range:
                  console.info('-', `${key}:`, `${value} (${desc.min}-${desc.max})`);
                  break;

                case ValueType.StringComment:
                  console.info('-', `${key}:`, `(comment) ${desc.comment}`);
                  break;
              }
            } catch (e) {
              console.error(e);
            }
          }
        } catch (e) {
          if (e instanceof NotLoggedInError) {
            await client.refresh();
            console.info(client.devices);
          }

          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      await monitor.stop();
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
