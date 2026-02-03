const authRouter = require("./auth");
const meRouter = require("./me");
const planRouter = require("./plan");
const runProcessRouter = require("./runProcess");
const aiChatRouter = require("./aiChat");
const payosRouter = require('./payos');
const packageRouter = require('./package');
const notificationRouter = require('./notification');

function route(app) {
  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/plans", planRouter);
  app.use("/api/run-processes", runProcessRouter);
  app.use("/api/ai-chat", aiChatRouter);
  app.use('/api/payos', payosRouter);
  app.use('/api/packages', packageRouter);
  app.use('/api/notifications', notificationRouter);
}

module.exports = route;
