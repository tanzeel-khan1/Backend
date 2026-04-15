// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDB Connected`);
//   } catch (error) {
//     console.error(error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connections[0].readyState;
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("DB Connection Error:", err.message);
    throw err;
  }
};

module.exports = connectDB;