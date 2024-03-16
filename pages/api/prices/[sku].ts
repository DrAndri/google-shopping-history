import type { NextApiRequest, NextApiResponse } from 'next';
import { InfluxDB, flux } from '@influxdata/influxdb-client';
import { SkuResponse, Env, Price } from '../../../types';

const env: Env = {
  INFLUX_DB_URL: process.env.INFLUX_DB_URL || '',
  INFLUX_DB_TOKEN: process.env.INFLUX_DB_TOKEN || '',
  INFLUX_DB_ORG: process.env.INFLUX_DB_ORG || '',
};

const url = env.INFLUX_DB_URL;
const token = env.INFLUX_DB_TOKEN;
const org = env.INFLUX_DB_ORG;
const bucket = 'Origo';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SkuResponse>,
) {
  const sku = req.query.sku as string;
  const client = new InfluxDB({ url: url, token: token });
  const queryApi = client.getQueryApi(org);

  let prices: Price[] = [];
  let salePrices: Price[] = [];

  const query = flux`from(bucket: "${bucket}") 
    |> range(start: -5y)
    |> filter(fn: (r) => (r._measurement == "price" or r["_measurement"] == "sale_price") and r.sku == "${sku}")`;
  return new Promise<void>((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        if (o._measurement === 'price')
          prices.push({ timestamp: o._time, price: o._value });
        else salePrices.push({ timestamp: o._time, price: o._value });
      },
      error(error) {
        console.error(error);
        res.status(400);
        reject(error);
      },
      complete() {
        const lastPrice = prices[prices.length - 1];
        const lastSalePrice = salePrices[salePrices.length - 1];
        prices.push({
          timestamp: new Date().toISOString(),
          price: lastPrice.price,
        });
        salePrices.push({
          timestamp: new Date().toISOString(),
          price: lastSalePrice.price,
        });
        res
          .status(200)
          .json({ sku: sku, prices: prices, salePrices: salePrices });
        resolve();
      },
    });
  });
}
