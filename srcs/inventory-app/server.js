const express = require("express");
const cors = require("cors");
const db = require("./app/models");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.sequelize.sync().then(() => {
  console.log("Database synced.");
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Inventory API." });
});

require("./app/routes/movie.routes")(app);

const PORT = process.env.INVENTORY_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});