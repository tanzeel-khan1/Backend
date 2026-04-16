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

// ✅ CORS CONFIG (IMPORTANT)
const allowedOrigins = [
  "http://localhost:3000",
  "https://campaign-dashboard-mauve.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps / Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// OPTIONAL: handle preflight
app.options("*", cors());

app.use(express.json());

// Routes
app.use("/api/campaigns", require("./routes/campaignRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 5000;

// Local server
if (process.env.NODE_ENV !== "production") {
  const connectDB = require("./config/db");

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// Vercel export
module.exports = app;