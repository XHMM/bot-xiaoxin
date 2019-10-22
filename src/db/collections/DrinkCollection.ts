import { formatDate } from "@utils/index";
import { ColNames } from '@constants/constants';
import { logError } from "../decorators";
import CollectionBase from "./CollectionBase";
import { IDrinkUser } from "@dbTypes";

export default class DrinkCollection extends CollectionBase<ColNames.Drink> {
  constructor() {
    super(ColNames.Drink);
  }

  @logError(null)
  // 不存在则返回null
  async getDrinkUser({
    date,
    qqGroup,
    qq
  }: {
    date: Date;
    qqGroup: number;
    qq: number;
  }): Promise<IDrinkUser | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({
      date: formatDate(date),
      qqGroup,
      qq
    });
    if (user) return user;
    else return null;
  }

  @logError(undefined)
  // 不存在会新建
  async updateUserDrinkData({
    date,
    qqGroup,
    qq,
    drinkTime
  }: {
    date: Date;
    qqGroup: number;
    qq: number;
    drinkTime: Date;
  }): Promise<IDrinkUser | undefined> {
    const collection = await this.getCollection();
    const dateStr = formatDate(date);
    const drinkDateStr = formatDate(drinkTime, true);
    const { value } = await collection.findOneAndUpdate(
      {
        qqGroup,
        qq,
        date: dateStr
      },
      {
        $set: {
          canUpdateRecord: false
        },
        $push: {
          records: drinkDateStr
        }
      },
      {
        upsert: true,
        returnOriginal: false
      }
    );
    return value;
  }

  @logError(false)
  // 更新所有人的是否可更新记录字段
  async updateAllUserCanUpdateRecord(value: boolean): Promise<boolean> {
    const collection = await this.getCollection();
    await collection.updateMany(
      {},
      {
        $set: {
          canUpdateRecord: value
        }
      }
    );
    return true;
  }
}
