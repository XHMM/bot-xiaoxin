import { Command, ParseParams, include, HandlerReturn, ParseReturn, BothHandlerParams, UserHandlerParams } from "lemon-bot";
import { format } from 'date-fns';
import { getTrashType } from '../../third_apis/api_trash';
import { StudyBotCommandContext } from "./types";
import { TrashType, ITrash } from '@dbTypes';
import { DbName, ColNames } from '@constants/constants';

class Trash1Command extends Command {
  directive(): string[] {
    return ["垃圾分类"];
  }

  both(): HandlerReturn {
    return [
      `垃圾分为如下四类:\n\n[CQ:emoji,id=128073]可回收物(Recyclable waste)(蓝色标识)\n指经过加工可以成为生产原料，或者经过整理可以再利用的物品。\n\n[CQ:emoji,id=128073]有害垃圾(Harmful waste)(红色标识)指对我们的人体健康和自然环境造成直接或潜在危害的物质。\n\n[CQ:emoji,id=128073]湿垃圾/厨余垃圾(Kitchen waste)(棕色标识)\n包括居民家庭产生的剩菜剩饭、菜根菜叶、瓜果皮核渣、动物内脏、过期食品等食品类废物以及农贸市场的有机垃圾。\n\n[CQ:emoji,id=128073]干垃圾/其他垃圾(Other waste)(黑色/灰色标识)\n主要包括砖瓦陶瓷、尘土、卫生间废纸、纸巾、烟蒂等难以回收以及暂无回收利用价值的废弃物。`,
      `[CQ:emoji,id=128075]【回复"垃圾(空格)物品名"】可查询物品类别哦，举例: "垃圾 香蕉"，"垃圾   瓷碗"\n\n[CQ:emoji,id=128075]【回复"垃圾分类速记"】获取过目不忘的速记口诀`
    ];
  }
}

// eg: '垃圾 苹果'
class Trash2Command extends Command<StudyBotCommandContext> {
  parse({ rawMessage }: ParseParams): ParseReturn {
    if(/^垃圾\s+.+/.test(rawMessage)) {
      const [, name] = rawMessage.split(/\s+/);
      return {
        name
      };
    }
  }

  async both({ data }: BothHandlerParams<{ name: string }>): Promise<HandlerReturn> {
    const es = this.context.es;
    const collection = this.context.trashCollection;
    const name = data.name;
    const doc = await collection.getDocumentByName(name.toLowerCase());

    // 关键字相似垃圾查询
    const likes = await es
      .search({
        index: `${DbName.toLowerCase()}.${ColNames.Trash.toLowerCase()}`,
        body: {
          query: {
            match: {
              name: name
            }
          }
        }
      })
      .then(result => {
        // console.log(result.body.hits.hits)
        return result.body.hits.hits
          .filter(item => item._source.name !== name)
          .filter(item => item._score >= 1)
          .reduce((acc, cur) => {
            acc[cur._source.name] = cur._source.type;
            return acc;
          }, {});
      });

    if (!doc) {
      const type = await getTrashType(name);
      const date = new Date();
      const newDoc = {
        name,
        lookupCount: 1,
        type: type ? (type as TrashType) : TrashType.未知,
        createdAt: format(date, "YYYY-MM-DD"),
        updatedAt: format(date, "YYYY-MM-DD"),
        valid: 1
      };
      await collection.addDocument(newDoc);
      this.reply(newDoc, likes);
    } else {
      this.reply(doc, likes);
    }
  }

  reply(doc: ITrash, likes: Record<string, TrashType>): string {
    const { name, valid, ps } = doc;
    let type = doc.type;
    let likeStr = "";
    if (Object.keys(likes).length !== 0) {
      likeStr = Object.entries(likes)
        .map(([name, type]) => {
          if (type === TrashType.湿垃圾) return [name, "湿垃圾/厨余垃圾"];
          if (type === TrashType.干垃圾) return [name, "干垃圾/其他垃圾"];
          return [name, type];
        })
        .reduce((acc, [name, type]) => {
          acc += `${name} — ${type}\n`;
          return acc;
        }, likeStr)
        .slice(0, -1); // 去掉最后一个换行
    }

    if (valid === 0) {
      return `${name}应该不属于垃圾${ps ? `，${ps}` : ""}${
        likeStr !== "" ? `\n\n相似查询：\n${likeStr}` : ""
      }`;
    } else {
      if (type === TrashType.未知)
        return `${name}的类型未知，请等待更新${
          likeStr !== "" ? `\n\n相似查询：\n${likeStr}` : ""
        }`;
      else {
        if (type === TrashType.湿垃圾) type = "湿垃圾/厨余垃圾" as any;
        if (type === TrashType.干垃圾) type = "干垃圾/其他垃圾" as any;
        return `${name}是${type}${
          likeStr !== "" ? `\n\n相似查询：\n${likeStr}` : ""
        }`;
      }
    }
  }
}

// eg: '垃圾更新(换行)苹果(换行)垃圾类型(换行)1/0(换行)备注信息(可包含换行空格哦)' // 更新所有相关信息
// eg: '垃圾更新(换行)苹果(换行)垃圾类型(换行)1/0'   // 仅不更新备注信息
class Trash3Command extends Command<StudyBotCommandContext> {
  parse({ rawMessage }: ParseParams): ParseReturn {
    const trashTmp =
      "(" +
      Object.keys(TrashType)
        .map(item => `(${item})`)
        .join("|") +
      ")"; //
    const trashUpdateRegexp = new RegExp(
      `^((垃圾更新)|(更新垃圾))\\r\\n.+?\\r\\n${trashTmp}\\r\\n[10](\\s\\s?(.|\\s)+)?`
    );
    if (trashUpdateRegexp.test(rawMessage)) {
      //如果传来的是没入库的物品，会忽略。
      const ls = rawMessage.split(/\r\n/);
      const [, name, type, valid, ...psArr] = ls; // 这种左边是数组的解构赋值，如果ls没有五位及以上的元素，那么psArr会是一个空数组，可不是undefined哦

      return {
        name,
        type,
        valid: +valid,
        ...(psArr.length !== 0 && { ps: psArr.join("\r\n") })
      };
    }
  }

  @include([1326099664])
  async user({data}: UserHandlerParams<{name: string, type:TrashType, valid: 1|0, ps?: string}>): Promise<HandlerReturn> {
    const collection = this.context.trashCollection;
    const { type, valid, name, ps } = data;
    const ok = await collection.updateDocument(name, {
      type,
      valid: +valid,
      ...(ps && { ps })
    });
    if (ok)
      return `更新成功`
    else {
      return  `更新失败，不存在物品[${name}]或内部错误`;
    }
  }
}

class Trash4Command extends Command {
  directive(): string[] {
    return ["垃圾分类速记"];
  }

  both(): HandlerReturn {
    return `[CQ:emoji,id=128055]猪能吃的是湿垃圾/厨余垃圾\n[CQ:face,id=46]猪不吃的是干垃圾/其他垃圾\n[CQ:emoji,id=128061]猪吃了会死的是有害垃圾\n[CQ:emoji,id=128022]能买猪的是可回收物`;
  }
}

const trashCommands = [
  new Trash1Command(),
  new Trash2Command(),
  new Trash3Command(),
  new Trash4Command()
]
export default trashCommands
