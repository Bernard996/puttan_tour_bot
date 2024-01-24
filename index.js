import {Bot, InlineKeyboard, Keyboard} from "grammy";
import {setupCommands} from "./setupCommands.js";
import dayjs from "dayjs";
import dao from "./db/dao.mjs";

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
let usersNewPlace = {}

function main() {

	let calendar = new Keyboard()
	let dayNumbers = {};
	setupCommands(bot);

	bot.on("message", async (ctx) => {

		let username = ctx.from.username
		let userId = ctx.from.id
		const message = ctx.message.text;

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
			if (message !== btnMsgs[0] && message !== btnMsgs[1]) {
				await ctx.reply(
					`@${username} hai sbagliato! Devi scegliere la tipologia di posto da inserire!`
				);
			}
			//right case, handling type choice
			else {
				usersNewPlace[userId]["type"] = message.split(" ")[2]
				if (message === btnMsgs[0]) {
					await ctx.reply(`@${username} inserisci il nome del posto dove mangiare`, {
						reply_markup: {
							selective: true,
							force_reply: true
						},
					});
					changeStatus(userId, "selectFood");
				} else if (message === btnMsgs[1]) {
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

		//handle name insert
		else if (usersStatus[userId]["selectFood"] || usersStatus[userId]["selectVisit"]) {
			let key = new InlineKeyboard()
			key.text("Sì", "s")
			key.text("No", "n")
			usersNewPlace[userId]["name"] = message
			changeStatus(userId, "askUrl")
			await ctx.reply(`@${username} Vuoi inserire un URL per il posto?`, {
				reply_markup: {
					...key,
					force_reply: true
				},
			});
		}

		else if (usersStatus[userId]["askUrl"]) {}

		else if (usersStatus[userId]["selectUrl"]) {
			usersNewPlace[userId]["url"] = message
			await insertPlace(usersNewPlace[userId], ctx)
		}

		//handle select date
		else if (usersStatus[userId]["selectDate"]) {
			if (message === "⬅️") {
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
			} else if (message === "➡️") {
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
			} else if (checkCorrectDayNum(message, monthNumbers[userId])) {
				dayNumbers[userId] = message
				await ctx.reply(`${dayNumbers[userId]}/${monthNumbers[userId] + 1}/${dayjs().year()} è la data che hai scelto!`)
			} else if (checkCorrectMonthName(message)) {
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
			if (checkCorrectMonthName(message)) {
				await switchMonth(getMonthNum(message), ctx)
				changeStatus(userId, "selectDate")
			} else {
				await ctx.reply("Inserisci un mese corretto!")
			}
		}
	});

	bot.callbackQuery("skip", async (ctx) => {
		await ctx.reply("skip")
	})

	bot.callbackQuery("s", async (ctx) => {
		changeStatus(ctx.from.id, "selectUrl")
		await ctx.reply(`@${ctx.from.username} Inserisci l'URL del posto`, {
			reply_markup: {
				force_reply: true
			}
		})
	})
	bot.callbackQuery("n", async (ctx) => {
		await insertPlace(usersNewPlace[ctx.from.id], ctx)
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
		askUrl: false,
		selectUrl: false
	}
	Object.entries(usersStatus[id.toString()]).forEach(([key, _value]) => {
		usersStatus[id.toString()][key] = key === status;
	});
}

export function initNewPlace(userId, chatId) {
	usersNewPlace[userId.toString()] = {
		chatId: chatId,
		userId: userId,
		name: "",
		type: "",
		url: "",
	}
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

async function insertPlace(place, ctx) {
	dao.insertPlace(place.chatId, place.userId, place.name, place.type, place.url)
		.then(async (id) => {
			changeStatus(ctx.from.id, "start")
			delete usersNewPlace[place.userId.toString()]
			await ctx.reply("Posto inserito correttamente!", {
				reply_markup: {remove_keyboard: true, selective: true}
			})
		})
		.catch(async (err) => {
			changeStatus(ctx.from.id, "start")
			delete usersNewPlace[place.userId.toString()]
			await ctx.reply(`Errore durante l'inserimento del posto: ${err}`, {
				reply_markup: {remove_keyboard: true, selective: true}
			})
		})
}

main()
