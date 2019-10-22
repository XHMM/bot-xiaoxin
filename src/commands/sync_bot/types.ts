import { IHandyRedis } from 'handy-redis';
import QQSyncCollection from '../../db/collections/QQSyncCollection';

export interface SyncBotCommandContext {
  redis: IHandyRedis,
  qqSyncCollection: QQSyncCollection
}