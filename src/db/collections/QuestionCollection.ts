import { ObjectId } from 'mongodb';

import { formatDate } from '@utils/index';
import { ColNames } from '@constants/constants';
import { logError } from '../decorators';
import CollectionBase from './CollectionBase';
import { IQuestion } from '@dbTypes';

export default class QuestionCollection extends CollectionBase<ColNames.Question> {
  constructor() {
    super(ColNames.Question);
  }

  @logError(null)
  // 若提供了qqGroup则qq字段无效，此时会从当前群所有已创建问题里搜索一个
  // 若未提供qqGroup，则从该QQ在私聊模式下创建的所有问题里搜索一个
  // 未找到返回null，找到则返回的是pushTimes更新前的文档
  async getRandomDocument(qq?: number, qqGroup?: number): Promise<IQuestion | null> {
    if (!qq && !qqGroup) throw new Error("qq and qqGroup cannot both be undefined")

    const collection = await this.getCollection();
    // TODO: 实现轮询式推送
    let $match: any;
    if (qqGroup)
      $match = {
        createdIn: qqGroup,
      };
    else
      $match = {
        createdBy: qq,
        createdIn: {
          $exists: false,
        },
      };
    const docs = await collection
      .aggregate([
        {
          $match,
        },
        {
          $sample: {
            size: 1,
          },
        },
      ])
      .toArray();
    const doc = docs[0];
    if (!doc) return null;
    await collection.updateOne(
      {
        // @ts-ignore
        _id: doc._id,
      },
      {
        $push: {
          pushTimes: formatDate(new Date(), true),
        },
      }
    );
    return doc;
  }

  @logError(-1)
  async getDocumentsCount(qq: number| undefined, qqGroup: number| undefined): Promise<number> {
    const collection = await this.getCollection();
    if (!qq && !qqGroup) throw new Error("qq and qqGroup cannot both be undefined")

    let query = {};
    if (qq && !qqGroup)
      query = {
        createdBy: qq,
        createdIn: {
          $exists: false
        }
      }
    if (qq && qqGroup) {
      query = {
        createdBy: qq,
        createdIn: qqGroup
      }
    }
    if ((!qq) && qqGroup) {
      query = {
        createdIn: qqGroup
      }
    }
    return await collection.countDocuments(query);
  }

  @logError(false)
  async insertDocument(
    qq: number,
    { content, content2 }: Pick<IQuestion, 'content' | 'content2'>,
    qqGroup?: number
  ): Promise<boolean> {
    const collection = await this.getCollection();
    const { insertedCount } = await collection.insertOne({
      createdAt: formatDate(new Date(), true),
      createdBy: qq,
      ...(qqGroup && { createdIn: qqGroup }),
      content,
      ...(content2 && { content2 }),
      pushTimes: [],
    });
    return insertedCount === 1;
  }

  @logError(false)
  async deleteDocumentById(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const { deletedCount } = await collection.deleteOne({
      _id: new ObjectId(id),
    });
    return deletedCount == 1;
  }
}

