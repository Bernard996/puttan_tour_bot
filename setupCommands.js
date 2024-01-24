import {
  btnMsgs,
  changeStatus,
  getCalendarKeyboard,
  initStatus,
  monthNumbers,
  initNewPlace
} from "./index.js";
import { Keyboard } from "grammy";
import dayjs from "dayjs";
import { formattedList } from "./formatter.js";
import dao from "./db/dao.mjs";

export function setupCommands(bot) {
  const cmd = {
    start: "start",
    faq: "faq",
    insert: "insert",
    list: "list",
    set_visited: "set_visited"
  };

  const cmdDesc = {
    start: "Dammi una botta... di vita",
    faq: "Faq-ami tutta",
    insert: "Oh sì, mettilo dentro",
    list: "Body count",
    set_visited: "Qui ho già una clientela"
  };

  //start
  bot.command(cmd.start, async (ctx) => {
    let userId = ctx.from.id;
    initStatus(userId, "start");
    await ctx.reply(
      "Ciao Zoccola!\nQuesto è il nostro bot per gestire i posti dove andare a battere insieme!\n\nEh? Ancora non hai capito come funziona il bot? 😅 Che puttana...\n\nLancia il comando /faq per vedere i dettagli sul listino prezzi!",
      {
        reply_markup: { remove_keyboard: true, selective: true },
      }
    );
    changeStatus(ctx.from.id, "start");
  });

  //faq
  bot.command(cmd.faq, async (ctx) => {
    await ctx.reply(
      `/${cmd.start}: avvia il bot\n` +
        `/${cmd.faq}: mostra questo messaggio\n` +
        `/${cmd.insert}: inserisci un nuovo posto\n` +
        `/${cmd.list}: elenca tutti i posti\n` +
        `/${cmd.set_visited}: aggiorna un posto come visitato\n`
    );
  });

  //insert
  bot.command(cmd.insert, async (ctx) => {
    initStatus(ctx.from.id, "insert");
    initNewPlace(ctx.from.id.toString(), ctx.chat.id.toString());
    let username = ctx.from.username;
    const keyboard = new Keyboard();
    keyboard.add(btnMsgs[0], btnMsgs[1]);
    keyboard.oneTime();
    keyboard.resize_keyboard = true;
    keyboard.selective = true;
    await ctx.reply(
      `Ok, bene, aspetta che ti applaudo per l'idea.\n\nPerchè me lo stai proponendo, @${username}?`,
      {
        reply_markup: { ...keyboard, force_reply: true },
      }
    );
    changeStatus(ctx.from.id, cmd.insert);
  });

  //list
  bot.command(cmd.list, async (ctx) => {
    let places = await dao.getPlaces(ctx.chat.id.toString())
    await ctx.reply(formattedList(places), {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true
      },
    });
  });

  bot.command(cmd.set_visited, async (ctx) => {
    let places = await dao.getPlaces(ctx.chat.id.toString(), null, false)
    if(places && places.length > 0){
      initStatus(ctx.from.id, "setVisited")
      let placesKeyboard = new Keyboard()
      places.forEach(p => {
        placesKeyboard.row()
        placesKeyboard.add(p.NAME)
      })
      placesKeyboard.oneTime()
      placesKeyboard.resize_keyboard = true
      placesKeyboard.selective = true
      await ctx.reply(`@${ctx.from.username} Scegli il posto`, {
        reply_markup: {
          ...placesKeyboard,
          force_reply: true
        }
      })
    }
    else {
      await ctx.reply(`@${ctx.from.username} Non ci sono posti da visitare!`)
      changeStatus(ctx.from.id, "start")
    }
  })

  //menu creation
  bot.api.setMyCommands(
    Object.entries(cmd).map(([key, value]) => {
      return { command: value, description: cmdDesc[key] };
    })
  );
}
