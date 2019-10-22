import { CronJob } from 'cron';

// TODO: 改写定时任务类
export default class CrontabBase {
  cache: Record<string, CronJob[]> = {};

  // 这个id标识需要正确指定
  registerJob(id: string, time: string, tick: () => void): void {
    const job = new CronJob({
      cronTime: time,
      onTick: tick,
    });
    console.log(`crontab id: [${id}] time: [${time}] started.`);
    if (id in this.cache) this.cache[id].push(job);
    else this.cache[id] = [job];
  }

  unregisterJobs(id: string): void {
    if (id in this.cache) {
      this.cache[id].map(job => {
        job.stop();
      })
      console.log(`crontab id: [${id}] count: [${this.cache[id].length}个] destroyed.`);
      delete this.cache[id];
    }
  }

  run(): void {
    Object.values(this.cache).map(jobs => {
      jobs.map(job => job.start());
    });
  }
}
