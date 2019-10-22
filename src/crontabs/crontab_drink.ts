import { CronJob } from 'cron';
import { isProd } from '@utils/index';
import { format } from 'date-fns';
import { canForSignWaterEmojis } from '@constants/water_emojis';
import { studyBotHttpPlugin } from '../http_plugins';
import { globalStatusCollection, qqGroupCollection, drinkCollection } from '../db/collections';
import CrontabBase from './CrontabBase';

const emoji = require('node-emoji');

/*------------- 给所有允许喝水提醒的群(未提供个人版)提醒 -------------*/

const drinkTimes = [
  {
    time: '06:30',
    msg: '起床后的一杯温开水，唤醒你的身体机能！',
    duration: 70,
  },
  {
    time: '08:00',
    msg: '学习或工作前来一杯，镇定精神，提升效率',
    duration: 60,
  },
  {
    time: '09:50',
    msg: '学习或工作间隙来一杯，解乏',
    duration: 70,
  },
  {
    time: '12:15',
    msg: '午饭后来一杯，帮助消化，并维持好身材！',
    duration: 45,
  },
  {
    time: '14:30',
    msg: '学习或工作间隙来一杯，提个神！',
    duration: 40,
  },
  {
    time: '17:50',
    msg: '晚饭前来一杯，增加饱足感，避免晚餐时暴饮暴食',
    duration: 15,
  },
  {
    time: '18:15',
    msg: '晚饭后来一杯，帮助消化吸收',
    duration: 45,
  },
  {
    time: '21:30',
    msg: '睡前来一杯，补充睡眠所需水分，但别喝太多哟。如果你是一位准备熬夜的勇士，别忘了奋战途中主动去补充水分哦',
    duration: 120,
  },
];
const drinkCrontab = new CrontabBase();

export default function runDrinkCrontab(): void {
  drinkCrontab.registerJob('drink_reset', '10 0 * * *', async function() {
    await globalStatusCollection.updateDrinkStatus({
      noCupOfToday: 0,
      canUpdateRecord: false,
    });
  });

  // 测试用，无视switch字段
  if (!isProd()) {
    drinkCrontab.registerJob(
      'drink_remind-test',
      '*/10 * * * *',
      createRemind(1, '睡前来一杯，补充睡眠所需水分，但别喝太多哟')
    );
  }

  drinkTimes.map(item => {
    const [h, m] = item.time.split(':');
    drinkCrontab.registerJob(`drink_remind`, `${m} ${h} * * *`, createRemind(item.duration, item.msg));
  });

  drinkCrontab.run();
}

// duration是分钟
function createRemind(duration: number, msg = '') {
  return async () => {
    const { noCupOfToday } = await globalStatusCollection.getDrinkStatus();
    const shouldDrinkNo = Math.min(noCupOfToday + 1, 8);

    const date = new Date();
    date.setMinutes(date.getMinutes() + duration);

    // 每次提醒该喝水了，则将 全局和个人的'可更新记录'字段设为true，运行其更新记录
    await Promise.all([
      globalStatusCollection.updateDrinkStatus({ canUpdateRecord: true }),
      drinkCollection.updateAllUserCanUpdateRecord(true), // TODO: 这里只更新当天的用户的信息就可以了
    ]);
    // random emoji index
    const sign = emoji.emojify(canForSignWaterEmojis[Math.floor(Math.random() * canForSignWaterEmojis.length)]);
    // 获取该机器人加的所有群
    const qqGroupsWithRobotIn = await studyBotHttpPlugin.getGroupList().then(list => {
        return list.map(item => item.group_id);
    }).catch(() => {return []});
    // 获取数据库内关闭了喝水提醒的群
    const qqGroupsWithDrinkRemindOff = await qqGroupCollection.getDocumentsByDrinkRemindSwitch('off').then(docs => {
      return docs.map(doc => doc.number);
    });
    // 最终发送提醒的群
    const enabledGroups = qqGroupsWithRobotIn.filter(item => !qqGroupsWithDrinkRemindOff.includes(item));

    try {
      await Promise.all(
        enabledGroups.map(qq => {
          return studyBotHttpPlugin.sendGroupMsg(
            qq,
            `${sign}第${shouldDrinkNo}杯水\n${sign}这杯水的意义: ${msg}\n\n[CQ:emoji,id=128339]打卡截止时间 ${format(
              date,
              'HH:mm'
            )}\n[CQ:emoji,id=127880]打卡方式: 回复[喝了]或一个与水有关的非脸emoji表情`
          );
        })
      );
    } catch (e) {
      // 这个是判断是否因为禁言而调用失败，若是则不做处理，因为是群机器人被禁言了但是喝水提醒仍是开启的导致
      if (e.retcode && e.retcode === -34) {
        //
      }
      else
        console.error(e)
    }

    // 提醒完毕后，更新至新的杯数
    await globalStatusCollection.updateDrinkStatus({
      noCupOfToday: shouldDrinkNo,
    });
    // 然后设置新的定时任务：过了打卡时间则不允许再更新记录
    new CronJob({
      cronTime: date,
      async onTick() {
        await globalStatusCollection.updateDrinkStatus({
          canUpdateRecord: false,
        });
      },
    }).start();
  };
}
