import type { NextApiRequest, NextApiResponse } from 'next';
import { InfluxDB } from '@influxdata/influxdb-client';
import { AutocompleteResponse, Env } from '../../../types';

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
  res: NextApiResponse<AutocompleteResponse>,
) {
  const term = req.query.term as string;
  const client = new InfluxDB({ url: url, token: token });
  const queryApi = client.getQueryApi(org);

  let terms: string[] = [];

  const query =
    ' \
  from(bucket: "' +
    bucket +
    '") \
  |> range(start: -30d, stop: now()) \
  |> filter(fn: (r) => (r["_measurement"] == "price" or r["_measurement"] == "sale_price") and (r["_field"] == "amount")) \
  |> keep(columns: ["sku"]) \
  |> group() \
  |> distinct(column: "sku") \
  |> filter(fn: (r) => r._value =~ /^' +
    encodeURIComponent(term) +
    '.*/) \
  |> limit(n: 1000) \
  |> sort()';

  return new Promise<void>((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        terms.push(o._value);
      },
      error(error) {
        console.error(error);
        res.status(400);
        reject(error);
      },
      complete() {
        res.status(200).json({ terms: terms });
        resolve();
      },
    });
  });
}
