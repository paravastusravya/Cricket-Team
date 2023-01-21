const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Running");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//Get Players

app.get("/players", async (request, response) => {
  const getPlayers = `
    SELECT * FROM cricket_team
    ORDER BY player_id;
    `;
  const playersArray = await db.all(getPlayers);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//Adding new player (POST)
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `
       INSERT INTO cricket_team(player_name, jersey_number, role)
       VALUES
       ('${playerName}', '${jerseyNumber}', '${role}');
  `;
  const player = await db.run(addPlayer);
  const playerId = player.lastID;
  response.send("Player Added to Team");
});

//Getting a specific player(GET)
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
        SELECT * FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayer);
  response.send(convertDbObjectToResponseObject(player));
});

// update particular data (PUT)

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayer = `
        UPDATE 
        cricket_team
        SET 
        player_name = '${playerName}',
        jersey_number = '${jerseyNumber}',
        role = '${role}'
        WHERE player_id = ${playerId};
    `;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

// Delete player (DELETE)

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
