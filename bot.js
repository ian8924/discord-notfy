import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";

// Discord 機器人設定
const DISCORD_BOT_TOKEN = "";
const CHANNEL_ID = "1374934627860349109";

// 建立 Discord 客戶端
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  setInterval(fetchAndSendPrice, 10 * 1000);
  fetchAndSendPrice(); // 初始執行
});

async function fetchOKXPrice(symbol) {
  const url = `https://www.okx.com/api/v5/market/ticker?instId=${symbol}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.code !== "0") throw new Error(`API Error: ${json.msg}`);
  const price = json.data[0].last;
  return price;
}

async function fetchAndSendPrice() {
  try {
    const btc = await fetchOKXPrice("BTC-USDT");
    const eth = await fetchOKXPrice("ETH-USDT");

    const message = `📈 OKX 即時價格：
    🟠 BTC/USDT: $${btc}
    🔷 ETH/USDT: $${eth}`;

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      channel.send(message);
    }
  } catch (error) {
    console.error("取得價格或發送訊息失敗:", error);
  }
}

// 登入 Discord
client.login(DISCORD_BOT_TOKEN);
