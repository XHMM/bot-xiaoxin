import { HttpPlugin } from 'lemon-bot';
import { SyncBot_Http_Plugin_Endpoint, StudyBot_Http_Plugin_Endpoint } from '@constants/constants';

const studyBotHttpPlugin = new HttpPlugin(StudyBot_Http_Plugin_Endpoint)
const syncBotHttpPlugin = new HttpPlugin(SyncBot_Http_Plugin_Endpoint);

export {
  studyBotHttpPlugin,
  syncBotHttpPlugin
}