import type { NextApiRequest, NextApiResponse } from 'next';
import { AutocompleteResponse, MongodbProductMetadata } from '../../../types';
import getMongoClient from '../../../utils/mongodb';

const storeName = 'Origo';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AutocompleteResponse>,
) {
  const mongoClient = getMongoClient();
  const term = req.query.term as string;

  const getTerms = async () => {
    const terms: string[] = [];
    const productMetadata = mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductMetadata>('productMetadata')
      .find({ sku: { $regex: new RegExp(`^${term}`) }, store: storeName });
    for await (const doc of productMetadata) {
      terms.push(doc.sku);
    }
    return terms;
  };

  return new Promise<void>((resolve, reject) => {
    getTerms()
      .then((terms) => {
        res.status(200).json({ terms: terms });
        resolve();
      })
      .catch((error) => reject(error));
  });
}
