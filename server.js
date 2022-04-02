var express = require("express");
var app = express();
const jsonServer = require("json-server");

const router = jsonServer.router("./db.json");

app.use(express.static("public"));
app.use(router);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});

module.exports = app;
