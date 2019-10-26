import { createHandyClient, IHandyRedis } from 'handy-redis';

import { logInfo } from '@utils/index';

let client: IHandyRedis;
export default function getRedisClient(): IHandyRedis {
  if (client) return client;
  try {
    client = createHandyClient(process.env.Redis_Endpoint!);
    logInfo("redis client created");
    return client;
  } catch (e) {
    console.error("getRedis error::::");
    console.error(e);
    process.exit(1);
    throw new Error('noop'); // 因为启动了strictNullChecks，这里不return那就只能throw
  }
}
