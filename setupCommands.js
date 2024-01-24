import {
  btnMsgs,
  changeStatus,
  getCalendarKeyboard,
  initStatus,
  monthNumbers,
} from "./index.js";
import { Keyboard } from "grammy";
import dayjs from "dayjs";
import { formattedList } from "./formatter.js";

export function setupCommands(bot) {
  const cmd = {
    start: "start",
    faq: "faq",
    insert: "insert",
    list: "list",
  };

  const cmdDesc = {
    start: "Dammi una botta... di vita",
    faq: "Faq-ami tutta",
    insert: "Oh sì, mettilo dentro",
    list: "Body count",
  };

  //start
  bot.command(cmd.start, async (ctx) => {
    let userId = ctx.from.id;
    if (monthNumbers[userId] === undefined) {
      monthNumbers[userId] = dayjs().month();
    }
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
        `/${cmd.insert}: inserisci un nuovo posto\n`
    );
  });

  //insert
  bot.command(cmd.insert, async (ctx) => {
    initStatus(ctx.from.id, "insert");
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
    let mockPlaces = [
      {
        ID: 2,
        CHATID: 1,
        USERID: "mell0r1ne",
        TIMESTAMP: "2024-01-24 11:52:44",
        NAME: "giappone",
        VISITED: null,
        RATING: null,
        TYPE: "visitare",
        URL: null,
      },
      {
        ID: 3,
        CHATID: 1,
        USERID: "mell0r1ne",
        TIMESTAMP: "2024-01-24 11:54:03",
        NAME: "Rock Burger",
        VISITED: "2024-01-24 12:04:39",
        RATING: 3.4,
        TYPE: "mangiare",
        URL: "http://www.rockburgertorino.it/",
      },
      {
        ID: 3,
        CHATID: 1,
        USERID: "mell0r1ne",
        TIMESTAMP: "2024-01-24 11:54:03",
        NAME: "La prosciutteria",
        VISITED: null,
        RATING: null,
        TYPE: "mangiare",
        URL: "http://www.rockburgertorino.it/",
      },
    ];
    await ctx.reply(formattedList(mockPlaces), {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true
      },
    });
  });

  //menu creation
  bot.api.setMyCommands(
    Object.entries(cmd).map(([key, value]) => {
      return { command: value, description: cmdDesc[key] };
    })
  );
}
