import { format, addSeconds, isBefore } from 'date-fns';
import * as signale from 'signale';

export function formatDate(date: Date, accurate = false): string {
  if (accurate) return format(date, 'YYYY-MM-DD HH:mm');
  else return format(date, 'YYYY-MM-DD');
}

// 判断时间A是否 < 时间B+seconds
export function isInSecondsDistance(timeA, timeB, distanceSeconds: number): boolean {
  return isBefore(timeA, addSeconds(timeB, distanceSeconds));
}

export function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

/*
 * if first argument is boolean, it means not log when NODE_ENV is 'production'
 * */
export function logInfo(...args: any[]): void {
  const controlledWithENV = args[0];
  if (typeof controlledWithENV === 'boolean') {
    if (!(controlledWithENV && !isProd())) signale.info(...args);
  } else signale.info(...args);
}
