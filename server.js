// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/campaigns", require("./routes/campaignRoutes"));
// app.use("/api/auth", require("./routes/authRoutes"));

// // Test route (optional but helpful)
// app.get("/", (req, res) => {
//   res.send("API is running 🚀");
// });

// const PORT = process.env.PORT || 5000;

// // 👇 Local server only
// if (process.env.NODE_ENV !== "production") {
//   const connectDB = require("./config/db");

//   connectDB().then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   });
// }

// // 👇 IMPORTANT (Vercel ke liye)
// module.exports = app;
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://campaign-dashboard-mauve.vercel.app"
];

// ✅ CORS Middleware (SAFE)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / mobile apps

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// ✅ FIXED: Manual preflight handler (NO "*" crash)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://campaign-dashboard-mauve.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Body parser
app.use(express.json());

// ✅ Routes
app.use("/api/campaigns", require("./routes/campaignRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 5000;

// ✅ Local server only
if (process.env.NODE_ENV !== "production") {
  const connectDB = require("./config/db");

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// ✅ Export for Vercel
module.exports = app;