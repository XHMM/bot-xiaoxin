import { formatDate } from "@utils/index";
import { ColNames } from '@constants/constants';
import { logError } from '../decorators';
import CollectionBase from "./CollectionBase";
import { IQq, IQqGroup, RemindService } from "@dbTypes";

type CollectionName = ColNames.Qq | ColNames.QqGroup;
export default class QQCollectionBase extends CollectionBase<CollectionName> {
  constructor(collectionName: CollectionName) {
    super(collectionName);
  }

  @logError()
  async init(): Promise<void> {
    const collection = await this.getCollection();
    await collection.createIndex(
      {
        number: 1
      },
      {
        unique: true
      }
    );
  }

  @logError(null)
  // 不存在时返回null
  async getDocumentByNumber(number: number): Promise<IQqGroup | IQq | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ number });
  }

  @logError([])
  async getDocuments(query = {}): Promise<IQqGroup[] | IQq[]> {
    const collection = await this.getCollection();
    return await collection.find(query).toArray();
  }

  @logError([])
  async getDocumentsByDrinkRemindSwitch(status: "on" | "off"): Promise<IQqGroup[] | IQq[]> {
    const collection = await this.getCollection();
    return await collection
      .find({
        "switch.drink": status === "on"
      })
      .toArray();
  }

  @logError([])
  async getUnwindDocumentsForCountdownCrontab(): Promise<IQqGroup[] | IQq[]> {
    const collection = await this.getCollection();
    return await collection
      .aggregate([
        {
          $match: {
            "switch.countdown": true
          }
        },
        {
          $unwind: {
            path: "$countdowns"
          }
        },
        {
          $match: {
            "countdowns.date": {
              $gte: formatDate(new Date(), true)
            }
          }
        },
        {
          $addFields: {
            countdowns: ["$countdowns"]
          }
        }
      ])
      .toArray();
  }

  @logError(false)
  async insertDocument({
    number
  }: Pick<IQq | IQqGroup, "number">): Promise<boolean> {
    const collection = await this.getCollection();
    const { insertedCount } = await collection.insertOne({
      number
    });
    return insertedCount === 1;
  }

  @logError(false)
  // 文档不存在时是会返回true的(因为任何服务都是默认开启的)
  async isServiceEnabled(
    number: number,
    serviceName: RemindService
  ): Promise<boolean> {
    const doc = await this.getDocumentByNumber(number);
    if (doc === null) return true;
    if (doc.switch && typeof doc.switch[serviceName] === "boolean")
      return doc.switch[serviceName];
    return true;
  }

  @logError(false)
  async switchService(
    number: number,
    serviceName: RemindService,
    status: "on" | "off"
  ): Promise<boolean> {
    const collection = await this.getCollection();
    const { modifiedCount } = await collection.updateOne(
      {
        number
      },
      {
        $set: {
          [`switch.${serviceName}`]: status === "on"
        }
      },
      {
        upsert: true
      }
    );
    return modifiedCount === 1;
  }
}
