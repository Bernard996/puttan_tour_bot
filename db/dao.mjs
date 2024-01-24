import sqlite3 from "sqlite3";
const db = new sqlite3.Database("db/db.sqlite");
db.run(`
  CREATE TABLE IF NOT EXISTS PLACES ( 
    ID INTEGER PRIMARY KEY AUTOINCREMENT, 
    CHATID VARCHAR NOT NULL, 
    USERID VARCHAR NOT NULL, 
    TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    NAME VARCHAR NOT NULL, 
    VISITED TIMESTAMP, 
    RATING FLOAT, 
    TYPE VARCHAR NOT NULL, 
    URL TEXT NOT NULL
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


/**
 * Inserts a new place into the database.
 *
 * @param {number} chatId - The ID of the chat associated with the place.
 * @param {string} userId - The ID of the user adding the place.
 * @param {string} name - The name of the place.
 * @param {string} type - The type or category of the place.
 * @param {string} url - The URL associated with the place.
 * @returns {Promise<number>} A promise that resolves with the ID of the last inserted place.
 * @throws {Error} Thrown if there are errors during the database operations.
 */

function insertPlace(chatId, userId, name, type, url) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO PLACES (CHATID, USERID, NAME, TYPE, URL) VALUES (?, ?, ?, ?, ?)",
      [chatId, userId, name, type, url],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}


/**
 * Inserts a new rating and updates the average rating for a specific place.
 *
 * @param {number} placeId - The ID of the place for which the rating is being inserted.
 * @param {string} userId - The ID of the user providing the rating.
 * @param {float} rating - The numerical rating value.
 * @param {string} comment - The optional comment associated with the rating.
 * @returns {Promise<void>} A promise that resolves when the rating is successfully inserted.
 * @throws {Error} Thrown if there are errors during the database operations.
 */

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

/**
 * Retrieves comments associated with a specific place.
 *
 * @param {number} placeId - The ID of the place for which comments are to be retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array of objects representing the comments.
 * @throws {Error} Thrown if there are errors during the database query.
 *
 */
function getPlaceComments(placeId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM RATING WHERE PLACEID = ?", [placeId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Retrieves places based on specified criteria.
 *
 * @param {string} chatId - The ID of the chat associated with the places.
 * @param {string | null} type - The optional type or category of the places.
 * @param {boolean | null} visited - The optional flag to filter places based on whether they have been visited.
 * @returns {Promise<Object | null>} A promise that resolves with the information of the retrieved place or null if not found.
 * @throws {Error} Thrown if there are errors during the database query.
 */
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

    db.all(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Retrieves information about a specific place based on its ID.
 *
 * @param {number} placeId - The ID of the place for which information is to be retrieved.
 * @returns {Promise<Object | null>} A promise that resolves with the information of the retrieved place or null if not found.
 * @throws {Error} Thrown if there are errors during the database query.
 */

function getPlaceInfo(placeId) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM PLACES WHERE ID = ?", [placeId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Marks a specific place as visited in the database.
 *
 * @param {number} placeId - The ID of the place to be marked as visited.
 * @param {string | null} timestamp - The optional timestamp indicating the visit time. If null, the current timestamp is used.
 * @returns {Promise<void>} A promise that resolves when the place is successfully marked as visited.
 * @throws {Error} Thrown if there are errors during the database operations.
 */

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

const dao = {
  insertPlace,
  insertRating,
  getPlaces,
  getPlaceInfo,
  getPlaceComments,
  setPlaceVisited,
};
export default dao;
