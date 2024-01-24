import {btnMsgs, changeStatus, getCalendarKeyboard, initStatus, monthNumbers} from "./index.js";
import {Keyboard} from "grammy";
import dayjs from "dayjs";

export function setupCommands(bot) {
	const cmd = {
		start: "start",
		faq: "faq",
		insert: "insert",
	};

	const cmdDesc = {
		start: "Dammi una botta... di vita",
		faq: "Faq-ami tutta",
		insert: "Oh sì, mettilo dentro",
	};

	//start
	bot.command(cmd.start, async (ctx) => {
		let userId = ctx.from.id;
		if(monthNumbers[userId] === undefined){
			monthNumbers[userId] = dayjs().month();
		}
		let calendar = getCalendarKeyboard(monthNumbers[userId])
		initStatus(userId);
		changeStatus(userId,"selectDate")
		await ctx.reply(
			"Ciao Zoccola!\nQuesto è il nostro bot per gestire i posti dove andare a battere insieme!\n\nEh? Ancora non hai capito come funziona il bot? 😅 Che puttana...\n\nLancia il comando /faq per vedere i dettagli sul listino prezzi!", {
				// reply_markup: {remove_keyboard: true},
				reply_markup: calendar
			}
		);
		// changeStatus(ctx.from.id, "cmd.start);
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
		const keyboard = new Keyboard();
		keyboard.add(btnMsgs[0], btnMsgs[1]);
		keyboard.oneTime();
		keyboard.resize_keyboard = true;
		await ctx.reply("Ok, bene, aspetta che ti applaudo per l'idea.\n\nPerchè me lo stai proponendo?", {
			reply_markup: keyboard,
		});
		changeStatus(ctx.from.id, cmd.insert);
	});

	//menu creation
	bot.api.setMyCommands(
		Object.entries(cmd).map(([key, value]) => {
			return {command: value, description: cmdDesc[key]};
		})
	);
}
