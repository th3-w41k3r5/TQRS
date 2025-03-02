import { MongoClient } from "mongodb";

const MONGODB_USER = process.env.MONGODB_USER;

if (!MONGODB_USER) {
  throw new Error("MONGODB_USER is not defined in environment variables");
}

let client;
let clientPromise;

if (global._mongoClientPromise) {
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_USER, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  global._mongoClientPromise = client.connect();
  clientPromise = global._mongoClientPromise;
}

export default clientPromise;
