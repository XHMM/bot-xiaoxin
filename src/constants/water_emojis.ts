// 这些emoji同命令判断里的emoji
// 沒選用臉是因為臉表情發送率很高，不適合

// 可做sign的，即在喝水提醒时，可以显示的。做这个区分的原因是，比如马桶..和水有关，但是用作sign不太适合
export const canForSignWaterEmojis = [
  "[CQ:emoji,id=128166]", //💦
  "[CQ:emoji,id=128167]", // 💧
  "[CQ:emoji,id=127861]", // 🍵
  "[CQ:emoji,id=9749]", //☕
  "[CQ:emoji,id=127862]", //🍶
  "[CQ:emoji,id=127866]", // 🍺
  "[CQ:emoji,id=127867]", // 🍻
  "[CQ:emoji,id=127864]", // 🍸
  "[CQ:emoji,id=127868]", // 🍼
  "[CQ:emoji,id=127863]", // 🍷
  "[CQ:emoji,id=127865]", // 🍹
  "[CQ:emoji,id=127870]", // 🍾
  "[CQ:emoji,id=127817]", // 🍉
  "[CQ:emoji,id=9832]", // ♨
  "[CQ:emoji,id=128688]", //🚰

  "[CQ:face,id=171]", // /茶
  "[CQ:face,id=60]", ///咖啡
  "[CQ:face,id=89]", // /西瓜
  "[CQ:face,id=148]", // 奶瓶

  // 下面是CQ还不支持的emoji
  ":cup_with_straw:", // 🥤
  ":glass_of_milk:",
  ":tumbler_glass:"
];

export const notForSignWaterEmojis = [
  "[CQ:emoji,id=128051]", //  🐳
  "[CQ:emoji,id=128044]", // 🐬
  "[CQ:emoji,id=128025]", // 🐙
  "[CQ:emoji,id=128031]", // 🐟
  "[CQ:emoji,id=128032]", // 🐠
  "[CQ:emoji,id=127754]", //🌊
  "[CQ:emoji,id=127782]", //  🌦️
  "[CQ:emoji,id=127783]", // 🌧️
  "[CQ:emoji,id=9928]", // ⛈️
  "[CQ:emoji,id=127784]", // 🌨️
  "[CQ:emoji,id=9731]", //☃️
  "[CQ:emoji,id=10052]", //❄
  "[CQ:emoji,id=9748]", // ☔
  "[CQ:emoji,id=128705]", // 🛁
  "[CQ:emoji,id=128703]", // 🚿
  "[CQ:emoji,id=127746]", // 🌂
  "[CQ:emoji,id=128137]", // 💉
  "[CQ:emoji,id=128658]", // 🚒
  "[CQ:emoji,id=9972]", // ⛴
  "[CQ:emoji,id=128701]",// 🚽
  "[CQ:emoji,id=127946]", //🏊
  "[CQ:emoji,id=127940]", // 🏄
  "[CQ:emoji,id=128704]", // 🛀
  "[CQ:emoji,id=128138]", // 💊
  "[CQ:emoji,id=9970]", // ⛲

  // 待处理的
  //  🧪(node-emoji和cq都解析不了的)
];

