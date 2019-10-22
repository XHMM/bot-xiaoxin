import DrinkCollection from './DrinkCollection';
import QQCollection from './QQCollection';
import QQGroupCollection from './QQGroupCollection';
import QuestionCollection from './QuestionCollection';
import TrashCollection from './TrashCollection';
import WordCollection from './WordCollection';
import GlobalStatusCollection from './GlobalStatusCollection';
import QQSyncCollection from './QQSyncCollection';

const drinkCollection = new DrinkCollection();
const qqCollection = new QQCollection();
const qqGroupCollection = new QQGroupCollection();
const questionCollection = new QuestionCollection();
const trashCollection = new TrashCollection();
const wordCollection = new WordCollection();
const globalStatusCollection = new GlobalStatusCollection();
const qqSyncCollection = new QQSyncCollection();

export {
  drinkCollection,
  globalStatusCollection,
  qqCollection,
  qqGroupCollection,
  qqSyncCollection,
  questionCollection,
  trashCollection,
  wordCollection,
};
