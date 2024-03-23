import { MongoClient } from 'mongodb';

export default function getMongoClient(): MongoClient {
  const MONGODB_URI = process.env.MONGODB_URI ?? undefined;
  if (MONGODB_URI === undefined) throw new Error('MONGODB_URI not set');
  const mongoClient = new MongoClient(MONGODB_URI);
  mongoClient
    .connect()
    .catch((error) => console.log('Error connecting to mongodb', error));
  return mongoClient;
}
