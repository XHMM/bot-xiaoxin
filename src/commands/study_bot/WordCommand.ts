import {
  Command,
  ParseParams,
  BothHandlerParams,
  ParseReturn,
  HandlerReturn,
  fromQQGroupMessage,
  fromUserMessage,
} from 'lemon-bot';
import getWordTranslation from '../../third_apis/api_word';
import { StudyBotCommandContext } from './types';
import { sleep } from '@utils/index';

export default class WordCommand extends Command<StudyBotCommandContext> {
  parse({ rawMessage }: ParseParams): ParseReturn {
    if (/^单词\s.+/.test(rawMessage)) {
      let [, word] = /单词\s+(.+)/.exec(rawMessage)!;
      word = word.trim();
      return {
        word,
      };
    }
  }

  async both(params: BothHandlerParams<{ word: string }>): Promise<HandlerReturn> {
    const collection = this.context.wordCollection;
    const redis = this.context.redis;

    const word = params.data.word;
    const dbResult = await collection.findDocumentsByEnglishName(word);
    let numbers: {
      userNumber?: number,
      groupNumber?: number
    } = {};

    if (fromQQGroupMessage(params))
      numbers = {
        groupNumber: params.fromGroup,
      };
    if (fromUserMessage(params))
      numbers = {
        userNumber: params.fromUser,
      };

    if (dbResult.length !== 0) {
      await this.replyContents(word, dbResult, numbers);
      return;
    }

    // 如果数据库没有该单词时:
    const redisKey = this.genRedisKey(word);
    const redisResult = await redis.hgetall(redisKey);
    // 先看下redis里的标识，看下是否已经爬虫过该单词了，如果爬过了，则在一定时间内不会再爬，降低压力
    if (redisResult && redisResult.crawled === 'yes')
      return '暂未找到该单词的释义';

    await this.httpPlugin.sendMsg(numbers, '查询中，请稍后...');
    // 如果redis的标识是没有爬过 或 标识已过期，则请求爬虫
    const translation = await getWordTranslation(word);
    if (translation === undefined) {
      await redis.hmset(redisKey, ['crawled', 'yes']);
      // 数据库没释义的单词如果已经爬过了，则等3天后再爬
      await redis.expire(redisKey, 60 * 60 * 24 * 2);
      return '单词查询失败，可能的原因有：\n1. 确实找不到该单词的释义\n2. 单词里包含了英文字母和中线以外的其他字符\n3. 服务器瓦特了';
    } else {
      await collection.insertDocuments(
        translation.map(item => {
          return {
            origin: word,
            ...item,
          };
        })
      );
      await this.replyContents(word, translation, numbers);
    }
  }

  async replyContents(word: string, means: any[], { userNumber, groupNumber }: Partial<Record<'userNumber'|'groupNumber', number>>): Promise<void> {
    const LIMIT = 1000; // qq消息大于1500左右就被截断了，所以这里自己拆分下，然后多次发送。
    const paragraphs: string[] = [`[${word}]的释义如下(结果来自金山词霸柯林斯词典)：`];
    let tmpParagraph = '';
    means.map((item, idx) => {
      const s1 =
        `${idx + 1}. ${item.type} ${item.chinese}\n${item.english}${
          item.sentences.length === 0 ? '' : '\n'
        }${item.sentences.map(s => `- ${s.english}\n  ${s.chinese}`).join('\n')}` + '\n\n';

      const dryRun = tmpParagraph + s1;
      if (dryRun.length > LIMIT) {
        paragraphs.push(tmpParagraph);
        tmpParagraph = s1;
      } else tmpParagraph = dryRun;
    });
    paragraphs.push(tmpParagraph);

    for (const p of paragraphs) {
      await sleep(500);
      await this.httpPlugin.sendMsg(
        {
          userNumber,
          groupNumber,
        },
        p.trim()
      );
    }
  }

  genRedisKey(word: string): string {
    return `单词_${word}`;
  }
}
