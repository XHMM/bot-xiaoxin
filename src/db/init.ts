import { qqGroupCollection, qqCollection } from './collections';

export async function initCollections(): Promise<void> {
  try {
    await Promise.all([
      qqGroupCollection.init(),
      qqCollection.init()
    ]);
  } catch (e) {
    console.error("initCollections error:::::::");
    console.error(e);
  }
}
