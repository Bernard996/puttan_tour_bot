import {Bot, InlineKeyboard, Keyboard} from "grammy";
import {setupCommands} from "./setupCommands.js";
import dayjs from "dayjs";

***REMOVED***
const bot = new Bot(token);
const days_31 = [0, 2, 4, 6, 7, 9, 11]
const days_30 = [3, 5, 8, 10]
const days_28 = [1]
export const usersStatus = {
	// "-1": {
	// 	start: true,
	// 	insert: false,
	// 	selectFood: false,
	// 	selectVisit: false,
	// 	selectDate: false,
	// 	selectMonth: false,
	// 	selectYear: false,
	// }
};

export const btnMsgs = ["Posto dove mangiare", "Posto da visitare"];
export let monthNumbers = {}

function main() {

	let calendar = new Keyboard()
	let dayNumbers = {};
	setupCommands(bot);

	bot.on("message", async (ctx) => {

		let username = ctx.from.username
		let userId = ctx.from.id

		if (usersStatus[userId] === undefined) {
			initStatus(userId, 'start')
		}
		//handle start status
		if (usersStatus[userId]["start"]) {
			await ctx.reply(`Dammi un comando @${username}, sono la tua schiava!`, {
				reply_markup: {remove_keyboard: true, selective: true}
			});
		}
		//handle insert status, showing the keyboard
		else if (usersStatus[userId]["insert"]) {
			//error message with wrong strings
			if (ctx.message.text !== btnMsgs[0] && ctx.message.text !== btnMsgs[1]) {
				await ctx.reply(
					`@${username} hai sbagliato! Devi scegliere la tipologia di posto da inserire!`
				);
			}
			//right case, handling name insert
			else {
				if (ctx.message.text === btnMsgs[0]) {
					await ctx.reply(`@${username} inserisci il nome del posto dove mangiare`, {
						reply_markup: {
							selective: true,
							force_reply: true
						},
					});
					changeStatus(userId, "selectFood");
				} else if (ctx.message.text === btnMsgs[1]) {
					await ctx.reply(`@${username} inserisci il nome del posto da visitare`, {
						reply_markup: {
							selective: true,
							force_reply: true
						}
					});
					changeStatus(userId, "selectVisit");
				}
			}
		}

		//handle url insert
		else if (usersStatus[userId]["selectFood"] || usersStatus[userId]["selectVisit"]) {
			let key = new Keyboard()
			key.selective = true
			key.resized()
			key.text("Salta")
			await ctx.reply(`@${username} Inserisci l'URL del posto selezionato (opzionale)`, {
				reply_markup: {
					...key,
					force_reply: true
				},
			});
		}

		//handle select date
		else if (usersStatus[userId]["selectDate"]) {
			if (ctx.message.text === "⬅️") {
				let id = userId
				if (monthNumbers[id] === undefined) {
					monthNumbers[id] = dayjs.month()
				}
				monthNumbers[id] -= 1
				if (monthNumbers[id] < 0) {
					monthNumbers[id] = 11
				}
				let monthName = getMonthName(monthNumbers[id])
				calendar = getCalendarKeyboard(monthNumbers[id])
				await ctx.reply(`@${username}: ${monthName}`, {
					reply_markup: calendar
				})
			} else if (ctx.message.text === "➡️") {
				let id = userId
				if (monthNumbers[id] === undefined) {
					monthNumbers[id] = dayjs.month()
				}
				monthNumbers[id] += 1
				if (monthNumbers[id] > 11) {
					monthNumbers[id] = 0
				}
				let monthName = getMonthName(monthNumbers[id])
				calendar = getCalendarKeyboard(monthNumbers[id])
				await ctx.reply(`@${username}: ${monthName}`, {
					reply_markup: calendar
				})
			} else if (checkCorrectDayNum(ctx.message.text, monthNumbers[userId])) {
				dayNumbers[userId] = ctx.message.text
				await ctx.reply(`${dayNumbers[userId]}/${monthNumbers[userId] + 1}/${dayjs().year()} è la data che hai scelto!`)
			} else if (checkCorrectMonthName(ctx.message.text)) {
				calendar = getMonthsKeyboard()
				await ctx.reply(`@${username} Scegli il mese`, {
					reply_markup: calendar
				})
				changeStatus(userId, "selectMonth")
			} else {
				await ctx.reply("Inserisci una data corretta!")
			}
		}

		// handle month selection
		else if (usersStatus[userId]["selectMonth"]) {
			if (checkCorrectMonthName(ctx.message.text)) {
				await switchMonth(getMonthNum(ctx.message.text), ctx)
				changeStatus(userId, "selectDate")
			} else {
				await ctx.reply("Inserisci un mese corretto!")
			}
		}
	});

	bot.callbackQuery("skip", async (ctx) => {
		await ctx.reply("skip")
	})

	//Start the Bot
	bot.start();
}

function getMonthsKeyboard() {
	let monthKeyboard = new Keyboard()
	monthKeyboard.row("Gennaio", "Febbraio", "Marzo")
	monthKeyboard.row("Aprile", "Maggio", "Giugno")
	monthKeyboard.row("Luglio", "Agosto", "Settembre")
	monthKeyboard.row("Ottobre", "Novembre", "Dicembre")
	monthKeyboard.resized()
	monthKeyboard.selective = true
	return monthKeyboard
}

// function getYearsKeyboard(){
//
// }

export function initStatus(id, status) {
	usersStatus[id.toString()] = {
		start: false,
		insert: false,
		selectFood: false,
		selectVisit: false,
		selectDate: false,
		selectMonth: false,
		selectYear: false,
	}
	Object.entries(usersStatus[id.toString()]).forEach(([key, _value]) => {
		usersStatus[id.toString()][key] = key === status;
	});
}

export function changeStatus(id, cmd) {
	Object.entries(usersStatus[id]).forEach(([key, _value]) => {
		usersStatus[id][key] = key === cmd;
	});
	console.log(usersStatus[id]);
}

async function switchMonth(monthNum, ctx) {
	let id = ctx.from.id
	let username = ctx.from.username
	let monthName = getMonthName(monthNum)
	monthNumbers[id] = monthNum
	let calendar = getCalendarKeyboard(monthNum)
	await ctx.reply(`@${username}: ${monthName}`, {
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

function checkCorrectMonthName(month) {
	let months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio",
		"Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
	return months.includes(month)
}

function checkCorrectDayNum(dayNum, monthNum) {
	let days = 0
	if (days_31.includes(monthNum)) {
		days = 31
	} else if (days_30.includes(monthNum)) {
		days = 30
	} else if (days_28.includes(monthNum)) {
		days = 28
	}
	if (dayNum.match(/^\d+$/)) {
		dayNum = parseInt(dayNum)
		if (dayNum > 0 && dayNum <= days) {
			return true
		}
	} else {
		return false
	}
}

export function getCalendarKeyboard(monthNum) {
	let monthName = getMonthName(monthNum)
	let days = 0

	if (days_31.includes(monthNum)) {
		days = 31
	} else if (days_30.includes(monthNum)) {
		days = 30
	} else if (days_28.includes(monthNum)) {
		days = 28
	}
	let calendar = new Keyboard()
	// calendar.row("Cambia mese")
	// calendar.row("Cambia mese", "Anni")
	// calendar.row(dayjs().year().toString())
	calendar.row("⬅️", monthName, "➡️")
	for (let i of Array(days).keys()) {
		if (i % 7 === 0) {
			calendar.row()
		}
		calendar.text((i + 1).toString())
	}
	calendar.resized()
	calendar.selective = true
	return calendar
}

main()
