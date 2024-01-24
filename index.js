import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { setupCommands } from "./setupCommands.js";

***REMOVED***
const bot = new Bot(token);

export const status = {
  start: true,
  insert: false,
  selectFood: false,
  selectVisit: false,
};

const btnMsgs = ["Posto dove mangiare", "Posto da visitare"];

export const keyboard = new Keyboard();
keyboard.add(btnMsgs[0], btnMsgs[1]);
keyboard.oneTime();
keyboard.resize_keyboard = true;

setupCommands(bot);

bot.on("message", async (ctx) => {
  if (status.start) {
    await ctx.reply("Dammi un comando, sono la tua schiava!");
    changeStatus("start");
  } 
  else if (status.insert) {
    if (ctx.message.text !== btnMsgs[0] && ctx.message.text !== btnMsgs[1]) {
      await ctx.reply(
        "Hai sbagliato! Devi scegliere la tipologia di posto da inserire!"
      );
    } 
    else {
      if (ctx.message.text === btnMsgs[0]) {
        await ctx.reply("Inserisci il nome del posto dove mangiare");
        changeStatus("selectFood");
      } else if (ctx.message.text === btnMsgs[1]) {
        await ctx.reply("Inserisci il nome del posto da visitare");
        changeStatus("selectVisit");
      }
    }
  }
  else if (status.selectFood || status.selectVisit) {
    await ctx.reply("Inserisci l'URL del posto selezionato (opzionale)");
  }
});

//Start the Bot
bot.start();

export function changeStatus(cmd) {
  Object.entries(status).forEach(([key, value]) => {
    if (key === cmd) {
      status[key] = true;
    } else {
      status[key] = false;
    }
  });
  console.log(status);
}
