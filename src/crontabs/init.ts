import { logInfo } from '../utils';
import runDrinkCrontab from './crontab_drink';
// import runTrashCrontab from './crontab_trash';
import runCountdownCrontab from './crontab_countdown';

export async function initCrontabs(): Promise<void> {
  try {
    await Promise.all([
      // runTrashCrontab(),
      runDrinkCrontab(),
      runCountdownCrontab(),
    ]);

    logInfo('crontabs started');
  } catch (e) {
    console.error('crontabs start error::::');
    console.error(e);
  }
}
