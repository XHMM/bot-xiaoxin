import { Command, SessionHandlerParams, HandlerReturn, include, UserHandlerParams } from 'lemon-bot';
import { VM, VMScript } from 'vm2';


export default class RunCodeCommand extends Command {
  vm = new VM();

  constructor() {
    super();
  }

  directive(): string[] {
    return ["node", "nodejs"];
  }

  @include([1326099664])
  async user({ setNext }: UserHandlerParams): Promise<HandlerReturn> {
    await setNext('Run');
    return `请输入nodejs代码：`
  }

  async sessionRun({ rawMessage, setEnd }: SessionHandlerParams): Promise<HandlerReturn> {
    await setEnd();
    try {
      return this.vm.run(new VMScript(rawMessage));
    } catch (e) {
      return e.toString();
    }

  }
}