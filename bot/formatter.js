import dayjs from 'dayjs'
function formatVisitedPlace(place) {
	
	let res = "- "
	if (place.URL) res += `<a href="${place.URL}">${place.NAME} ✅</a>\n`
	else res += `${place.NAME} ✅\n`
	if (place.RATING) res += `   ⭐️ <i>${place.RATING.toFixed(1)}</i>\n`
	if (place.VISITED) res += `   🗓 <i>${dayjs(timestamp).format('DD/MM/YYYY')}</i>\n`
	res += `\n`
	return res
}

function formatPlaceToVisit(place) {
	let res = "- "
	if (place.URL) res += `<a href="${place.URL}">${place.NAME} ❌</a>\n`
	else res += `${place.NAME} ❌\n`
	res += `   <i>Da provare!</i>\n`
	res += `\n`
	return res
}

export function formattedList(places) {
	let res = ""
	if (!places || places.length === 0) return `Non ci sono posti da visitare 😢\n\nAggiungi un nuovo posto con /insert`
	const toEat = places.filter(place => place.TYPE === "mangiare")
	const toVisit = places.filter(place => place.TYPE === "visitare")
	if (toEat.length > 0) {
		res += "<b>🍴 Dove mangiare</b>\n\n"
		toEat.forEach(place => res += place.VISITED != null ? formatVisitedPlace(place) : formatPlaceToVisit(place))
	}
	res += "\n"
	if (toVisit.length > 0) {
		res += "<b>👀 Cose da vedere</b>\n\n"
		toVisit.forEach(place => res += place.VISITED != null ? formatVisitedPlace(place) : formatPlaceToVisit(place))
	}
	return res
}

export async function formattedComments(name, comments, ctx){
	if (!comments || comments.length === 0) return `Non ci sono commenti 😢\n\nAggiungi un nuovo commento con /rate`
	let promises = await comments.map(async (c) => {
		let res = ""
		let user = await ctx.api.getChatMember(ctx.chat.id, c.USERID)
		let username = user.user.username
		res += `<b>@${username} - </b>`
		for(let i = 0; i < c.RATING; i++) res += `⭐️`
		res += `\n<i>"${c.COMMENT}"</i>\n\n`
		return res
	})
	return Promise.all(promises).then((values) => {
		values.unshift(`<b>${name}</b>\n\n`)
		return values.join("")
	})
}


