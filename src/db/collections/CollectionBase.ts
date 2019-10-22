import { Signale } from 'signale';
import { ColNames, DbName } from '@constants/constants';
import getDatabase from '../get_database';
import { ISchemas } from '@dbTypes';

export default abstract class CollectionBase<T extends ColNames> {
  collectionName: ColNames;
  logger: Signale

  protected constructor(collectionName: ColNames) {
    this.collectionName = collectionName;
    const logger = new Signale({
      scope: "db"
    });
    logger.info = logger.info.bind(logger, `[db: ${DbName}] [collection: ${this.collectionName}]`)
    this.logger = logger
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  protected async getCollection() {
    const db = await getDatabase();
    return db.collection<ISchemas[T]>(this.collectionName);
  }

}