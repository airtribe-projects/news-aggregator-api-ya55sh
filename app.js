const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");

const route = require("./route/user.route");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", route);

mongoose
  .connect("mongodb+srv://new-yash:1234@cluster0.at7nxjx.mongodb.net/airtribe")
  .then(() => {
    console.log("connected to mongodb");

    app.listen(port, (err) => {
      if (err) {
        return console.log("Something bad happened", err);
      }
      console.log(`Server is listening on ${port}`);
    });
  })
  .catch((e) => {
    console.log("error while connecting to mongodb ", e);
  });

module.exports = app;
