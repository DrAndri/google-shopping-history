export type SkuResponse = {
  sku: string;
  prices: Price[];
  salePrices: Price[];
};
export type Price = {
  timestamp: string;
  price: number;
};

export interface RechartFormat {
  timestamp: number;
  price?: number;
  salePrice?: number;
}

export interface Env {
  INFLUX_DB_URL: string;
  INFLUX_DB_TOKEN: string;
  INFLUX_DB_ORG: string;
}
