import adminCommands from './AdminCommand';
import drinkCommands from './DrinkCommand';
import GroupDefaultCommand from './GroupDefaultCommand';
import UserDefaultCommand from './UserDefaultCommand';
import helpCommands from './HelpCommand';
import questionCommands from './QuestionCommand';
import trashCommands from './TrashCommand';
import WordCommand from './WordCommand';
import RunCodeCommand from './RunCodeCommand';

const studyBotCommands = [
  ...adminCommands,
  ...drinkCommands,
  ...helpCommands,
  ...questionCommands,
  ...trashCommands,
  new RunCodeCommand(),
  new WordCommand(),

  new GroupDefaultCommand(),
  new UserDefaultCommand()
]

export default studyBotCommands;