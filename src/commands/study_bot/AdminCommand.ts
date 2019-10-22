import { Command, UserHandlerParams, include, ParseReturn, HandlerReturn, ParseParams } from 'lemon-bot';

class BroadcastCommand extends Command {
  directive(): string[] {
    return ['广播'];
  }

  // eg: '广播(空格or换行)1231-121212-122(空格or换行)内容内容'
  parse({ rawMessage }: ParseParams): ParseReturn {
    const regexp = /^广播\s+\d+(-\d+)*\s+.+/;
    if (regexp.test(rawMessage)) {
      const [, , numbersStr, , content] = /^(广播)\s+(\d+(-\d+)*)\r?\n?((.|\s)+)/.exec(rawMessage)!; // 这个正则可以确保发送广播的内容区的换行空格啥的完整保留
      const numbers = numbersStr.split('-').map(item => +item);
      return {
        numbers,
        content,
      };
    }
    return;
  }

  @include([1326099664])
  async user( params: UserHandlerParams<{ numbers: number[]; content: string }>): Promise<HandlerReturn> {
    const { numbers, content } = params.data;
    const sendResults = await Promise.all(
      numbers.map(async num => {
        const id = await this.httpPlugin.sendGroupMsg(num, content);
        if (id) return num + '发送成功';
        else return num + '发送失败';
      })
    );
    return sendResults.join('\n');
  }
}

class GetGroupListCommand extends Command {
  directive(): string[] {
    return ['群列表'];
  }

  @include([1326099664])
  async user(): Promise<HandlerReturn> {
    try {
      const list = await this.httpPlugin.getGroupList();
      return list.map(item => `${item.group_id}\n${item.group_name}`).join('\n\n');
    } catch (e) {
      console.log(e);
      return `Error`;
    }
  }
}

const adminCommands = [new BroadcastCommand(), new GetGroupListCommand()];
export default adminCommands;
