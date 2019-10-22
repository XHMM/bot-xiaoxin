import { ColNames } from '@constants/constants';

interface IDocument {
  _id?: object;
}

// 存放全局状态的集合
interface IGlobalStatusBase extends IDocument {
  type: string;
}
export interface IGlobalStatusOfDrink extends IGlobalStatusBase {
  type: ColNames.Drink;
  canUpdateRecord: boolean;
  noCupOfToday: number; // 已喝杯数，0开始
}

export interface ISchemas {
  [ColNames.Trash]: ITrash;
  [ColNames.QqGroup]: IQqGroup;
  [ColNames.Qq]: IQq;
  [ColNames.Drink]: IDrinkUser;
  [ColNames.GlobalStatus]: IGlobalStatusOfDrink;
  [ColNames.Question]: IQuestion;
  [ColNames.Word]: IWord;
  [ColNames.QqSync]: IQqSync;
}

// 用户喝水记录
export interface IDrinkUser extends IDocument {
  qqGroup: number;
  qq: number;
  date: string;
  records: string[];
  canUpdateRecord: boolean;
  enabledRemind: boolean; // 是否允许接收提醒(仅私人模式下用到此字段)
}

// 垃圾分类，key会被作为垃圾更新命令中垃圾类别的一种
export enum TrashType {
  '可回收物' = '可回收物',
  '有害垃圾' = '有害垃圾',
  '湿垃圾' = '湿垃圾',
  '厨余垃圾' = '湿垃圾',
  '干垃圾' = '干垃圾',
  '其他垃圾' = '干垃圾',
  '未知' = '未知',
}
export interface ITrash extends IDocument {
  name: string;
  type: TrashType;
  createdAt: string; // name创建的时间
  updatedAt: string; // type更新的时间
  lookupCount: number; // 检索次数
  valid: number; // 是否是有效物品(比如人名，乱输的，或本来就不是垃圾比如“猪”) 1 true 0 false
  ps?: string;
}

export enum RemindService {
  'countdown' = 'countdown',
  'question' = 'question',
  'drink' = 'drink',
}
// 用户或群组是否启用了该功能
type TSwitch = Record<RemindService, boolean>;
// 倒计时
interface ICountdown extends IDocument {
  title: string; // 什么日子
  date: string; // YYYY-MM-DD
  nodes: string[]; // crontab格式
  contents: string[]; // 需要和nodes对应，提醒内容
  variant: 'reminder' | 'countdown'; // 提醒内容的格式， countdown是倒计时式提醒
}

interface IBaseInfo extends IDocument {
  number: number;
  switch?: TSwitch;
  countdowns?: ICountdown[];
}
// 每个qq群的配置
export interface IQqGroup extends IBaseInfo {}
// 每个qq的配置
export interface IQq extends IBaseInfo {}

// 问题
export interface IQuestion extends IDocument {
  createdAt: string;
  createdBy: number; // qq号
  createdIn?: number; // qq群号，若是私人模式下创建，该字段不存在
  pushTimes: string[]; // 推送日期(手动获取和按时推送都会更新该字段)
  content: string; // 问题内容
  content2?: string; // 答案
}

// 单词
export interface IWord extends IDocument {
  origin: string; // 原单词
  type: string; // 词性
  chinese: string; // 中文释义
  english: string; // 英文释义
  sentences: Array<{
    english: string;
    chinese: string;
  }>;
}

// qq消息同步
export interface IQqSync extends IDocument {
  createdAt: string;
  content: string;
  createdBy: number;
}
