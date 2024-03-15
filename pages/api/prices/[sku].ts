import type { NextApiRequest, NextApiResponse } from 'next';
import { InfluxDB, flux } from '@influxdata/influxdb-client';

type Data = {
  sku: string;
  prices: Prices[];
};
type Prices = {
  timestamp: string;
  price: number;
};

interface Env {
  INFLUX_DB_URL: string;
  INFLUX_DB_TOKEN: string;
  INFLUX_DB_ORG: string;
}

const env: Env = {
  INFLUX_DB_URL: process.env.INFLUX_DB_URL || '',
  INFLUX_DB_TOKEN: process.env.INFLUX_DB_TOKEN || '',
  INFLUX_DB_ORG: process.env.INFLUX_DB_ORG || '',
};

const url = env.INFLUX_DB_URL;
const token = env.INFLUX_DB_TOKEN;
const org = env.INFLUX_DB_ORG;
const bucket = 'my-bucket';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const sku = req.query.sku as string;
  const client = new InfluxDB({ url: url, token: token });
  const queryApi = client.getQueryApi(org);

  let prices: Prices[] = [];

  const query = flux`from(bucket: "${bucket}") 
    |> range(start: -5y)
    |> filter(fn: (r) => r._measurement == "priceHistory" and r.sku == "${sku}")`;
  return new Promise<void>((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        prices.push({ timestamp: o._time, price: o._value });
      },
      error(error) {
        console.error(error);
        res.status(400);
        reject(error);
      },
      complete() {
        res.status(200).json({ sku: sku, prices: prices });
        resolve();
      },
    });
  });
}
