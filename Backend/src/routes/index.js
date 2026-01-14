const authRouter = require("./auth");
const meRouter = require("./me");
const planRouter = require("./plan");
const runProcessRouter = require("./runProcess");
const aiChatRouter = require("./aiChat");

function route(app) {
  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/plans", planRouter);
  app.use("/api/run-processes", runProcessRouter);
  app.use("/api/ai-chat", aiChatRouter);
}

module.exports = route;
