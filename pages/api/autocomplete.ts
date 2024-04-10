import type { NextApiResponse } from 'next';
import {
  AutocompleteApiRequest,
  AutocompleteResponse,
  MongodbProductMetadata
} from '../../types';
import getMongoClient from '../../utils/mongodb';

export default function handler(
  req: AutocompleteApiRequest,
  res: NextApiResponse<AutocompleteResponse>
) {
  const mongoClient = getMongoClient();

  const getTerms = async () => {
    const distinctSkus = await mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductMetadata>('productMetadata')
      .distinct(
        'sku',
        {
          sku: { $regex: new RegExp(`^${req.body.term}`) },
          store: { $in: req.body.stores }
        },
        {
          collation: { locale: 'is', numericOrdering: true }
        }
      );
    if (distinctSkus.length > 20) distinctSkus.splice(20);
    return distinctSkus;
  };

  return new Promise<void>((resolve, reject) => {
    if (req.body.term.length === 0) {
      res.status(200).json({ terms: [] });
      resolve();
    }
    getTerms()
      .then((terms) => {
        res.status(200).json({ terms: terms });
        resolve();
      })
      .catch((error) => reject(error));
  });
}
