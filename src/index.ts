/* eslint-disable import/first */
import * as path from 'path';
import { isProd } from '@utils/index';

require('dotenv').config({
  path: isProd() ? path.resolve('../.env') : path.resolve('../.env.dev')
})

import { RobotFactory, Session, Logger } from 'lemon-bot';
import getDatabase from './db/get_database';
import { initCollections } from './db/init';
import { initCrontabs } from './crontabs/init';
import getRedisClient from './redis/get_redis';
import { StudyBotCommandContext } from './commands/study_bot/types';
import { SyncBotCommandContext } from './commands/sync_bot/types';
import getESClient from './es/get_es_client';
import studyBotCommands from './commands/study_bot';
import syncBotCommands from './commands/sync_bot';
import { syncBotHttpPlugin, studyBotHttpPlugin } from './http_plugins';
import { wordCollection, trashCollection, questionCollection, qqSyncCollection } from './db/collections';

process.on('uncaughtException', err => {
  console.error('未捕获异常：');
  console.error(err);
});
process.on('unhandledRejection', err => {
  console.error('未捕获的Rejection异常：');
  console.error(err);
});

async function main(): Promise<void> {
  try {
    // 数据库和redis务必在程序启动时进行初始化！ 从而避免race condition
    await getDatabase();
    const redis = getRedisClient();
    const es = getESClient();

    await initCollections();
    await initCrontabs();

    const studyRobot = RobotFactory.create<StudyBotCommandContext>({
      port: 8888,
      robot: +process.env.Study_Bot!,
      httpPlugin: studyBotHttpPlugin,
      session: new Session(getRedisClient()),
      commands: studyBotCommands,
      context: {
        redis,
        es,
        wordCollection,
        trashCollection,
        questionCollection,
      },
    });
    const syncRobot = RobotFactory.create<SyncBotCommandContext>({
      port: 8888,
      robot: +process.env.Sync_Bot!,
      httpPlugin: syncBotHttpPlugin,
      session: new Session(getRedisClient()),
      commands: syncBotCommands,
      context: {
        redis,
        qqSyncCollection,
      },
    });

    await studyRobot.start();
    await syncRobot.start();
  } catch (e) {
    console.error(e);
  }
}

if (!isProd()) {
  Logger.enableDebug()
}

main();
