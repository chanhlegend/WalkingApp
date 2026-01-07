const authRouter = require("./auth");
const meRouter = require("./me");

function route(app) {
  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
}

module.exports = route;
