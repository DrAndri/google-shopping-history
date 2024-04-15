import { Db, MongoClient } from 'mongodb';

export default function getMongoDb(): Db {
  const MONGODB_URI = process.env.MONGODB_URI ?? undefined;
  if (MONGODB_URI === undefined) throw new Error('MONGODB_URI not set');
  const mongoClient = new MongoClient(MONGODB_URI);
  mongoClient
    .connect()
    .catch((error) => console.log('Error connecting to mongodb', error));
  return mongoClient.db('google-shopping-scraper');
}
