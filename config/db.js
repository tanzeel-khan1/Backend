const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const globalCache = global.__mongooseCache || {
  conn: null,
  promise: null,
};

global.__mongooseCache = globalCache;

const connectDB = async () => {
  if (globalCache.conn && mongoose.connection.readyState === 1) {
    return globalCache.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 20000,
        maxPoolSize: 10,
      })
      .then((conn) => {
        console.log("MongoDB Connected");
        return conn;
      })
      .catch((error) => {
        globalCache.promise = null;
        console.log("DB Connection Error:", error.message);
        throw error;
      });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
};

module.exports = connectDB;
