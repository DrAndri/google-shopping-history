import type { NextApiRequest, NextApiResponse } from 'next';
import {
  PricesResponse,
  Price,
  MongodbProductPrice,
  MongodbProductMetadata,
  PriceArray,
} from '../../types';
import getMongoClient from '../../utils/mongodb';

const storeName = 'Origo';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PricesResponse>,
) {
  const mongoClient = getMongoClient();
  const lastPrices: PriceArray = {};
  const lastSalePrices: PriceArray = {};

  const getPriceChanges = async (skus: string[]) => {
    const prices: Price[] = [];
    const salePrices: Price[] = [];
    const priceChanges = mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductPrice>('priceChanges')
      .find({ sku: { $in: skus }, store: storeName })
      .sort({ timestamp: 1 });
    for await (const doc of priceChanges) {
      const entry = {
        sku: doc.sku,
        timestamp: doc.timestamp,
        price: doc.price,
      };
      if (doc.sale_price) {
        salePrices.push(entry);
        lastSalePrices[entry.sku] = { ...entry };
      } else {
        prices.push(entry);
        lastPrices[entry.sku] = { ...entry };
      }
    }
    const result: PricesResponse = { prices, salePrices };
    return result;
  };

  const addLatestPoint = async (skus: string[], result: PricesResponse) => {
    const { prices } = result;
    const productMetadata = mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductMetadata>('productMetadata')
      .find(
        { sku: { $in: skus }, store: storeName },
        {
          projection: {
            sku: 1,
            timestamp: 1,
            lastSeen: 1,
            salePriceLastSeen: 1,
          },
        },
      );
    for await (const doc of productMetadata) {
      if (doc.lastSeen !== lastPrices[doc.sku].timestamp) {
        prices.push({
          sku: doc.sku,
          timestamp: doc.lastSeen,
          price: lastPrices[doc.sku].price,
        });
      }
      if (
        doc.salePriceLastSeen &&
        doc.salePriceLastSeen !== lastSalePrices[doc.sku].timestamp
      ) {
        prices.push({
          sku: doc.sku,
          timestamp: doc.salePriceLastSeen,
          price: lastSalePrices[doc.sku].price,
        });
      }
    }
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  const skus: string[] = JSON.parse(req.body)?.skus;

  return new Promise<void>((resolve, reject) => {
    if (!skus || skus.length == 0) {
      res.status(200);
      resolve();
    } else {
      getPriceChanges(skus)
        .then((result) => addLatestPoint(skus, result))
        .then(({ prices, salePrices }) => {
          if (prices.length > 0 || salePrices.length > 0) {
            res.status(200).json({ prices: prices, salePrices: salePrices });
          } else {
            res.status(404).json({ prices: prices, salePrices: salePrices });
          }
          resolve();
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    }
  });
}
