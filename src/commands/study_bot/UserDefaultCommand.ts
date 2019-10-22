import { Command, HandlerReturn, ParseReturn } from "lemon-bot";

export default class UserDefaultCommand extends Command {
  quotes = [
    "小心分身，唰唰唰",
    "小心激光，biubiubiu",
    "小心瞬斩，kuakuakua",
    "小心机车侠，合体！"
  ];

  parse(): ParseReturn {
    return true;
  }

  user(): HandlerReturn {
    return `${
      this.quotes[Math.floor(Math.random() * this.quotes.length)]
    }\n\nPS: 回复[帮助]可查看我的所有功能哦`;
  }
}
