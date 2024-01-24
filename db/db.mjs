import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./db.sqlite");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS PLACES ( ID INTEGER PRIMARY KEY AUTOINCREMENT, CHATID INTEGER NOT NULL, USERID TEXT NOT NULL, TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP, VISITED TIMESTAMP, RATING FLOAT NOT NULL DEFAULT 0, TYPE VARCHAR NOT NULL, URL TEXT NOT NULL)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS RATING ( PLACEID INTEGER NOT NULL,USERID TEXT NOT NULL,RATING FLOAT NOT NULL,COMMENT TEXT, FOREIGN KEY(PLACEID) REFERENCES PLACES(ID)), PRIMARY KEY(PLACEID, USERID))"
  );
});

function insertPlace(chatId, userId, type, url) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO PLACES (CHATID, USERID, TYPE, URL) VALUES (?, ?, ?, ?)",
      [chatId, userId, type, url],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

function insertRating(placeId, userId, rating, comment) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let [count, sum] = db.get(
        "SELECT COUNT(*), SUM(RATING) FROM RATING WHERE PLACEID = ?",
        [placeId]
      );
      let avg = sum / count;
      db.run("UPDATE PLACES SET RATING = ? WHERE ID = ?", [avg, placeId]);
      db.run(
        "INSERT INTO RATING (PLACEID, USERID, RATING, COMMENT) VALUES (?, ?, ?, ?)",
        [placeId, userId, rating, comment],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });
}

function getAllPlaces(chatId, type = null) {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM PLACES WHERE CHATID = ?";
    let params = [chatId];

    if (type !== null) {
      query += " AND TYPE=?";
      params.push(type);
    }

    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function getPlacesToSee(chatId, type = null) {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM PLACES WHERE CHATID = ? AND VISITED IS NULL";
    let params = [chatId];

    if (type !== null) {
      query += " AND TYPE=?";
      params.push(type);
    }

    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function getSeenPlaces(chatId, type = null) {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM PLACES WHERE CHATID = ? AND VISITED IS NOT NULL";
    let params = [chatId];

    if (type !== null) {
      query += " AND TYPE=?";
      params.push(type);
    }

    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}


export default function () {
  return {
    insertPlace,
    insertRating,
    getAllPlaces,
    getPlacesToSee,
    getSeenPlaces,
  };
}