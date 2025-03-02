import mongoose from "mongoose";

const MONGODB_USER = process.env.MONGODB_USER;

if (!MONGODB_USER) {
  throw new Error("MONGODB_USER is not defined in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_USER, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "tqrs",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
