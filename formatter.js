function formatVisitedPlace(place) {
    let res = "- "
    if(place.URL) res += `<a href="${place.URL}">${place.NAME} ✅</a>\n`
    else res += `${place.NAME} ✅\n`
    if(place.RATING) res += `   ⭐️ <i>${place.RATING}</i>\n`
    if(place.VISITED) res += `   🗓 <i>${place.VISITED.split(" ")[0]}</i>\n`
    res += `\n`
    return res
}

function formatPlaceToVisit(place) {
    let res = "- "
    if(place.URL) res += `<a href="${place.URL}">${place.NAME} ❌</a>\n`
    else res += `${place.NAME} ❌\n`
    res += `   <i>Da provare!</i>`
    res += `\n`
    return res
}

export function formattedList(places){
    let res = ""
    if(!places || places.length === 0) return `Non ci sono posti da visitare 😢\n\nAggiungi un nuovo posto con /insert`
    const toEat = places.filter(place => place.TYPE === "mangiare")
    const toVisit = places.filter(place => place.TYPE === "visitare")
    if(toEat.length > 0){
        res += "<b>🍴 Dove mangiare</b>\n\n"
        toEat.forEach(place => res += formatVisitedPlace(place))
    }
    res+= "\n"
    if(toVisit.length > 0){
        res += "<b>👀 Cose da vedere</b>\n\n"
        toVisit.forEach(place => res += formatPlaceToVisit(place))
    }
    return res
}


