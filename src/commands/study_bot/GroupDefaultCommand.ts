import { HandlerReturn, ParseReturn, Command, GroupHandlerParams, CQRawMessageHelper } from 'lemon-bot';
import { valueExistsInObject } from '@xhmm/utils';

export default class GroupDefaultCommand extends Command {
  parse(): ParseReturn {
    return true;
  }

  group({ message, isAt, rawMessage}: GroupHandlerParams): HandlerReturn {
    let text = CQRawMessageHelper.removeAt(rawMessage);

    if (isAt) {
      if (text.includes('你') && text.includes('我')) {
        text = text.replace(/([你我])/g, (match, $1) => {
          if ($1 === '你') return '我';
          if ($1 === '我') return '你';
          return match;
        });
      }

      text = text.replace('?', '!');
      text = text.replace('？', '！');
      text = text.replace('吗', '');
      return {
        atSender: false,
        content: text,
      };
    } else {
      let is王者荣耀 = false;
      if (text.includes('王者荣耀')) is王者荣耀 = true;
      if (
        /.*([打大玩完]).*(王者).*(荣耀|农药).*/.test(text) ||
        /.*([打大玩完]).*(荣耀|农药).*/.test(text) ||
        /.*([打大玩完]).*(王者).*/.test(text)
      )
        is王者荣耀 = true;

      if (message[0].type === 'rich') {
        try {
          const obj = JSON.parse(message[0].data.content);
          if (valueExistsInObject(obj, 1104466820, '1104466820')) is王者荣耀 = true;
        } catch (e) {
          //
        }
      }

      if (is王者荣耀) {
        return {
          atSender: false,
          content: `王者！荣耀！`,
        };
      }
      return;
    }
  }
}
