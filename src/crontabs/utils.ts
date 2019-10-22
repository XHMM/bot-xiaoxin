import { differenceInDays } from "date-fns";

export function calcLeftDays(nowStr: string| number, destTime: string): number {
  const left = differenceInDays(destTime, nowStr);
  // console.log(`目标时间: ${destTime}, 现在时间：${nowStr}, 相隔天数：${left}`);
  return left;
}