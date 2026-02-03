// src/index.js
const dotenv = require("dotenv");
// Load biến môi trường ngay lập tức
dotenv.config();

const express = require("express");
const http = require("http");
const morgan = require("morgan");
const methodOverride = require("method-override");
const cors = require("cors");

const route = require("./routes");
const db = require("./config/db");

const { initSocket } = require("./app/socket"); // ✅ đúng path theo cấu trúc bạn đưa

const app = express();
const server = http.createServer(app); // ✅ tạo server

// ✅ CORS chuẩn (dev/prod)
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Cho phép request không có origin (Postman, server-to-server)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Middleware parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(morgan("combined"));

// session
const sessionMiddleware = require("./config/session/session");
app.use(sessionMiddleware);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// mailer
const mailer = require("./config/mailer/mailer");
app.set("transporter", mailer);

// Passport
const passport = require("./config/passport/passport-config");
app.use(passport.initialize());
app.use(passport.session());

// ✅ init socket sau khi có session/passport nếu bạn muốn dùng sau này
initSocket(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

async function bootstrap() {
  // Kết nối DB
  try {
    await db.connect();
  } catch (error) {
    console.error("MongoDB connection failed. Server will not start.");
    process.exit(1);
  }

  // Khởi tạo routes
  route(app);

  // Port
  const PORT = process.env.PORT || 3000;

  // ✅ dùng server.listen thay vì app.listen
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Ứng dụng đang chạy trên cổng ${PORT}`);
  });
}

bootstrap();
