import { ColNames } from '@constants/constants';
import getDatabase from '../db/get_database';
import { studyBotHttpPlugin } from '../http_plugins';
import { qqGroupCollection, qqCollection } from '../db/collections';
import { calcLeftDays } from './utils';
import CrontabBase from './CrontabBase';
import { IQqGroup, IQq } from '@dbTypes';

/* ------------------给所有允许倒计时的qq和qq群进行倒计时提醒 -----------*/

const countdownCrontab = new CrontabBase();

export default async function runCountdownCrontab(): Promise<void> {
  const [qqGroups, qqs] = await Promise.all([
    qqGroupCollection.getUnwindDocumentsForCountdownCrontab(),
    qqCollection.getUnwindDocumentsForCountdownCrontab(),
  ]);

  qqGroups.map(group => {
    registerJobs(group, true);
  });

  qqs.map(qq => {
    registerJobs(qq, false);
  });

  countdownCrontab.run();
  await watchDatabaseChange();
}

// 监听群组和qq的改动，如果变动则重置倒计时任务
async function watchDatabaseChange(): Promise<void> {
  const db = await getDatabase();
  await Promise.all([watch(ColNames.Qq), watch(ColNames.QqGroup)]);

  async function watch(col: ColNames): Promise<void> {
    const changeStream = await db.collection(col).watch([], {
      fullDocument: 'updateLookup',
    });

    const isGroup = col !== ColNames.Qq;

    // https://docs.mongodb.com/manual/reference/change-events/#change-events
    changeStream.on('change', change => {
      const doc = change.fullDocument;
      // console.log(change)
      // 【重要】请勿对qq(群)集合内的文档执行删除操作！因为删除操作changeStream只返回ObjectId，目前我是以number作为键的，所以没法移除被删number的倒计时
      // 另外知：在robo mongodb gui里修改文档触发的是replace事件
      if (['update', 'replace', 'insert'].includes(change.operationType)) {
        if (doc.switch) {
          if (doc.switch.countdown === false) unregisterJobs(doc, isGroup);
          // 开关字段不存在时默认代表true即开启状态
          // 在开启状态下，为了保证正确性，先移除该number的所有jobs，然后重新注册
          else {
            if (Array.isArray(doc.countdowns)) {
              unregisterJobs(doc, isGroup);
              registerJobs(doc, isGroup);
            }
          }
          return;
        }
      }
    });
  }
}

function registerJobs(doc: IQq | IQqGroup, isGroup: boolean): void {
  if (doc.countdowns !== undefined && doc.countdowns.length !== 0) {
    doc.countdowns.map(countdown => {
      countdown.nodes.map((node, idx) => {
        const id = genId(doc, isGroup);
        countdownCrontab.registerJob(id, node, async function() {
          const content = countdown.contents[Math.min(countdown.contents.length, idx)];
          const leftDays = calcLeftDays(Date.now(), countdown.date);
          // 由于startJobs会在changeStream里调用，因此此处需要判断(新的)文档的倒计时过期没，过期的话直接return就行了，此处暂没必要去处理“这个job都无效了啊，应该彻底移除它”，当然你可以选择重启下node应用来解决这个暂无关紧要的问题
          if (leftDays <= 0) return;
          let msg = '';
          if (countdown.variant === 'countdown')
            msg = `距离${countdown.title}还剩${leftDays}天${content ? '，' + content : ''}`;
          if (countdown.variant === 'reminder')
            msg = `${countdown.title}${content ? '，' + content : ''} \n\n[${leftDays}天后结束提醒]`;
          if (isGroup) await studyBotHttpPlugin.sendGroupMsg(doc.number, msg);
          else await studyBotHttpPlugin.sendPrivateMsg(doc.number, msg);
        });
      });
    });
  }
}
function unregisterJobs(doc: IQq | IQqGroup, isGroup: boolean): void {
  const id = genId(doc, isGroup);
  countdownCrontab.unregisterJobs(id);
}
function genId(doc: IQq | IQqGroup, isGroup: boolean): string {
  return `countdown_${isGroup ? 'qq' : 'qqgroup'}${doc.number}`;
}
