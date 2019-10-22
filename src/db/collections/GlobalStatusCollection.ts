import { ColNames } from '@constants/constants';
import { logError } from '../decorators';
import CollectionBase from "./CollectionBase";
import { IGlobalStatusOfDrink } from "@dbTypes";

export default class GlobalStatusCollection extends CollectionBase<ColNames.GlobalStatus> {
  constructor() {
    super(ColNames.GlobalStatus);
  }

  @logError(false)
  // 更新/创建 drink对应的global_status
  async updateDrinkStatus({
    noCupOfToday,
    canUpdateRecord
  }: Omit<Partial<IGlobalStatusOfDrink>, "type">): Promise<boolean> {
    const collection = await this.getCollection();
    await collection.findOneAndUpdate(
      { type: ColNames.Drink },
      {
        $set: {
          type: ColNames.Drink,
          ...(noCupOfToday !== undefined && { noCupOfToday }),
          ...(canUpdateRecord !== undefined && { canUpdateRecord })
        }
      },
      {
        upsert: true
      }
    );
    return true;
  }

  @logError(null)
  // 不存在会新建
  async getDrinkStatus(): Promise<IGlobalStatusOfDrink> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ type: ColNames.Drink });
    if (doc) return doc;
    else {
      const newDoc: IGlobalStatusOfDrink = {
        type: ColNames.Drink,
        noCupOfToday: 0,
        canUpdateRecord: false
      };
      await collection.insertOne(newDoc);
      return newDoc;
    }
  }
}