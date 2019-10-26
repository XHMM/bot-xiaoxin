FROM node:10-slim

WORKDIR /xiaoxin-bot

# 这两个变量用来配置代理，从而确保下述指令可被愉快地构建
# ENV http_proxy http://192.168.1.103:1080
# ENV https_proxy http://192.168.1.103:1080

# 这一步用于安装使用puppeteer(需要VPN)。使用机器人的"单词"命令时会用到puppeteer。若暂不需要，可注释该步构建
RUN  apt-get update \
     && apt-get install -y wget --no-install-recommends \
     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
     && apt-get update \
     && apt-get install -y google-chrome-unstable --no-install-recommends \
     && rm -rf /var/lib/apt/lists/* \
     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
     && chmod +x /usr/sbin/wait-for-it.sh
# 若注释了上述构建，则请取消注释下面这个构建确保npm i时不会下载chroxxx
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apt-get update && apt-get install -y git

COPY package*.json ./


RUN npm install --production

COPY . .

RUN chmod +x ./wait-for-it.sh

ENTRYPOINT []
CMD ["./wait-for-it.sh","-s","-t","23","monstache:8080","--", "npm", "run", "dev"]