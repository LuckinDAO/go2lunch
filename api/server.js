var express = require("express");
var app = express();
const jsonServer = require("json-server");

const router = jsonServer.router(
  process.env.DB
    ? process.env.DB
    : {
        selected: [],
        comments: [],
      }
);

app.use(express.static("public"));
app.use(router);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});

module.exports = app;
