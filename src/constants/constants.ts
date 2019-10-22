import { isProd } from '@utils/index';

/*-------------------------------------------------------*/
/*-------------------可不修改的信息-----------------------*/
/*------------------------------------------------------*/
// 数据库集合名
export enum ColNames {
  Drink = 'drink',
  Trash = 'trash',
  GlobalStatus = 'global_status',
  QqGroup = 'qq_groups',
  Qq = 'qqs',
  Question = 'questions',
  Word = 'words',
  QqSync = 'qq_sync'
}

/*-------------------------------------------------------*/
/*------------------需要自定义修改的信息-------------------*/
/*------------------------------------------------------*/
// 在垃圾定时任务里使用到该QQ号 TODO
export const Admin_Numbers = [1326099664];
// 机器人1QQ TODO
export const Study_Bot = isProd() ? 1326099664 : 1326099664;
// 机器人2QQ TODO
export const Sync_Bot = isProd() ? 1326099664 : 1326099664;

// HTTP插件的监听端口 TODO
export const StudyBot_Http_Plugin_Endpoint = 'http://localhost:5700'
// HTTP插件的监听端口 TODO
export const SyncBot_Http_Plugin_Endpoint = 'http://localhost:5701'
// elasticsearch TODO
export const ES_Endpoint = 'http://127.0.0.1:9200';
// redis TODO
export const Redis_Endpoint = 'redis://localhost:6379';
// mongodb数据库名
export const DbName = 'qqBot';
// 数据库连接地址 TODO
export const Database_Endpoint = isProd() ? `mongodb://localhost:27017,localhost:27018/${DbName}?replicaSet=local` : `mongodb://localhost:27017,localhost:27018/${DbName}?replicaSet=local`
// isProd时的数据库启用了验证  TODO
export const DB_Auth = {
  user: "xx",
  password: "xx"
}
// 问题命令使用了加密 TODO
export const Question_Secret = {
  key: 'xx',
  iv: 'xx'
}