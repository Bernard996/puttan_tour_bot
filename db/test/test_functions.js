import dao from "./dao_test.mjs";

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error(
    "È necessario fornire almeno un argomento per specificare la funzione da eseguire."
  );
  process.exit(1);
}

const functionName = args[0];
console.log("Funzione:", functionName);
const idTest = args[1];
console.log("ID test:", idTest);
const today = new Date();
let yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
yesterday = yesterday.toISOString();

switch (functionName) {
  case "insertPlace":
    dao
      .insertPlace(1, "testuserid", "testname", "testtype", "testurl")
      .then((res) =>
        console.log("Funzione insertPlace eseguita con successo. idTest:", res)
      )
      .catch((error) =>
        console.error("Errore durante l'esecuzione di insertPlace:", error)
      );
    break;

  case "insertRating":
    dao
      .insertRating(idTest, "test", 0, "testcomment")
      .then(() => console.log("Funzione insertRating eseguita con successo."))
      .catch((error) =>
        console.error("Errore durante l'esecuzione di insertRating:", error)
      );
    break;

  case "getPlaceComments":
    dao
      .getPlaceComments(idTest)
      .then((res) => {
        console.log("Funzione getPlaceComments eseguita con successo.");
        res.map((comment) => console.log(comment));
      })
      .catch((error) =>
        console.error("Errore durante l'esecuzione di getPlaceComments:", error)
      );
    break;

  case "getAllPlaces":
    dao
      .getPlaces(1)
      .then((res) => {
        console.log("Funzione getPlaces eseguita con successo.")
        res.map((place) => console.log(place));
      })
      .catch((error) =>
        console.error("Errore durante l'esecuzione di getPlaces:", error)
      );
    break;

  case "getSeenPlaces":
    dao
      .getPlaces(1, null, true)
      .then((res) => {
        console.log("Funzione getPlaces eseguita con successo.")
        res.map((place) => console.log(place));
      })      
      .catch((error) =>
        console.error("Errore durante l'esecuzione di getPlaces:", error)
      );
    break;

  case "getPlacesToSee":
    dao
      .getPlaces(1, null, false)
      .then((res) => {
        console.log("Funzione getPlaces eseguita con successo.")
        res.map((place) => console.log(place));
      })      
      .catch((error) =>
        console.error("Errore durante l'esecuzione di getPlaces:", error)
      );
    break;

  case "getPlacesOfType":
    dao
      .getPlaces(1, "testtype")
      .then((res) => {
        console.log("Funzione getPlaces eseguita con successo.")
        res.map((place) => console.log(place));
      })      
      .catch((error) =>
        console.error("Errore durante l'esecuzione di getPlaces:", error)
      );
    break;

  case "getPlaceInfo":
    dao
      .getPlaceInfo(idTest)
      .then((res) => {
        console.log("Funzione getPlaces eseguita con successo.")
        console.log(res);
      })
      .catch((error) =>
        console.error("Errore durante l'esecuzione di getPlaceInfo:", error)
      );
    break;

  case "setPlaceVisitedNow":
    dao
      .setPlaceVisited(idTest)
      .then(() =>
        console.log("Funzione setPlaceVisited eseguita con successo.")
      )
      .catch((error) =>
        console.error("Errore durante l'esecuzione di setPlaceVisited:", error)
      );
    break;

  case "setPlaceVisitedYesterday":
    dao
      .setPlaceVisited(idTest, yesterday)
      .then(() =>
        console.log("Funzione setPlaceVisited eseguita con successo.")
      )
      .catch((error) =>
        console.error("Errore durante l'esecuzione di setPlaceVisited:", error)
      );
    break;

  default:
    console.error("Funzione non riconosciuta.");
    process.exit(1);
}
