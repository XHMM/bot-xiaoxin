import * as pp from "puppeteer";

interface IMean {
  type: string; // 词性
  chinese: string; // 中文释义
  english: string; // 英文释义
  sentences: Array<{
    english: string;
    chinese: string;
  }>;
}
export default async function getWordTranslation(word: string): Promise<IMean[] | undefined> {
  // 带空格的不是单词了，没有柯林斯
  if (word.trim().length === 0 || !/[a-zA-Z-]/.test(word)) {
    // throw new Error(`received ${word}, not match /[a-zA-Z\\-]/`);
    return undefined;
  }
  const browser = await pp.launch({
    headless: true,
    args: ["--proxy-server='direct://'", "--proxy-bypass-list=*", '--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 860
    });
    await page.goto("http://www.iciba.com/");
    await page.type(
      "#app > div > div.home-banner > div > div > form > input[type=search]",
      word
    );
    await page.click("#app > div > div.home-banner > div > div > form > div");
    // 结果页可能会蹦出广告modal "一键安装词霸桌面版" ...
    try {
      const $adClose = await page.waitForSelector("body > div.cb-downmask > div > a", {
        timeout: 1000
      })
      console.log('[api_word] 词霸出现广告弹出')
      await $adClose.click();
    } catch (e) {
      console.log('[api_word] 词霸没有弹出广告')
    }
    // 侧边那个菜单的词典列表起初是空的...
    await page.waitForFunction(() => {
      const $el = document.querySelector<HTMLDivElement>('body > div.screen > div.container > div.menu > div:nth-child(1) > div > span')
      return $el && $el.textContent!.length!==0
    });
    const hasCollinsDict = await page.evaluate(() => {
      const $menu = document.querySelector('body > div.screen > div.container > div.menu')!;
      return $menu.parentNode!.textContent!.includes("柯林斯");
    });
    if (hasCollinsDict) {
      console.log('[api_word] '+word+"有柯林斯释义");
      await page.waitFor(1000);
      // 该返回列表里会包含一些display:none的元素
      const articles = await page.$$(".info-article:not(.info-base)");
      // console.log(articles.length);
      for (let i = 0; i < articles.length; i++) {
        const $parent: any = articles[i];

        const isHidden = await page.evaluate(($elem) => {
          return $elem.style.display === 'none'
        }, $parent);
        if(isHidden) continue;

        const $head = await $parent.$(".article-list .current");
        const isCollinsBlock = await page.evaluate($elem => {
          return $elem.textContent.includes("柯林斯");
        }, $head);

        if (isCollinsBlock) {
          const $content = await $parent.$(".article");

          const content = await page.evaluate(($elem: HTMLDivElement) => {
            const result: IMean[] = [];
            const sections = $elem.querySelectorAll(".section-prep"); // 不同释义 块

            sections.forEach($section => {
              const sentences: IMean["sentences"] = [];
              $section.querySelectorAll(".text-sentence").forEach($sentence => {
                sentences.push({
                  english: $sentence.querySelector(".family-english span")!
                    .textContent  || "",
                  chinese: $sentence.querySelector(".family-chinese")!.textContent || ""
                });
              });

              result.push({
                type: $section.querySelector(".size-chinese .family-english")!
                  .textContent || "",
                chinese: $section.querySelector(".size-chinese .family-chinese")!
                  .textContent || "",
                english: $section.querySelector(".size-chinese .prep-en")!
                  .textContent || "",
                sentences
              });
            });
            return result;
          }, $content);
          // console.log(inspect(content, { depth: Infinity }));
          return content;
        }
      }
    } else {
      console.log('[api_word] '+word+"无柯林斯释义");
      return undefined;
    }
  } catch (e) {
    console.error('third_api::getWordTranslation error::::::::');
    console.error(e);
    return undefined;
  } finally {
    await browser.close();
  }
}
