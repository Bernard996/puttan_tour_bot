import { Bot } from "grammy";
import { setupCommands } from "./setupCommands.js";

***REMOVED***
const bot = new Bot(token);

export const status = {
  start: true,
  insert: false,
  selectFood: false,
  selectVisit: false,
};

export const btnMsgs = ["Posto dove mangiare", "Posto da visitare"];

function main(){
  setupCommands(bot);

  bot.on("message", async (ctx) => {
    //handle start status
    if (status.start) {
      await ctx.reply("Dammi un comando, sono la tua schiava!", {
        reply_markup: {remove_keyboard: true}
      });
      changeStatus("start");
    }
    //handle insert status, showing the keyboard
    else if (status.insert) {
      //error message with wrong strings
      if (ctx.message.text !== btnMsgs[0] && ctx.message.text !== btnMsgs[1]) {
        await ctx.reply(
          "Hai sbagliato! Devi scegliere la tipologia di posto da inserire!"
        );
      }
      //right case, handling name insert
      else {
        if (ctx.message.text === btnMsgs[0]) {
          await ctx.reply("Inserisci il nome del posto dove mangiare", {
            reply_markup:{remove_keyboard: true}
          });
          changeStatus("selectFood");
        } else if (ctx.message.text === btnMsgs[1]) {
          await ctx.reply("Inserisci il nome del posto da visitare", {
            reply_markup:{remove_keyboard: true}
          });
          changeStatus("selectVisit");
        }
      }
    }
    //handle url insert
    else if (status.selectFood || status.selectVisit) {
      await ctx.reply("Inserisci l'URL del posto selezionato (opzionale)");
    }
  });

  //Start the Bot
  bot.start();
}



export function changeStatus(cmd) {
  Object.entries(status).forEach(([key, _value]) => {
    status[key] = key === cmd;
  });
  console.log(status);
}

main()
