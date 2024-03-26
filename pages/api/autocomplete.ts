import type { NextApiRequest, NextApiResponse } from 'next';
import { AutocompleteResponse, MongodbProductMetadata } from '../../types';
import getMongoClient from '../../utils/mongodb';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AutocompleteResponse>,
) {
  const mongoClient = getMongoClient();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  const body = JSON.parse(req.body);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const term: string = body?.term;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const stores: string[] = body?.stores;

  const getTerms = async () => {
    const terms: string[] = [];
    console.log(term);
    console.log(stores);
    const productMetadata = mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductMetadata>('productMetadata')
      .find(
        { sku: { $regex: new RegExp(`^${term}`) }, store: { $in: stores } },
        {
          projection: {
            _id: 0,
            sku: 1,
          },
        },
      );
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
