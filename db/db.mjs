import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./db.sqlite");
db.run(`
  CREATE TABLE IF NOT EXISTS PLACES ( 
    ID INTEGER PRIMARY KEY AUTOINCREMENT, 
    CHATID INTEGER NOT NULL, USERID TEXT NOT NULL, 
    TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    NAME VARCHAR NOT NULL, VISITED TIMESTAMP, 
    RATING FLOAT NOT NULL DEFAULT 0, 
    TYPE VARCHAR NOT NULL, URL 
    TEXT NOT NULL
    )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS RATING (
    PLACEID INTEGER NOT NULL,
    USERID TEXT NOT NULL,
    RATING FLOAT NOT NULL,
    COMMENT TEXT,
    PRIMARY KEY (PLACEID, USERID),
    FOREIGN KEY (PLACEID) REFERENCES PLACES(ID)
  )
`);

function insertPlace(chatId, userId, name, type, url) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO PLACES (CHATID, USERID, NAME, TYPE, URL) VALUES (?, ?, ?, ?, ?)",
      [chatId, userId, name, type, url],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function insertRating(placeId, userId, rating, comment) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) as count, SUM(RATING) as sum FROM RATING WHERE PLACEID = ?",
      [placeId],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const count = result.count || 0;
        const sum = result.sum || 0;

        const avg = (sum + rating) / (count + 1);

        db.run("UPDATE PLACES SET RATING = ? WHERE ID = ?", [avg, placeId]);

        db.run(
          "INSERT INTO RATING (PLACEID, USERID, RATING, COMMENT) VALUES (?, ?, ?, ?)",
          [placeId, userId, rating, comment],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      }
    );
  });
}

function getPlaceComments(placeId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM RATING WHERE PLACEID = ?", [placeId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Function to get all places stored in a chat
// If type is specified, only places of that type are returned
// If visited is specified, only places with that visited status are returned
function getPlaces(chatId, type = null, visited = null) {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM PLACES WHERE CHATID = ?";
    let params = [chatId];

    if (type !== null) {
      query += " AND TYPE=?";
      params.push(type);
    }

    if (visited !== null) {
      if (visited) query += " AND VISITED IS NOT NULL";
      else query += " AND VISITED IS NULL";
    }

    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getPlaceInfo(placeId) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM PLACES WHERE ID = ?", [placeId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Function to set the visited status of a place to the current timestamp (or a custom one)
function setPlaceVisited(placeId, timestamp = null) {
  return new Promise((resolve, reject) => {
    let query;
    let params;

    if (timestamp !== null) {
      query = "UPDATE PLACES SET VISITED = ? WHERE ID = ?";
      params = [timestamp, placeId];
    } else {
      query = "UPDATE PLACES SET VISITED = CURRENT_TIMESTAMP WHERE ID = ?";
      params = [placeId];
    }

    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


export default function () {
  return {
    insertPlace,
    insertRating,
    getPlaces,
    getPlaceInfo,
    getPlaceComments,
    setPlaceVisited,
  };
}
