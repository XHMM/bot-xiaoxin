import {
  Command,
  ParseParams,
  GroupHandlerParams,
  scope,
  TriggerScope,
  HandlerReturn,
  ParseReturn,
  CQRawMessageHelper,
  trigger,
  TriggerType,
  fromQQGroupNormalMessage, fromQQGroupAnonymousMessage
} from 'lemon-bot';
import { notForSignWaterEmojis, canForSignWaterEmojis } from '@constants/water_emojis';
import { format } from 'date-fns';
import { globalStatusCollection, drinkCollection, qqGroupCollection } from '../../db/collections';
import { StudyBotCommandContext } from './types';
import { RemindService } from '@dbTypes';

const emoji = require('node-emoji');

class Drink1Command extends Command<StudyBotCommandContext> {
  directive(): string[] {
    return ["喝了"];
  }

  parse({ rawMessage }: ParseParams): ParseReturn {
    const msg = CQRawMessageHelper.removeAt(rawMessage);
    const hanziRegexp = /^((已喝)|(喝[了啦])).*/; // 文字
    const emojiRegexp = new RegExp(
      '^(' + [...canForSignWaterEmojis, ...notForSignWaterEmojis].map(item => `(\\${item})`).join('|') + ')$'
    ); // 一个emoji表情
    if (hanziRegexp.test(msg) || emojiRegexp.test(msg)) return true;
  }

  async group(params: GroupHandlerParams):Promise<HandlerReturn> {
    if (fromQQGroupNormalMessage(params)) {
      const date = new Date();
      // 检测全局下是否允许设置已喝
      const { canUpdateRecord, noCupOfToday } = await globalStatusCollection.getDrinkStatus();
      if (canUpdateRecord) {
        // 检测该QQ当前段是否已设置了'已喝'，userDoc为空也表明是未喝
        const userDoc = await drinkCollection.getDrinkUser({
          date,
          qqGroup: params.fromGroup,
          qq: params.fromUser,
        });
        if (userDoc && !userDoc.canUpdateRecord) {
          return `[CQ:emoji,id=128517]你已经喝过第${noCupOfToday}杯水了，要适量哦`;
        }

        const { sex, nickname } = params.requestBody.sender;

        /* // 检测机器人，当提醒发出后，若1.5s内就回应表明是机器人
        const time = drinkTimes[noCupOfToday - 1].time;
        const [h, m] = time.split(":");
        const tmpDate = new Date();
        tmpDate.setHours(+h);
        tmpDate.setMinutes(+m);
        tmpDate.setSeconds(0);
        tmpDate.setMilliseconds(0);
        const isBot = isProd() ? isInSecondsDistance(Date.now(), tmpDate, 1.5) : true;

        if(isBot) {
          res.json({
            reply: `🤕你真的喝了吗，${nickname}？为了打卡而打卡是没有意义的哦，并且后期数据分析也将对你失去意义`,
            at_sender: false
          });
          return;
        }
        // 暂时取消这个
        */

        const updatedUserDoc = await drinkCollection.updateUserDrinkData({
          date: date,
          qqGroup: params.fromGroup,
          qq: params.fromUser || -1,
          drinkTime: date,
        });
        if (updatedUserDoc !== undefined)
          return `${
            sex === 'male' ? '[CQ:emoji,id=128113]' : sex === 'female' ? '[CQ:emoji,id=128120]' : '[CQ:emoji,id=128130]'
          } 按时喝第${noCupOfToday}杯水的${emoji.emojify(nickname)}是${
            sex === 'male' ? '最帅' : sex === 'female' ? '最美' : '最靓'
          }的仔！\n\n目前你共喝了${updatedUserDoc.records.length}杯水，回复[喝水记录]可获取具体记录`;
      } else {
        return '[CQ:emoji,id=128129]现在不是喝水统计时间段，注意提醒时间哦';
      }
    }
  }
}

class Drink2Command extends Command<StudyBotCommandContext> {
  directive(): string[] {
    return ['喝水記錄', '喝水记录'];
  }

  async group(params: GroupHandlerParams):Promise<HandlerReturn> {
    if (fromQQGroupAnonymousMessage(params)) return;
    const { sender, group_id } = params.requestBody;
    const date = new Date();

    const userDoc = await drinkCollection.getDrinkUser({
      date,
      qqGroup: group_id,
      qq: sender.user_id,
    });
    if (userDoc === null || userDoc.records.length === 0) {
      return `[CQ:emoji,id=128565]今天还没有喝水打卡记录`;
    } else {
      const dateStr = userDoc.records.map(item => format(item, 'HH:mm')).join('\n');
      const { noCupOfToday } = await globalStatusCollection.getDrinkStatus(); // 该喝第几杯了
      const drunkCup = userDoc.records.length; // 已喝杯数
      const delta = noCupOfToday - drunkCup; // 差几杯没喝
      const ps = this.getPs(noCupOfToday, delta);
      return `今天的喝水记录如下[CQ:emoji,id=128071]\n\n${dateStr} \n\n[CQ:emoji,id=128582] ${ps}`;
    }
  }

  private getPs(noCupOfToday, delta): string {
    let ps = '我要说啥来着？';
    if (noCupOfToday == 1) {
      if (delta == 0) ps = '第1杯水已Get，斗志昂扬，努力奋斗新的一天吧！';
    }
    if (noCupOfToday == 2) {
      if (delta == 0) ps = '继续冲鸭！';
      if (delta == 1) ps = '出了岔子漏了一杯水，接下来可要坚持住哦';
    }
    if (noCupOfToday == 3) {
      if (delta == 0) ps = '继续冲冲冲鸭！！';
      if (delta == 1) ps = '出了岔子漏了一杯水，坚持住！';
      if (delta == 2) ps = '漏两杯水了呢，但还不是大问题，还有的喝~';
    }
    if (noCupOfToday == 4) {
      if (delta == 0) ps = '坚持一半了，你可以的！';
      if (delta == 1) ps = '少喝了一杯，不过问题不大~';
      if (delta == 2) ps = '少喝了两杯，问题不算太大~';
      if (delta == 3) ps = '哎呀，皮肤在发小牢骚呢：我的水水呢？';
    }
    if (noCupOfToday == 5) {
      if (delta == 0) ps = '生命不止，喝水不息！';
      if (delta == 1) ps = '继续坚持！';
      if (delta == 2) ps = '少喝了两杯，问题不算太大~';
      if (delta == 3) ps = '后面几杯可得按时喝呀';
      if (delta == 4) ps = '皮肤在生气：我要枯萎啦！';
    }
    if (noCupOfToday == 6) {
      if (delta == 0) ps = '你喝水的样子真是一道亮丽的风景线~';
      if (delta == 1) ps = '生命不止，喝水不息！';
      if (delta == 2) ps = '继续坚持！';
      if (delta == 3) ps = '后面几杯要按时喝哦';
      if (delta == 4) ps = '皮肤在发小牢骚呢：我的水水呢？';
      if (delta == 5) ps = '皮肤很生气，快用水哄哄她！';
    }
    if (noCupOfToday <= 7) {
      if (delta == 0) ps = '胜利就在眼前，坚持到底！！';
      if (delta == 1) ps = '你喝水的样子真是一道风景线~';
      if (delta == 2) ps = '皮肤和你相处的很开心';
      if (delta == 3) ps = '皮肤和你相处的还可以';
      if (delta == 4) ps = '皮肤有些小郁闷：水水我好想你';
      if (delta == 5) ps = '你和皮肤闹的有些僵，但还有一线生机，快喝水';
      if (delta == 6) ps = '皮肤很生气，很难哄好她了';
    }
    if (noCupOfToday == 8) {
      if (delta == 0)
        ps =
          'Amazing，你的坚持让人兴奋，让皮肤兴奋，让未来的你兴奋！如果再按时睡个觉，人生巅峰指日可待！如果需要熬夜，那可要也要记得及时补充水分噗，比心~';
      if (delta == 1) ps = '虽然漏掉了一杯，但人生总有缺憾，你最棒！';
      if (delta == 2) ps = '漏掉了两杯，但问题不大，给自己一个biubiu~';
      if (delta == 3) ps = '还可以呦';
      if (delta == 4) ps = '只坚持了一半，你可以喝的更好！';
      if (delta == 5) ps = '虽然只喝了三杯，但你一定是今天太忙碌忘记喝水了，工作学习很重要，但身体更重要哦';
      if (delta == 6) ps = '虽然只喝了两杯，但你一定是今天太忙碌忘记喝水了，工作学习很重要，但身体更重要哦';
      if (delta == 7) ps = '虽然只喝了一杯，但你一定是今天太忙碌忘记喝水了，工作学习很重要，但身体更重要哦';
    }
    return ps;
  }
}

class Drink3Command extends Command<StudyBotCommandContext> {
  directive(): string[] {
    return ['没喝', '不喝'];
  }

  group():HandlerReturn {
    return '不喝水，就让你尝尝甜心超人做的饭';
  }
}

class Drink4Command extends Command<StudyBotCommandContext> {
  directive(): string[] {
    return ['关闭喝水提醒'];
  }

  @scope(TriggerScope.admin|TriggerScope.owner)
  @trigger(TriggerType.at)
  async group({ requestBody }: GroupHandlerParams): Promise<HandlerReturn> {
    const { group_id } = requestBody;
    await qqGroupCollection.switchService(group_id, RemindService.drink, 'off');
    return '喝水提醒已关闭，希望群友们都养成了按时喝水的好习惯\n\nPS: 管理员或群主@并回复[开启喝水提醒]可重新开启提醒';
  }
}

class Drink5Command extends Command<StudyBotCommandContext> {
  directive(): string[] {
    return ['开启喝水提醒', '打开喝水提醒'];
  }

  @scope(TriggerScope.admin|TriggerScope.owner)
  @trigger(TriggerType.at)
  async group({ requestBody }: GroupHandlerParams):Promise<HandlerReturn> {
    const { group_id } = requestBody;
    await qqGroupCollection.switchService(group_id, RemindService.drink, 'on');
    return '喝水提醒已开启，冲鸭！';
  }
}

const drinkCommands = [
  new Drink1Command(),
  new Drink2Command(),
  new Drink3Command(),
  new Drink4Command(),
  new Drink5Command()
]
export default drinkCommands;