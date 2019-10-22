import { calcLeftDays } from './utils';

describe("calcLeftDays fn test", () => {
  it("12-11:00 - 12:21:00 ", () => {
    const originTimestamp = new Date("2019-12-11 00:00").getTime();
    const dest = "2019-12-21 00:00";
    expect(calcLeftDays(originTimestamp, dest)).toBe(10);
  })

  it("test", () => {
    console.log(calcLeftDays(Date.now(), "2019-12-21 00:00"))
  })

  it("test2", () => {
    console.log(calcLeftDays("2019-12-20 00:00", "2019-12-21 00:00"))
  })
});