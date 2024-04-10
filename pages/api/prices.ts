import type { NextApiResponse } from 'next';
import {
  PricesResponse,
  MongodbProductPrice,
  SkuPrices,
  StoreMap,
  StorePrices,
  SkuPricesResponse,
  PricesApiRequest
} from '../../types';
import getMongoClient from '../../utils/mongodb';

export default function handler(
  req: PricesApiRequest,
  res: NextApiResponse<PricesResponse>
) {
  const mongoClient = getMongoClient();

  const getPriceChanges = async (
    skus: string[],
    stores: string[]
  ): Promise<PricesResponse> => {
    const storeMap: StoreMap = new Map<string, Map<string, SkuPrices>>();

    const priceChanges = mongoClient
      .db('google-shopping-scraper')
      .collection<MongodbProductPrice>('priceChanges')
      .find(
        { sku: { $in: skus }, store: { $in: stores } },
        {
          projection: {
            _id: 0,
            sku: 1,
            price: 1,
            store: 1,
            salePrice: 1,
            timestamp: 1,
            start: 1,
            end: 1
          }
        }
      )
      .sort({ timestamp: 1 });
    for await (const doc of priceChanges) {
      const skuPrices = getSkuPricesFromMap(doc.store, doc.sku, storeMap);
      const entry = {
        start: doc.start,
        end: doc.end,
        price: doc.price
      };
      if (doc.salePrice) {
        skuPrices.salePrices.push(entry);
        skuPrices.lastSalePrice = entry;
      } else {
        skuPrices.prices.push(entry);
        skuPrices.lastPrice = entry;
      }
    }

    const response: PricesResponse = {};
    if (storeMap.size > 0) response.stores = [];
    for (const entry of storeMap.entries()) {
      response.stores?.push({
        name: entry[0],
        skus: getSkuResponse(entry[1])
      });
    }
    return response;
  };

  const getSkuResponse = (storePrices: StorePrices): SkuPricesResponse[] => {
    const skus = [];
    for (const entry of storePrices.entries()) {
      const skuPrice = {
        sku: entry[0],
        prices: entry[1].prices,
        salePrices: entry[1].salePrices
      };
      if (entry[1].salePrices.length > 0)
        skuPrice.salePrices = entry[1].salePrices;
      skus.push(skuPrice);
    }
    return skus;
  };

  const getSkuPricesFromMap = (
    store: string,
    sku: string,
    storeMap: StoreMap
  ): SkuPrices => {
    let storePrices = storeMap.get(store);
    if (storePrices === undefined) {
      storePrices = new Map<string, SkuPrices>();
      storeMap.set(store, storePrices);
      storePrices = storeMap.get(store);
    }

    let skuPrices = storePrices!.get(sku);
    if (skuPrices === undefined) {
      skuPrices = {
        lastPrice: undefined,
        lastSalePrice: undefined,
        prices: [],
        salePrices: []
      };
      storePrices!.set(sku, skuPrices);
      skuPrices = storePrices!.get(sku);
    }
    return skuPrices!;
  };
  const skus: string[] = req.body.skus;
  const stores: string[] = req.body.stores;

  return new Promise<void>((resolve, reject) => {
    if (!skus || skus.length == 0 || !stores || stores.length == 0) {
      res.status(200);
      resolve();
    } else {
      getPriceChanges(skus, stores)
        .then((body) => {
          if (body.stores && body.stores.length > 0) {
            res.status(200).json(body);
          } else {
            res.status(404).json(body);
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
