import nodeFetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { TrashType } from '@dbTypes';

/*
// puppeteer果然不适合这种很简单的任务...用起来又慢又卡。。。
export async function getTrashType(name: string): Promise<string | undefined> {
  try {
    if(!name) {
      return undefined;
    }
    const browser = await pp.launch({
      args: ['--no-sandbox']
    });
    const val = await Promise.race([site1(browser, name), site2(browser, name)]);
    if(val) {
      await browser.close();
      return val;
    }
    else{
      return undefined;

    }
  } catch (e) {
    console.log(e);
    return undefined;
  }
}
async function site1(browser, name):Promise<string | undefined> {
  try {
    console.time('爬取http://trash.lhsr.cn/sites/feiguan/trashTypes_2/TrashQuery.aspx')
    const page = await browser.newPage();
    // 不设置ua，当电脑端访问时，url会变化并出现弹窗
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Mobile Safari/537.36');
    await page.goto(`http://trash.lhsr.cn/sites/feiguan/trashTypes_2/TrashQuery.aspx?kw=${encodeURIComponent(name)}`);
    const val = await page.evaluate(() => {
      const $ele = document.querySelector('#form1 > div.main > div.con > div.info > p > span');
      if($ele) {
        return $ele.textContent;
      }
      else
        return undefined;
    });
    console.timeEnd('爬取http://trash.lhsr.cn/sites/feiguan/trashTypes_2/TrashQuery.aspx')
    if(val) return val;
    return undefined;
  } catch (e) {
    throw e
  }

}
async function site2(browser, name):Promise<string | undefined> {
  try {
    console.time('爬取http://lajifenleiapp.com/sk')
    const page = await browser.newPage();
    await page.goto(`http://lajifenleiapp.com/sk/${encodeURIComponent(name)}`);
    const val = await page.evaluate(() => {
      const $ele = document.querySelector('body > div.container > div:nth-child(7) > div > h1 > span:nth-child(3)');
      if($ele)
        return $ele.textContent;
      else
        return undefined;
    });
    console.timeEnd('爬取http://lajifenleiapp.com/sk')
    if(val) return val;
    return undefined;
  } catch (e) {
    throw e
  }
}*/

export async function getTrashType(name: string): Promise<string | undefined> {
  try {
      const type = await site2Html(name);
      if(type) return type;
      return undefined;
  } catch (e) {
    console.error('third_api::getTrashType error::::::::');
    console.error(e);
    return undefined;
  }
}
// 这个网站没下面的全..
/*async function site1Html(name) {
  const response = await nodeFetch(`http://trash.lhsr.cn/sites/feiguan/trashTypes_2/TrashQuery.aspx?kw=${encodeURIComponent(name)}`);
  const txt = await response.text();
  const $ = cheerio.load(txt);
  return $('#form1 > div.main > div.con > div.info > p > span').text();
}*/
async function site2Html(name): Promise<TrashType> {
  const response = await nodeFetch(`http://lajifenleiapp.com/sk/${encodeURIComponent(name)}`);
  const txt = await response.text();
  const $ = cheerio.load(txt);
  // 由于上面那个网站的type可能会返回多余信息，比如 "湿垃圾/厨余垃圾"而不是直接"湿垃圾"，所以这里进行判断确保统一性
  const type = $('body > div.container > div:nth-child(7) > div > h1 > span:nth-child(3)').text();
  if(type.includes(TrashType.湿垃圾)) return TrashType.湿垃圾;
  if(type.includes(TrashType.可回收物)) return TrashType.可回收物;
  if(type.includes(TrashType.干垃圾)) return TrashType.干垃圾;
  if(type.includes(TrashType.有害垃圾)) return TrashType.有害垃圾;
  return TrashType.未知;
}