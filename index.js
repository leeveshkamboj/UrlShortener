// Importing Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const secure = require("ssl-express-www");

const config = require("./config");

// Setting up Express Sever
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(express.json());
app.use(secure);
app.use("/favicon.ico", express.static("public/favicon.ico"));
app.set("view engine", "ejs");

//Routes
app.use("/api", require("./routes/api"));
app.use("/", require("./routes/index"));

// Connecting to Database and starting the server
if (config.dbUrl) {
  mongoose
    .connect(config.dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connected.");
      server = app.listen(config.port, () => {
        console.log(`Listening at port ${config.port}.`);
      });
    })
    .catch((err) => {
      console.log(`Error while connecting to database\n${err}`);
    });
} else {
  console.log("Empty Database URL.");
}
