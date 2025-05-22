import fetch from "node-fetch";
import { Client, GatewayIntentBits } from "discord.js";

const DISCORD_BOT_TOKEN = "";
const CHANNEL_ID = "1374934627860349109";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  setInterval(fetchAndSendPrice, 15 * 1000); // 每 5 分鐘
  fetchAndSendPrice(); // 啟動時立即一次
});

// 可選：加入訊息查詢指令
client.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("!price")) {
    const [, coin] = msg.content.split(" ");
    if (!coin) return;
    const symbol = `${coin.toUpperCase()}-USDT`;
    try {
      const price = await fetchBingXPrice(symbol);

      msg.reply(`${coin.toUpperCase()}/USDT 價格為：$${price}`);
    } catch {
      msg.reply(`查無 ${coin.toUpperCase()}，請確認輸入是否正確。`);
    }
  }
});

async function fetchBingXPrice(symbol) {
  const url = `https://open-api.bingx.com/openApi/spot/v1/ticker/price?symbol=${symbol}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`BingX API error: ${json.msg}`);
  return json.data[0].trades[0].price;
}

async function fetchAndSendPrice() {
  try {
    const btc = await fetchBingXPrice("BTC_USDT");
    const eth = await fetchBingXPrice("ETH_USDT");

    const message = `📊 BingX 價格更新：
    🟠 BTC/USDT：$${btc}
    🔷 ETH/USDT：$${eth}`;

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      channel.send(message);
    }
  } catch (err) {
    console.error("🚫 發送失敗：", err.message);
  }
}

client.login(DISCORD_BOT_TOKEN);
