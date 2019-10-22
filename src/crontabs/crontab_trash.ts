import { isProd } from '@utils/index';
import { Admin_Numbers } from '@constants/constants';
import { getTrashType } from '../third_apis/api_trash';
import { studyBotHttpPlugin } from '../http_plugins';
import { trashCollection } from '../db/collections';
import CrontabBase from './CrontabBase';
import { TrashType } from '@dbTypes';

const trashCrontab = new CrontabBase();

export default function runTrashCrontab(): void {
  // 每天凌晨检索一般类型未知的垃圾，看下网站里有更新么
  trashCrontab.registerJob('trash_refresh', '20 * * * *', async function() {
    const docs = await trashCollection.getDocuments({
      type: TrashType.未知,
      valid: 1,
    });
    docs.map(async doc => {
      const type: any = await getTrashType(doc.name);
      if (type) await trashCollection.updateDocument(doc.name, { type });
    });
  });

  // 每天晚上通知管理员今天的未知类型物品，从而便于设置其为合法或不合法，或手动查其类型
  trashCrontab.registerJob('trash_notice', isProd() ? '15 22 * * *' : '15 22 * * *', async function() {
    const docs = await trashCollection.getUnhandledDocuments();
    if (docs.length) {
      const names = docs.map(item => item.name);
      const avg = Math.ceil(names.length / Admin_Numbers.length);
      Admin_Numbers.map((num, index) => {
        const sendToAdminNames = names.slice(avg * index, avg * index + avg);
        if (sendToAdminNames.length > 0)
          studyBotHttpPlugin.sendPrivateMsg(
            num,
            `请更新如下垃圾(type: TrashType.未知, valid: 1):\n\n${sendToAdminNames.join(
              '\n'
            )}\n\n请按照如下格式回复进行更新:\n更新垃圾(换行)\n[物品名](换行)\n[垃圾类型](换行)\n[是否合法](换行)\n[备注信息]\n\n其中:\n[物品名]填写上述列表中的一个(不在该列表的物品不会被处理)，\n[垃圾类型]填写" ${Object.keys(
              TrashType
            ).join(
              ', '
            )} "中的一个，\n[是否合法]填写1或0(1合法，0不合法)\n[备注信息]填写自定义描述，若无则不写并且不要再[是否合法]后换行`
          );
      });
    }
  });

  trashCrontab.run();
}
