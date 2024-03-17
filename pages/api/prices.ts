import type { NextApiRequest, NextApiResponse } from 'next';
import { InfluxDB } from '@influxdata/influxdb-client';
import { PricesResponse, Env, Price, PricesRequest } from '../../types';
import dayjs from 'dayjs';

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
  res: NextApiResponse<PricesResponse>,
) {
  const body = JSON.parse(req.body);
  const skus = body.skus;
  if (!skus || skus.length == 0) {
    res.status(400);
    return;
  }
  const client = new InfluxDB({ url: url, token: token });
  const queryApi = client.getQueryApi(org);

  let prices: Price[] = [];
  let salePrices: Price[] = [];

  let lastPrices: { [key: string]: Price } = {};
  let lastSalePrices: { [key: string]: Price } = {};

  const getInfluxQuery = (querySkus: string[]) => {
    let query = '(';
    for (let i = 0; i < querySkus.length; i++) {
      const sku = querySkus[i];
      if (i == 0) query += 'r.sku == "';
      else query += ' or r.sku == "';
      query += encodeURIComponent(sku) + '"';
    }
    query += ')';
    return query;
  };

  const query =
    'from(bucket: "' +
    bucket +
    '") \
    |> range(start: -5y) \
    |> filter(fn: (r) => (r._measurement == "price" or r["_measurement"] == "sale_price") and ' +
    getInfluxQuery(skus) +
    ')';
  return new Promise<void>((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        const entry = { timestamp: o._time, price: o._value, sku: o.sku };
        if (o._measurement === 'price') {
          lastPrices[o.sku] = { ...entry };
          prices.push(entry);
        } else {
          lastSalePrices[o.sku] = { ...entry };
          salePrices.push(entry);
        }
      },
      error(error) {
        console.error(error);
        res.status(400);
        reject(error);
      },
      complete() {
        if (prices.length > 0 || salePrices.length > 0) {
          Object.keys(lastPrices).forEach((key: string) => {
            lastPrices[key].timestamp = dayjs().toISOString();
            prices.push(lastPrices[key]);
          });
          Object.keys(lastSalePrices).forEach((key: string) => {
            lastSalePrices[key].timestamp = dayjs().toISOString();
            salePrices.push(lastSalePrices[key]);
          });
          res.status(200).json({ prices: prices, salePrices: salePrices });
        } else {
          res.status(404).json({ prices: prices, salePrices: salePrices });
        }
        resolve();
      },
    });
  });
}
