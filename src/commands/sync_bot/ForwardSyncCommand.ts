import { Command, UserHandlerParams, HandlerReturn, ParseReturn } from "lemon-bot";
import { SyncBotCommandContext } from "./types";

export class ForwardSyncCommand extends Command<SyncBotCommandContext> {
  directive(): string[] {
    return ["同步"];
  }
  parse(): ParseReturn {
      return true;
  }
  async user({ rawMessage, fromUser }: UserHandlerParams): Promise<HandlerReturn> {
    const ok = await this.context.qqSyncCollection.insertDocument({
      content: rawMessage,
      createdBy: fromUser
    });
    if (!ok) return "插入失败";
  }
}
