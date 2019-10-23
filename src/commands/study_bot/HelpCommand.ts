import { Command, HandlerReturn } from "lemon-bot";

class HelpCommand extends Command {
  directive(): string[] {
    return ["帮助", "help"];
  }

  both(): HandlerReturn {
    return `[CQ:emoji,id=10024] 我是奋起的小心，愿让QQ不止于聊天！
      
[CQ:emoji,id=128073] 回复[帮助1]查看每日八杯水提醒相关命令。每日繁琐的在群内提醒，助群友们都不忘喝水

[CQ:emoji,id=128073] 回复[帮助2]查看垃圾分类相关命令。帮你慢速查询垃圾及相关垃圾的分类

[CQ:emoji,id=128073] 回复[帮助3]查看自定义问题管理相关命令。你可以创建、检索、随机回顾自己的问题

[CQ:emoji,id=128073] 回复[帮助4]查看英文单词相关命令。帮你慢速查询单词的柯林斯释义

[CQ:emoji,id=128073] 回复[帮助5]查看消息提醒相关命令。

[CQ:emoji,id=128073] 我的开源地址：https://github.com/XHMM/bot-xiaoxin`;
  }
}

class Help1Command extends Command {
  directive(): string[] {
    return ["帮助1", "八杯水帮助"];
  }

  both(): HandlerReturn {
    return `[CQ:emoji,id=128167]【每日八杯水提醒】(群功能)
      
[CQ:emoji,id=128073] @我并回复[关闭喝水提醒]可关闭提醒
[CQ:emoji,id=128073] @我并回复[开启喝水提醒]可开启提醒(默认为开启)
[CQ:emoji,id=128073] 打卡具体细则可在提醒消息中获知`;
  }
}

class Help2Command extends Command {
  directive(): string[] {
    return ["帮助2", "垃圾分类帮助"];
  }

  both(): HandlerReturn {
    return `[CQ:emoji,id=127810]【垃圾分类查询】(群功能、私人功能)
      
[CQ:emoji,id=128073] 回复[垃圾分类]查看知识介绍以及其它可用命令`;
  }
}

class Help3Command extends Command {
  directive(): string[] {
    return ["帮助3", "问题管理帮助"];
  }

  both(): HandlerReturn {
    return `[CQ:emoji,id=127942]【自定义问题管理】(群功能、私人功能)
      
[CQ:emoji,id=128073] 回复[新建问题(换行)你的问题]创建无回复的问题(提醒：字数不要过过过长哦)
[CQ:emoji,id=128073] 回复[新建问题(换行)你的问题(换行)问题注解(换行)你对该问题的注解]创建有注解的问题
[CQ:emoji,id=128073] 回复[问题]可随机获取已创建的问题
[CQ:emoji,id=128073] 回复[问题(空格)问题内容]可模糊检索已创建的问题
[CQ:emoji,id=128073] 回复[注解]可获取当前问题的注解
[CQ:emoji,id=128073] 回复[删除]可删除当前问题
[CQ:emoji,id=128073] 问题推送功能计划实现中`;
  }
}

class Help4Command extends Command {
  directive(): string[] {
    return ["帮助4", "单词帮助"];
  }

  both(): HandlerReturn {
    return `[CQ:emoji,id=127760]【英语单词】(群功能、私人功能)
      
[CQ:emoji,id=128073] 回复[单词(空格)英文单词]可获取柯林斯词典释义(单词首次查询速度较慢)
[CQ:emoji,id=128073] 单词推送功能计划实现中`;
  }
}

class Help5Command extends Command {
  directive(): string[] {
    return ["帮助5", "消息提醒帮助"];
  }

  both(): HandlerReturn {
    return `[CQ:emoji,id=128337]【倒计时、多时段提醒】(群功能、私人功能)
      
[CQ:emoji,id=128073] 该功能暂未提供相关指令，有需求者私戳接头人反馈哟`;
  }
}

const helpCommands = [
  new HelpCommand(),
  new Help1Command(),
  new Help2Command(),
  new Help3Command(),
  new Help4Command(),
  new Help5Command()
];
export default helpCommands;
