import { ColNames } from '@constants/constants';
import { logError } from '../decorators';
import CollectionBase from "./CollectionBase";
import { ITrash, TrashType } from "@dbTypes";

export default class TrashCollection extends CollectionBase<ColNames.Trash> {
  constructor() {
    super(ColNames.Trash);
  }

  @logError(undefined)
  async addDocument(doc: ITrash): Promise<ITrash | undefined> {
    const collection = await this.getCollection();
    const { value } = await collection.findOneAndUpdate(
      { name: doc.name },
      {
        $set: doc
      },
      {
        upsert: true,
        returnOriginal: false
      }
    );
    this.logger.info(`created trash: name-${doc.name}`);
    return value;
  }

  @logError(false)
  async updateDocument(
    name: string,
    {
      type,
      lookupCount,
      valid,
      ps
    }: Partial<Pick<ITrash, "type" | "lookupCount" | "valid" | "ps">>
  ): Promise<boolean> {
    const collection = await this.getCollection();

    const doc = await collection.findOne({ name });
    if (doc) {
      const { modifiedCount } = await collection.updateOne(
        { name },
        {
          $set: {
            ...(type !== undefined && { type }),
            ...(lookupCount !== undefined && { lookupCount }),
            ...(valid !== undefined && { valid }),
            ...(ps !== undefined && { ps })
          }
        }
      );
      return modifiedCount === 1;
    }
    return false;
  }

  @logError(null)
  async getDocumentByName(name: string): Promise<ITrash | null> {
    const collection = await this.getCollection();

    const col = await collection.findOne({ name });
    if (col) {
      await this.updateDocument(name, {
        lookupCount: col.lookupCount + 1
      });
      return col;
    } else {
      return null;
    }
  }

  @logError([])
  async getDocuments(query = {}): Promise<ITrash[]> {
    const collection = await this.getCollection();
    return await collection.find(query).toArray();
  }

  @logError([])
  async getUnhandledDocuments(): Promise<ITrash[]> {
    const collection = await this.getCollection();
    return await collection
      .find({
        type: TrashType.未知,
        valid: 1
      })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
  }
}

