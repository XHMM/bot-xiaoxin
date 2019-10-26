import { createCipheriv, createDecipheriv } from 'crypto';
import {
  Command,
  ParseParams,
  BothHandlerParams,
  ParseReturn,
  HandlerReturn,
  CQRawMessageHelper, fromQQGroupAnonymousMessage, fromQQGroupMessage
} from 'lemon-bot';
import { conditionalArrayMerge } from '@xhmm/utils';
import { ColNames } from '@constants/constants';
import { questionCollection } from '../../db/collections';
import { StudyBotCommandContext } from './types';

class Question1Command extends Command<StudyBotCommandContext> {
  parse({ rawMessage }: ParseParams): ParseReturn {
    const msg = CQRawMessageHelper.removeAt(rawMessage);
    const createQuestionRegexp = /^(新建|创建)问题\r\n((.|\s)+)/;
    if (createQuestionRegexp.test(msg)) {
      const arr = msg.split('\r\n');
      let question = '';
      let answer = '';

      const replyIndex = arr.findIndex(item => item === '问题注解');
      if (replyIndex === -1) {
        question = arr.slice(1).join('\r\n');
      } else {
        answer = arr.slice(replyIndex + 1).join('\r\n');
        question = arr.slice(1, replyIndex).join('\r\n');
      }
      return {
        question,
        answer,
      };
    }
  }

  async both(params: BothHandlerParams<{ question: string; answer: string }>): Promise<HandlerReturn> {
    const { question, answer } = params.data;
    const collection = this.context.questionCollection;
    if (fromQQGroupAnonymousMessage(params)) return `匿名用户不可创建问题`;
    await collection.insertDocument(
      params.fromUser as number,
      {
        content: question,
        ...(answer && { content2: encrypt(answer) }),
      },
      params.fromGroup
    );
    return '创建成功\n\nPS: 回复[问题]可随机获取已添加问题';
  }
}

class Question2Command extends Command<StudyBotCommandContext> {
  parse({ rawMessage }: ParseParams): ParseReturn {
    const msg = CQRawMessageHelper.removeAt(rawMessage);
    const lookupQuestionRegexp = /^问题\s.+/;
    if (lookupQuestionRegexp.test(msg)) {
      const question = msg.slice(2).trim(); // 2 === "问题".length
      return {
        question: question,
      };
    }
  }

  async both(params: BothHandlerParams<{ question: string }>): Promise<HandlerReturn> {
    try {
      const redisClient = this.context.redis;
      const esClient = this.context.es;
      const collection = this.context.questionCollection;

      const { data } = params;
      let fromUser = typeof params.fromUser === 'object' ? undefined : params.fromUser;
      const fromGroup = typeof params.fromGroup === 'undefined' ? undefined : params.fromGroup;
      // 若是来自群组搜索，则只搜索在该群创建的问题
      if (fromUser) fromUser = undefined;
      const doc = await esClient
        // 应该是分词问题，比如content里包含了"hello 你好"，若搜索"he"搜不到，搜索"你"可以搜到，搜索"hello"可以搜到。中文分词默认是一个汉字一个汉字，英文或数字分词则是以空格来分的！！关于此的解决应该要使用其他分词器，暂不管（这块已笔记）
        .search({
          index: `${process.env.DB_Name!.toLowerCase()}.${ColNames.Question.toLowerCase()}`,
          body: {
            query: {
              bool: {
                filter: conditionalArrayMerge(
                  [],
                  [
                    fromUser !== undefined,
                    {
                      term: {
                        createdBy: fromUser,
                      },
                    },
                  ],
                  [
                    fromGroup !== undefined,
                    {
                      term: {
                        createdIn: fromGroup,
                      },
                    },
                  ]
                ),
                should: {
                  match: {
                    content: data.question,
                  },
                },
              },
            },
          },
        })
        .then(result => {
          if (result.body.hits.max_score === 0) return null;
          else {
            const doc = result.body.hits.hits[0]._source;
            // _source里不包含_id，需要手动加进来
            doc._id = result.body.hits.hits[0]._id;
            return doc;
          }
        });
      let reply = '';
      if (doc === null)
        reply = `未找到相关问题\n\n搜索建议：若含有英文，请保证单词的完整性，比如应输入"hello"而不能是"hel"`;
      else {
        const [count] = await Promise.all([
          collection.getDocumentsCount(fromUser, fromGroup),
          storeContent2ToRedis(redisClient, doc, fromUser, fromGroup),
        ]);
        await collection.getDocumentsCount(fromGroup ? undefined : fromUser, fromGroup);
        reply = await replyQuestion(doc, count, fromGroup !== undefined);
      }
      return reply;
    } catch (e) {
      console.error('handle搜索问题 caught:');
      console.error(e);
      return '[error caught] 搜索失败了';
    }
  }
}

class Question3Command extends Command<StudyBotCommandContext> {
  directive(): string[] {
    return ['问题'];
  }

  async both(params: BothHandlerParams): Promise<HandlerReturn> {
    const redisClient = this.context.redis;
    const collection = this.context.questionCollection;
    const isFromGroup = fromQQGroupMessage(params)
    let fromUser,fromGroup
    if (isFromGroup) {
      fromUser = undefined;
      fromGroup = params.fromGroup
    }
    else {
      fromUser = params.fromUser as number;
      fromGroup = undefined;
    }

    const [doc, count] = await Promise.all([
      collection.getRandomDocument(fromUser, fromGroup),
      collection.getDocumentsCount(fromUser, fromGroup),
    ]);
    let reply = '';

    if (doc === null) {
      if (isFromGroup) reply = '群内还没人创建过问题，回复[帮助]查看如何创建问题吧。';
      else reply = '你还没有创建任何问题，回复[帮助]查看如何创建问题吧。';
    } else {
      await storeContent2ToRedis(redisClient, doc, fromUser, fromGroup);
      reply = replyQuestion(doc, count, isFromGroup);
    }
    return reply;
  }
}

class Question4Command extends Command<StudyBotCommandContext> {
  directive(): string[] {
    return ['注解'];
  }

  async both({ fromGroup, fromUser }: BothHandlerParams): Promise<HandlerReturn> {
    const redis = this.context.redis;

    const cache = await redis.hgetall(genRedisKey(fromUser, fromGroup));
    let reply = '';
    if (cache === null) reply = `请先回复[问题]进行问题获取哦`;
    else {
      if (cache.content2) reply = deEncrypt(cache.content2);
      if (reply === '') reply = '你没有对上述问题设置注解';
    }
    return reply;
  }
}

class Question5Command extends Command<StudyBotCommandContext> {
  directive(): string[] {
    return ['删除'];
  }

  async both({ fromGroup, fromUser }: BothHandlerParams): Promise<HandlerReturn> {
    const redis = this.context.redis;
    const hash = genRedisKey(fromUser, fromGroup);
    const cache = await redis.hgetall(hash);
    let reply = '';
    if (cache === null) reply = `请先回复[问题]进行问题获取哦`;
    else {
      const succeed = await questionCollection.deleteDocumentById(cache._id);
      await redis.del(hash);
      if (succeed) reply = `删除成功`;
      else reply = `删除失败`;
    }

    return reply;
  }
}

const questionCommands = [
  new Question1Command(),
  new Question2Command(),
  new Question3Command(),
  new Question4Command(),
  new Question5Command()
]
export default questionCommands;

// -.- 这加密貌似没啥卵用
const key = Buffer.from(process.env.Question_SecretKey!, 'utf8');
const iv = Buffer.from(process.env.Question_SecretIv!, 'utf8');
function encrypt(content): string {
  let res = '';
  const cipher = createCipheriv('aes-128-cbc', key, iv);
  res += cipher.update(content, 'utf8', 'hex');
  res += cipher.final('hex');
  return res;
}
function deEncrypt(content): string {
  let res = '';
  const decipher = createDecipheriv('aes-128-cbc', key, iv);
  res += decipher.update(content, 'hex', 'utf8');
  res += decipher.final('utf8');
  return res;
}

const minutes = 10;
// 每当搜索或随机获取一个问题时，会保存该问题的注解至redis
function genRedisKey(fromUser, fromGroup): string {
  // 该key保证当用户是在群内获取命令时，其他成员回复注解/删除也可操作该命令
  return `问题注解_${fromGroup}${fromGroup ? '' : `_${fromUser}`}`;
}
// 将问题注解存入redis并返回过期时间
async function storeContent2ToRedis(redisClient, doc, qq, qqGroup): Promise<void> {
  const hash = genRedisKey(qq, qqGroup);
  await redisClient.hmset(
    hash,
    ['content', doc.content],
    ['content2', doc.content2 || ''],
    ['_id', doc._id!.toString()]
  );
  await redisClient.expire(hash, minutes * 60);
}
// 搜到问题时回复
function replyQuestion(doc, count: number, isGroup: boolean): string {
  return (
    `${doc.content}\n\n` +
    `${doc.content2 && deEncrypt(doc.content2) ? `- ${minutes}分钟内回复[注解]获取注释\n` : ''}` +
    `- 该问题已被推送${doc.pushTimes.length + 1}次\n- ${
      isGroup ? `群内目前共${count}个问题` : `你目前共有${count}个问题`
    }`
  );
}
