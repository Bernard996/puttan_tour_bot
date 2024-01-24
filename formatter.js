function formatVisitedPlace(place) {
    let res = "<li>"
    if(place.URL) res += `<a href="${place.URL}">${place.NAME} ✅</a>`
    else res += `${place.NAME} ✅`
    if(place.RATING) res += `<span>   ⭐️ ${place.rating}</span>`
    if(place.VISITED) res += `<span>   🗓 ${place.VISITED}</span>`
    res += `</li>`
    return res
}

function formatPlaceToVisit(place) {
    let res = "<li>"
    if(place.URL) res += `<a href="${place.URL}">${place.NAME} ❌</a>`
    else res += `${place.NAME} ❌`
    res += `<span>   <i>Da provare!</i></span>`
    res += `</li>`
    return res
}

function formattedList(places){
    let res = ""
    const toEat = places.filter(place => place.TYPE === "mangiare")
    const toVisit = places.filter(place => place.TYPE === "visitare")
    if(toEat.length > 0){
        res += "<h2>🍴 Dove mangiare</h2><br/>"
        res += "<ul>"
        toEat.forEach(place => res += formatVisitedPlace(place))
        res += "</ul>"
    }
    res+= "<br/><br/>"
    if(toVisit.length > 0){
        res += "<h2>👀 Cose da vedere</h2><br/>"
        res += "<ul>"
        toVisit.forEach(place => res += formatPlaceToVisit(place))
        res += "</ul>"
    }
    return res
}


const formatter = {formattedList}
export default formatter