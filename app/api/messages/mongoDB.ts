import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error(
    'Please add your MongoDB URI to the environment variables as MONGODB_URI'
  );
}

const options: MongoClientOptions = {};
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === 'development') {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
