import { ColNames } from '@constants/constants';
import { logError } from "../decorators";
import CollectionBase from "./CollectionBase";
import { IWord } from "@dbTypes";

export default class WordCollection extends CollectionBase<ColNames.Word> {
  constructor() {
    super(ColNames.Word);
  }

  @logError(false)
  async insertDocument(doc: IWord): Promise<boolean> {
    const collection = await this.getCollection();
    const { insertedCount } = await collection.insertOne(doc);
    return insertedCount === 1;
  }

  @logError(false)
  async insertDocuments(docs: IWord[]): Promise<boolean> {
    const collection = await this.getCollection();
    const { insertedCount } = await collection.insertMany(docs);
    return insertedCount === docs.length;
  }

  @logError([])
  // 一个单词对应有多条文档哦
  async findDocumentsByEnglishName(name: string): Promise<IWord[]> {
    const collection = await this.getCollection();
    return await collection
      .find({
        origin: name
      })
      .toArray();
  }
}


