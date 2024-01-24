import { Keyboard } from "grammy";
import { status, keyboard, changeStatus } from "./index.js";

export function setupCommands(bot) {
  const cmd = {
    start: "start",
    faq: "faq",
    insert: "insert",
  };

  const cmdDesc = {
    start: "Avvia il bot, zoccola",
    faq: "Faq-ami tutta",
    insert: "Inserisci un posto",
  };

  //start
  bot.command(cmd.start, async (ctx) => {
    await ctx.reply(
      "Ciao Zoccola! Questo è il nostro bot per gestire i posti dove andare a troieggiare insieme! Ancora non hai capito come funziona il bot? 😅 Sei proprio una puttana... Lancia il comando /faq per vedere i dettagli sui comandi disponibili e smettila di rompere i coglioni a me!"
    );
    changeStatus(cmd.start);
  });

  //faq
  bot.command(cmd.faq, async (ctx) => {
    await ctx.reply(
      `/${cmd.start}: avvia il bot\n` +
      `/${cmd.faq}: mostra questo messaggio\n`+
      `/${cmd.insert}: inserisci un nuovo posto\n`
    );
  });

  bot.command(cmd.insert, async (ctx) => {
    await ctx.reply("Scegli il tipo di posto che vuoi inserire", {
      reply_markup: keyboard,
    });
    changeStatus(cmd.insert);
  });

  //menu
  bot.api.setMyCommands(
    Object.entries(cmd).map(([key, value]) => {
      return { command: value, description: cmdDesc[key] };
    })
  );
}
