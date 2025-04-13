import type { NextApiResponse } from 'next';
import {
  AutocompleteApiRequest,
  AutocompleteResponse,
  MongodbProductMetadata
} from '../../types';
import getMongoDb from '../../utils/mongodb';

export default function handler(
  req: AutocompleteApiRequest,
  res: NextApiResponse<AutocompleteResponse>
) {
  const mongoDb = getMongoDb();

  const getTerms = async () => {
    const filter = {
      sku: { $regex: new RegExp(`^${req.body.term}`) },
      store_id: { $in: req.body.stores }
    };
    const distinctSkus = await mongoDb
      .collection<MongodbProductMetadata>('productMetadata')
      .distinct('sku', filter, {
        collation: { locale: 'is', numericOrdering: true }
      });
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
      .catch((error) => {
        console.log(error);
        reject(new Error('Error occured when getting terms'));
      });
  });
}
