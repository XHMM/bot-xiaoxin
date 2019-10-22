import { IHandyRedis } from 'handy-redis';
import { Client } from '@elastic/elasticsearch';
import WordCollection from '../../db/collections/WordCollection';
import TrashCollection from '../../db/collections/TrashCollection';
import QuestionCollection from '../../db/collections/QuestionCollection';

export interface StudyBotCommandContext {
  redis: IHandyRedis;
  es: Client;
  wordCollection: WordCollection;
  trashCollection: TrashCollection;
  questionCollection: QuestionCollection
}
