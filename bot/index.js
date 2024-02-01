import {Bot, InlineKeyboard, Keyboard} from "grammy";
import {setupCommands} from "./setupCommands.js";
import dayjs from "dayjs";
import dao from "./db/dao.mjs";
import {formattedComments, formattedList} from "./formatter.js";
import 'dotenv/config'

const token= process.env.TOKEN;
// const token= process.env.TEST_TOKEN;
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
	// 	setVisited: false,
	// }
};

export const btnMsgs = ["Posto dove mangiare", "Posto da visitare"];
let monthNumbers = {}
let usersNewPlace = {}
let usersPlaceToEdit = {}
let userListParams = {}
let userYear = {}

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
		/*
		//handle start status
		if (usersStatus[userId]["start"]) {
			await ctx.reply(`Dammi un comando @${username}, sono la tua schiava!`, {
				reply_markup: {remove_keyboard: true, selective: true}
			});
		}
		*/
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
			key.text("Sì", "urlS")
			key.text("No", "urlN")
			usersNewPlace[userId]["name"] = message
			changeStatus(userId, "askUrl")
			await ctx.reply(`@${username} Vuoi inserire un URL per il posto?`, {
				reply_markup: {
					...key,
					force_reply: true,
					selective: true
				},
			});
		}

		//handle ask user to insert url
		else if (usersStatus[userId]["askUrl"]) {}

		//handle url insert
		else if (usersStatus[userId]["selectUrl"]) {
			usersNewPlace[userId]["url"] = message
			await insertPlace(usersNewPlace[userId], ctx)
		}

		//handle select date
		else if (usersStatus[userId]["selectDate"]) {
			if (message === "⬅️") {
				if (monthNumbers[userId] === undefined) {
					monthNumbers[userId] = dayjs.month()
				}
				monthNumbers[userId] -= 1
				if (monthNumbers[userId] < 0) {
					monthNumbers[userId] = 11
				}
				let monthName = getMonthName(monthNumbers[userId])
				calendar = getCalendarKeyboard(monthNumbers[userId], userYear[userId].year)
				await ctx.reply(`@${username}: ${monthName}`, {
					reply_markup: calendar
				})
			}
			else if (message === "➡️") {
				if (monthNumbers[userId] === undefined) {
					monthNumbers[userId] = dayjs.month()
				}
				monthNumbers[userId] += 1
				if (monthNumbers[userId] > 11) {
					monthNumbers[userId] = 0
				}
				let monthName = getMonthName(monthNumbers[userId])
				calendar = getCalendarKeyboard(monthNumbers[userId], userYear[userId].year)
				await ctx.reply(`@${username}: ${monthName}`, {
					reply_markup: calendar
				})
			}
			else if (message === "Oggi") {
				let places = await dao.getPlaces(ctx.chat.id.toString(), null, false)
				if (places && places.length > 0) {
					let place = places.find((place) => place.NAME === usersPlaceToEdit[userId].NAME)
					await dao.setPlaceVisited(place.ID, dayjs().format("YYYY-MM-DD"))
					delete usersPlaceToEdit[userId]
					await ctx.reply(`Hai visitato ${place.NAME} in data ${dayjs().format("DD/MM/YYYY")}`, {
						reply_markup: {
							remove_keyboard: true,
							selective: true
						}
					})
				}
			}
			else if (checkCorrectDayNum(message, monthNumbers[userId])) {
				dayNumbers[userId] = message
				let places = await dao.getPlaces(ctx.chat.id.toString(), null, false)
				if (places && places.length > 0) {
					let place = places.find((place) => place.NAME === usersPlaceToEdit[userId].NAME)
					await dao.setPlaceVisited(place.ID, `${dayjs().year()}-${monthNumbers[userId] + 1}-${dayNumbers[userId]}`)
					delete usersPlaceToEdit[userId]
					await ctx.reply(`Hai visitato ${place.NAME} in data ${dayNumbers[userId]}/${monthNumbers[userId] + 1}/${userYear[userId].year}`, {
						reply_markup: {
							remove_keyboard: true,
							selective: true
						}
					})
				}
			}
			else if (checkCorrectMonthName(message)) {
				calendar = getMonthsKeyboard()
				await ctx.reply(`@${username} Scegli il mese`, {
					reply_markup: calendar
				})
				changeStatus(userId, "selectMonth")
			}
			else if (message === userYear[userId].year.toString()) {
				let yearKeyboard = getYearsKeyboard(userId)
				changeStatus(userId, "selectYear")
				await ctx.reply(`@${username} Seleziona l'anno`, {
					reply_markup: yearKeyboard
				})
			}
			else {
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

		//handle year selection
		else if (usersStatus[userId]["selectYear"]) {
			if(message === '⬅️'){
				userYear[userId].page -= 1
				let yearKeyboard = getYearsKeyboard(userId)
				await ctx.reply(`@${username} Seleziona l'anno`, {
					reply_markup: yearKeyboard
				})
			}
			else if(message === '➡️'){
				userYear[userId].page += 1
				let yearKeyboard = getYearsKeyboard(userId)
				await ctx.reply(`@${username} Seleziona l'anno`, {
					reply_markup: yearKeyboard
				})
			}
			else if(message.match(/^\d+$/)){
				userYear[userId].year = parseInt(message)
				let yearKeyboard = getCalendarKeyboard(monthNumbers[userId], userYear[userId].year)
				changeStatus(userId, "selectDate")
				await ctx.reply(`@${username} Inserisci la data in cui hai visitato 'prova 2'`, {
					reply_markup: yearKeyboard
				})
			}
			else {
				await ctx.reply("Inserisci un anno corretto!")
			}
		}

		//handle set visited
		else if (usersStatus[userId]["setVisited"]) {
			let places = await dao.getPlaces(ctx.chat.id.toString(), null, false)
			let placesNames
			if (places && places.length > 0) {
				placesNames = places.map((place) => place.NAME)
				if (placesNames.includes(message)) {
					usersPlaceToEdit[userId] = places.find((place) => place.NAME === message)
					if (monthNumbers[userId] === undefined) {
						monthNumbers[userId] = dayjs().month();
					}
					if(userYear[userId] === undefined){
						userYear[userId] =
							{
								year: dayjs().year(),
								page: 0
							}
					}
					calendar = getCalendarKeyboard(monthNumbers[userId], userYear[userId].year)
					changeStatus(userId, "selectDate")
					await ctx.reply(`@${username} Inserisci la data in cui hai visitato '${message}'`, {
						reply_markup: calendar
					})
				}
			}
		}

		//handle place rating selection
		else if (usersStatus[userId]["rate"]) {
			let places = await dao.getPlaces(ctx.chat.id.toString(), null, true)
			let placesNames
			if (places && places.length > 0) {
				placesNames = places.map((place) => place.NAME)
				if (placesNames.includes(message)) {
					usersPlaceToEdit[userId] = places.find((place) => place.NAME === message)
					let rateKeyboard = new Keyboard()
					rateKeyboard.row("⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐")
					rateKeyboard.resize_keyboard = true
					rateKeyboard.selective = true
					await ctx.reply(`@${username} Inserisci il voto da 1 a 5`, {
						reply_markup: rateKeyboard
					})
					changeStatus(userId, "applyRate")
				}
			}
		}

		//handle apply rating
		else if (usersStatus[userId]["applyRate"]) {
			let regex = RegExp("⭐{1,5}")
			if(regex.test(message) && message.length <= 5){
				usersPlaceToEdit[userId].RATING = message.length
				let inlineKeyboard = new InlineKeyboard()
				inlineKeyboard.text("Sì", "commentS")
				inlineKeyboard.text("No", "commentN")
				await ctx.reply(`@${username} Vuoi inserire un commento`, {
					reply_markup: {
						...inlineKeyboard,
						selective: true
					}
				})
			}
		}

		//handle comments insertion
		else if (usersStatus[userId]["setComment"]) {
			await dao.insertRating(usersPlaceToEdit[userId].ID, userId, usersPlaceToEdit[userId].RATING, message)
			changeStatus(userId, "start")
			await ctx.reply(`@${username} Hai votato correttamente il posto!`, {
				reply_markup: {remove_keyboard: true, selective: true}
			})
		}

		//handle visited filter
		else if (usersStatus[userId]["filterVisited"]){
			if(message === "Tutti i posti"){
				userListParams[userId] = {
					visited: null
				}
			}
			else if(message === "Posti visitati"){
				userListParams[userId] = {
					visited: true
				}
			}
			else if(message === "Posti non visitati"){
				userListParams[userId] = {
					visited: false
				}
			}
			changeStatus(userId, "filterType")
			let kb = new Keyboard()
			kb.add("Tutti i posti")
			kb.add("Posti da mangiare")
			kb.add("Posti da visitare")
			kb.resize_keyboard = true
			kb.selective = true
			await ctx.reply(`@${username} Scegli il tipo di posto`, {
				reply_markup: kb
			})
		}

		//handle type filter
		else if (usersStatus[userId]["filterType"]){
			if(message === "Tutti i posti"){
				userListParams[userId].type = null
			}
			else if(message === "Posti da mangiare"){
				userListParams[userId].type = "mangiare"
			}
			else if(message === "Posti da visitare"){
				userListParams[userId].type = "visitare"
			}
			let places = await dao.getPlaces(ctx.chat.id.toString(), userListParams[userId].type, userListParams[userId].visited)
			delete userListParams[userId]
			await ctx.reply(formattedList(places)+`\n\n\n@${username}`, {
				parse_mode: "HTML",
				link_preview_options: {
					is_disabled: true
				},
				reply_markup: {
					remove_keyboard: true,
					selective: true
				}
			});
			changeStatus(userId, "start")
		}

		//handle comments
		else if (usersStatus[userId]["comments"]){
			let places = await dao.getPlaces(ctx.chat.id.toString(), null, true)
			let placesNames = places.map((place) => place.NAME)
			if (places && places.length > 0) {
				if (placesNames.includes(message)) {
					let place = places.find((place) => place.NAME === message)
					let comments = await dao.getPlaceComments(place.ID)
					await ctx.reply(await formattedComments(place.NAME, comments, ctx), {
						parse_mode: "HTML", reply_markup: {
							remove_keyboard: true, selective: true
						}
					})
				}
			}
		}

	});

	bot.callbackQuery("skip", async (ctx) => {
		await ctx.reply("skip")
	})

	bot.callbackQuery("urlS", async (ctx) => {
		changeStatus(ctx.from.id, "selectUrl")
		await ctx.reply(`@${ctx.from.username} Inserisci l'URL del posto`, {
			reply_markup: {
				force_reply: true,
				selective: true
			}
		})
	})
	bot.callbackQuery("urlN", async (ctx) => {
		await insertPlace(usersNewPlace[ctx.from.id], ctx)
	})

	bot.callbackQuery("commentS", async (ctx) => {
		changeStatus(ctx.from.id, "setComment")
		await ctx.reply(`@${ctx.from.username} Inserisci il commento`, {
			reply_markup: {
				force_reply: true,
				selective: true
			}
		})
	})
	bot.callbackQuery("commentN", async (ctx) => {
		await dao.insertRating(usersPlaceToEdit[ctx.from.id].ID, ctx.from.id, usersPlaceToEdit[ctx.from.id].RATING, "")
		changeStatus(ctx.from.id, "start")
		await ctx.reply(`@${ctx.from.username} Hai votato correttamente il posto!`, {
			reply_markup: {remove_keyboard: true, selective: true}
		})
	})

	//Start the Bot
	bot.start();

	bot.catch((err) => {
		console.log("Ooops", err);
	})
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

function getYearsKeyboard(userId) {
	let yearKeyboard = new Keyboard()
	let year = userYear[userId].year
	let offset = 3*userYear[userId].page
	let offsetYear = year + offset
	yearKeyboard.row("⬅️", dayjs().year().toString(), "➡️")
	let year1 = (offsetYear - 2).toString()
	let year2 = (offsetYear - 1).toString()
	let year3 = (offsetYear).toString()
	yearKeyboard.row(year1, year2, year3)
	yearKeyboard.resize_keyboard = true
	yearKeyboard.selective = true
	return yearKeyboard
}

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
		selectUrl: false,
		setVisited: false,
		rate: false,
		applyRate: false,
		setComment: false,
		filterVisited: false,
		filterType: false,
		comments: false,
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
}

async function switchMonth(monthNum, ctx) {
	let id = ctx.from.id
	let username = ctx.from.username
	let monthName = getMonthName(monthNum)
	monthNumbers[id] = monthNum
	let calendar = getCalendarKeyboard(monthNum, userYear[id].year)
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

export function getCalendarKeyboard(monthNum, year) {
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
	calendar.row("Oggi")
	calendar.row("⬅️", monthName, year.toString(), "➡️")
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
		.then(async (_id) => {
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
