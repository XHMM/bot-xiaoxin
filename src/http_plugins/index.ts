import { HttpPlugin } from 'lemon-bot';

const studyBotHttpPlugin = new HttpPlugin(process.env.StudyBot_Http_Plugin_Endpoint!)
const syncBotHttpPlugin = new HttpPlugin(process.env.SyncBot_Http_Plugin_Endpoint!);

export {
  studyBotHttpPlugin,
  syncBotHttpPlugin
}