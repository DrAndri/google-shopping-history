import type { NextApiRequest, NextApiResponse } from 'next';
import { AutocompleteResponse, Env, MongodbProductInfo } from '../../../types';
import { MongoClient } from 'mongodb';

const env: Env = {
  MONGODB_URI: process.env.MONGODB_URI || '',
};
const MONGODB_URI = env.MONGODB_URI;
//TODO: better way to init client?
const mongoClient = new MongoClient(MONGODB_URI);
mongoClient.connect();
const storeName = 'Origo';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AutocompleteResponse>,
) {
  let terms: string[] = [];
  const term = req.query.term as string;

  return new Promise<void>(async (resolve, reject) => {
    const priceChanges = mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductInfo>('productInfo')
      .find({ sku: { $regex: /^Z/ }, store: storeName });
    for await (const doc of priceChanges) {
      terms.push(doc.sku);
    }
    res.status(200).json({ terms: terms });
    resolve();
  });
}
