import mysql from "mysql2";

const db = mysql.createPool({
  host: "db",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 100, 
  queueLimit: 0, 
});

// Gestisci gli errori di connessione
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to the database...');
    db.connect();
  } else {
    throw err;
  }
});

db.connect((err) => {
  if (err) {
    console.error("Connection error:", err);
    return;
  }
  console.log("Connected to MySQL server");
  createTables();
});

// Function to run queries
async function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error in query:", query, "\n", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to iunitialize the database
async function createTables() {
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS PLACES ( 
        ID INT AUTO_INCREMENT PRIMARY KEY, 
        CHATID VARCHAR(255) NOT NULL, 
        USERID VARCHAR(255) NOT NULL, 
        TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        NAME VARCHAR(255) NOT NULL, 
        VISITED TIMESTAMP, 
        RATING FLOAT, 
        TYPE VARCHAR(255) NOT NULL, 
        URL TEXT NOT NULL,
        CONSTRAINT UNIQUE_PLACE UNIQUE (CHATID, NAME)
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS RATING (
        PLACEID INT NOT NULL,
        USERID VARCHAR(255) NOT NULL,
        RATING FLOAT NOT NULL,
        COMMENT TEXT,
        PRIMARY KEY (PLACEID, USERID),
        FOREIGN KEY (PLACEID) REFERENCES PLACES(ID)
      )
    `);

    console.log("Tables created successfully.");
  } catch (error) {
    console.error("Error during tables creation:", error);
  }
}

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

async function insertPlace(chatId, userId, name, type, url) {
  const query = ` INSERT INTO PLACES (CHATID, USERID, NAME, TYPE, URL) VALUES (?, ?, ?, ?, ?)`;

  try {
    const result = await runQuery(query, [chatId, userId, name, type, url]);
    return result.insertId;
  } catch (error) {
    console.error("Error in insertPlace:", error);
    throw error;
  }
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
async function insertRating(placeId, userId, rating, comment) {
  const insertQuery = `
    INSERT INTO RATING (PLACEID, USERID, RATING, COMMENT)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE RATING = VALUES(RATING), COMMENT = VALUES(COMMENT)
  `;

  const updatePlacesQuery = `
    UPDATE PLACES
    SET RATING = (
      SELECT AVG(RATING) 
      FROM RATING 
      WHERE PLACEID = ?
    )
    WHERE ID = ?
  `;

  try {
    await runQuery(insertQuery, [placeId, userId, rating, comment]);
    await runQuery(updatePlacesQuery, [placeId, placeId]);
    console.log("Rating inserted and average updated successfully.");
  } catch (error) {
    console.error("Error in insertRating:", error);
    throw error;
  }
}

/**
 * Retrieves comments associated with a specific place.
 *
 * @param {number} placeId - The ID of the place for which comments are to be retrieved.
 * @returns {Promise<Array>} A promise that resolves to an array of objects representing the comments.
 * @throws {Error} Thrown if there are errors during the database query.
 *
 */
async function getPlaceComments(placeId) {
  const query = "SELECT * FROM RATING WHERE PLACEID = ?";
  try {
    const rows = await runQuery(query, [placeId]);
    return rows;
  } catch (error) {
    console.error("Error in getPlaceComments:", error);
    throw error;
  }
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
async function getPlaces(chatId, type = null, visited = null) {
  let query = "SELECT * FROM PLACES WHERE CHATID = ?";
  const params = [chatId];

  if (type !== null) {
    query += " AND TYPE = ?";
    params.push(type);
  }

  if (visited !== null) {
    if (visited) {
      query += " AND VISITED IS NOT NULL";
    } else {
      query += " AND VISITED IS NULL";
    }
  }

  try {
    const rows = await runQuery(query, params);
    return rows;
  } catch (error) {
    console.error("Error in getPlaces:", error);
    throw error;
  }
}

/**
 * Retrieves information about a specific place based on its ID.
 *
 * @param {number} placeId - The ID of the place for which information is to be retrieved.
 * @returns {Promise<Object | null>} A promise that resolves with the information of the retrieved place or null if not found.
 * @throws {Error} Thrown if there are errors during the database query.
 */

async function getPlaceInfo(placeId) {
  const query = "SELECT * FROM PLACES WHERE ID = ?";

  try {
    const row = await runQuery(query, [placeId]);
    return row[0];
  } catch (error) {
    console.error("Error in getPlaceInfo:", error);
    throw error;
  }
}

/**
 * Marks a specific place as visited in the database.
 *
 * @param {number} placeId - The ID of the place to be marked as visited.
 * @param {string | null} timestamp - The optional timestamp indicating the visit time. If null, the current timestamp is used.
 * @returns {Promise<void>} A promise that resolves when the place is successfully marked as visited.
 * @throws {Error} Thrown if there are errors during the database operations.
 */

async function setPlaceVisited(placeId, timestamp = null) {
  let query;
  let params;
  
  if (timestamp !== null) {
    query = "UPDATE PLACES SET VISITED = ? WHERE ID = ?";
    params = [timestamp, placeId];
  } else {
    query = "UPDATE PLACES SET VISITED = CURRENT_TIMESTAMP WHERE ID = ?";
    params = [placeId];
  }

  try {
    await runQuery(query, params);
    console.log("Place marked as visited.");
  } catch (error) {
    console.error("Errore in setPlaceVisited:", error);
    throw error;
  }
}

/**
 *
 * @param {number} placeId - The ID of the place to be deleted.
 * @returns {Promise<void>} - A promise that resolves when the place is successfully deleted.
 * @throws {Error} Thrown if there are errors during the database operations.
 */

async function deletePlace(placeId) {
  const deletePlacesQuery = "DELETE FROM PLACES WHERE ID = ?";
  const deleteRatingQuery = "DELETE FROM RATING WHERE PLACEID = ?";

  try {
    await runQuery(deletePlacesQuery, [placeId]);
    await runQuery(deleteRatingQuery, [placeId]);

    console.log("Place deleted successfully.");
  } catch (error) {
    console.error("Error in deletePlace:", error);
    throw error;
  }
}

const dao = {
  insertPlace,
  insertRating,
  getPlaces,
  getPlaceInfo,
  getPlaceComments,
  setPlaceVisited,
  deletePlace,
};
export default dao;
