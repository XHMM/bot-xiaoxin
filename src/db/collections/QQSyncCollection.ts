import { formatDate } from '@utils/index';
import { ColNames } from '@constants/constants';
import { logError } from '../decorators';
import CollectionBase from './CollectionBase';
import { IQqSync } from '@dbTypes';

export default class QQSyncCollection extends CollectionBase<ColNames.QqSync> {
  constructor() {
    super(ColNames.QqSync);
  }

  @logError(false)
  async insertDocument(doc: Omit<IQqSync, 'createdAt'>): Promise<boolean> {
    const collection = await this.getCollection();
    const { insertedCount } = await collection.insertOne({
      createdBy: doc.createdBy,
      content: doc.content,
      createdAt: formatDate(new Date(), true),
    });
    return insertedCount === 1;
  }

  @logError([])
  // 获取统计信息
  getStat():
    Array<{
      date: string;
      count: number;
    }
  > {
    return []
  }

}