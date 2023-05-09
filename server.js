const app = require("./app");

let port = process.env.PORT;

if (port == "" || port == null) {
  port = 5555;
}

app.listen(port);
