import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import {
  PricesResponse,
  Env,
  Price,
  PricesRequest,
  MongodbProductPrice,
  MongodbProductInfo,
} from '../../types';

const env: Env = {
  MONGODB_URI: process.env.MONGODB_URI || '',
};

const MONGODB_URI = env.MONGODB_URI;
const storeName = 'Origo';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PricesResponse>,
) {
  const body = JSON.parse(req.body);
  const skus = body.skus;
  if (!skus || skus.length == 0) {
    res.status(400);
    return;
  }
  const mongoClient = new MongoClient(MONGODB_URI);
  mongoClient.connect();

  let prices: Price[] = [];
  let salePrices: Price[] = [];

  let lastPrices: { [key: string]: Price } = {};
  let lastSalePrices: { [key: string]: Price } = {};

  return new Promise<void>(async (resolve, reject) => {
    const priceChanges = mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductPrice>('priceChanges')
      .find({ sku: { $in: skus }, store: storeName });
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

    const productInfos = mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductInfo>('productInfo')
      .find({ sku: { $in: skus }, store: storeName });
    for await (const doc of productInfos) {
      prices.push({
        timestamp: doc.lastSeen,
        sku: doc.sku,
        price: lastPrices[doc.sku].price,
      });
      if (doc.salePriceLastSeen)
        prices.push({
          timestamp: doc.salePriceLastSeen,
          sku: doc.sku,
          price: lastSalePrices[doc.sku].price,
        });
    }
    res.status(200).json({ prices: prices, salePrices: salePrices });
    res.status(404).json({ prices: prices, salePrices: salePrices });
    resolve();
  });
}
