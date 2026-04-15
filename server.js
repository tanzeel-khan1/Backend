// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");

// dotenv.config();
// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/campaigns", require("./routes/campaignRoutes"));
// app.use("/api/auth", require("./routes/authRoutes"));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
// app.use("/api/campaigns", require("./routes/campaignRoutes"));
// app.use("/api/auth", require("./routes/authRoutes"));
app.use("/campaigns", require("./routes/campaignRoutes"));
app.use("/auth", require("./routes/authRoutes"));
// Test route (optional but helpful)
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 5000;

// 👇 Local server only
if (process.env.NODE_ENV !== "production") {
  const connectDB = require("./config/db");

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// 👇 IMPORTANT (Vercel ke liye)
module.exports = app;