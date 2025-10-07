import TelegramBot from "node-telegram-bot-api";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

let bot: TelegramBot | null = null;

if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
}

export async function sendTelegramAlert(
  listingTitle: string,
  listingUrl: string,
  price: string,
  confidenceScore: number,
  detectedMaterials: string[],
  aiReasoning: string
): Promise<boolean> {
  if (!bot || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram bot not configured - skipping alert");
    return false;
  }

  try {
    const message = `
🔔 *Hidden Gem Found!*

*${listingTitle}*

💰 Price: ${price}
🎯 Confidence: ${confidenceScore}%
💎 Materials: ${detectedMaterials.join(", ")}

📝 AI Analysis:
${aiReasoning}

🔗 [View Listing](${listingUrl})
    `.trim();

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: "Markdown",
      disable_web_page_preview: false,
    });

    console.log(`Telegram alert sent for listing: ${listingTitle}`);
    return true;
  } catch (error: any) {
    console.error("Error sending Telegram alert:", error.message);
    return false;
  }
}
