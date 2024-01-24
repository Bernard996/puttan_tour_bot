import {Bot, Keyboard} from "grammy";
import {setupCommands} from "./setupCommands.js";
import dayjs from "dayjs";

***REMOVED***
const bot = new Bot(token);
const days_31 = [0, 2, 4, 6, 7, 9, 11]
const days_30 = [3, 5, 8, 10]
const days_28 = [1]
export const status = {
	start: true,
	insert: false,
	selectFood: false,
	selectVisit: false,
	selectDate: false,
};

export const btnMsgs = ["Posto dove mangiare", "Posto da visitare"];
export let monthNumbers = {}

function main() {

	let calendar = new Keyboard()
	const now = dayjs()
	let monthNum = now.month();
	let dayNumbers = {};
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
						reply_markup: {remove_keyboard: true}
					});
					changeStatus("selectFood");
				} else if (ctx.message.text === btnMsgs[1]) {
					await ctx.reply("Inserisci il nome del posto da visitare", {
						reply_markup: {remove_keyboard: true}
					});
					changeStatus("selectVisit");
				}
			}
		}
		//handle url insert
		else if (status.selectFood || status.selectVisit) {
			await ctx.reply("Inserisci l'URL del posto selezionato (opzionale)");
		}

		//handle select date
		else if (status.selectDate) {
			if(ctx.message.text === "⬅️"){
				let id = ctx.from.id
				if(monthNumbers[id] === undefined){
					monthNumbers[id] = dayjs.month()
				}
				monthNumbers[id] -= 1
				if(monthNumbers[id] < 0){
					monthNumbers[id] = 11
				}
				let monthName = getMonthName(monthNumbers[id])
				calendar = getCalendarKeyboard(monthNumbers[id])
				await ctx.reply(monthName, {
					reply_markup: calendar
				})
			}
			else if(ctx.message.text === "➡️"){
				let id = ctx.from.id
				if(monthNumbers[id] === undefined){
					monthNumbers[id] = dayjs.month()
				}
				monthNumbers[id] += 1
				if(monthNumbers[id] > 11){
					monthNumbers[id] = 0
				}
				let monthName = getMonthName(monthNumbers[id])
				calendar = getCalendarKeyboard(monthNumbers[id])
				await ctx.reply(monthName, {
					reply_markup: calendar
				})
			}
			else if(checkCorrectDayNum(ctx.message.text, monthNumbers[ctx.from.id])){
				dayNumbers[ctx.from.id] = ctx.message.text
				await ctx.reply(`${dayNumbers[ctx.from.id]}/${monthNumbers[ctx.from.id]+1}/${dayjs().year()} è la data che hai scelto!`)
			}
			else if(checkCorrectMonthName(ctx.message.text)){
				switchMonth(getMonthNum(ctx.message.text), ctx.from.id)
			}
			else {
				await ctx.reply("Inserisci una data corretta!")
			}
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

function switchMonth(monthNum, id){
	let monthName = getMonthName(monthNum)
	monthNumbers[id] = monthNum
	let calendar = getCalendarKeyboard(monthNum)
	bot.api.sendMessage(id, monthName, {
		reply_markup: calendar
	})
}

function getMonthName(monthNum) {
	switch (monthNum) {
		case 0:
			return "Gennaio"
		case 1:
			return "Febbraio"
		case 2:
			return "Marzo"
		case 3:
			return "Aprile"
		case 4:
			return "Maggio"
		case 5:
			return "Giugno"
		case 6:
			return "Luglio"
		case 7:
			return "Agosto"
		case 8:
			return "Settembre"
		case 9:
			return "Ottobre"
		case 10:
			return "Novembre"
		case 11:
			return "Dicembre"
	}

}

function getMonthNum(monthName) {
	switch (monthName) {
		case "Gennaio":
			return 0
		case "Febbraio":
			return 1
		case "Marzo":
			return 2
		case "Aprile":
			return 3
		case "Maggio":
			return 4
		case "Giugno":
			return 5
		case "Luglio":
			return 6
		case "Agosto":
			return 7
		case "Settembre":
			return 8
		case "Ottobre":
			return 9
		case "Novembre":
			return 10
		case "Dicembre":
			return 11
	}
}

function checkCorrectMonthName(month){
	let months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio",
		"Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
	return months.includes(month)
}

function checkCorrectDayNum(dayNum, monthNum){
	let days = 0
	if(days_31.includes(monthNum)){
		days = 31
	}
	else if(days_30.includes(monthNum)){
		days = 30
	}
	else if(days_28.includes(monthNum)){
		days = 28
	}
	if(dayNum.match(/^\d+$/)){
		dayNum = parseInt(dayNum)
		if(dayNum > 0 && dayNum <= days){
			return true
		}
	}
	else {
		return false
	}
}

export function getCalendarKeyboard(monthNum){
	let monthName = getMonthName(monthNum)
	let days = 0

	if(days_31.includes(monthNum)){
		days = 31
	}
	else if(days_30.includes(monthNum)){
		days = 30
	}
	else if(days_28.includes(monthNum)){
		days = 28
	}
	let calendar = new Keyboard()
	calendar.row("Mesi", "Anni")
	calendar.row("⬅️", monthName, dayjs().year().toString(), "➡️")
	for(let i of Array(days).keys()){
		if(i % 7 === 0){
			calendar.row()
		}
		calendar.text((i+1).toString())
	}
	calendar.resized()
	return calendar
}

main()
