import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';
import {
  RechartFormat,
  PricesResponse,
  AutocompleteResponse,
  SelectValue,
  StoreConfig
} from '../types';
import PriceChart from '../components/PriceChart/PriceChart';
import { Flex, Layout, Select } from 'antd';
import SkuSelector from '../components/SkuSelector/SkuSelector';
import getMongoClient from '../utils/mongodb';
import { InferGetServerSidePropsType } from 'next/types';
import dayjs from 'dayjs';

const { Header, Content } = Layout;

export async function getServerSideProps() {
  const stores = await getMongoClient()
    .db('google-shopping-scraper')
    .collection<StoreConfig>('stores')
    .find({}, { projection: { name: 1 } })
    .toArray();
  return {
    props: {
      stores
    }
  };
}

export default function Home({
  stores
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const mainLayoutRef = useRef<HTMLElement | null>(null);
  const [prices, setPrices] = useState<RechartFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSkus, setSelectedSkus] = useState<SelectValue[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>(
    stores.map((store) => store.name)
  );

  useEffect(() => {
    const addToArray = (price: RechartFormat, prices: RechartFormat[]) => {
      const index = prices.findIndex(
        (onePrice) => onePrice.timestamp === price.timestamp
      );
      if (index < 0) {
        prices.push(price);
      } else {
        prices[index] = {
          ...price,
          ...prices[index]
        };
      }
    };
    const formatPricesForRechart = (res: PricesResponse) => {
      const prices: RechartFormat[] = [];
      res.stores?.forEach((store) => {
        store.skus.forEach((sku) => {
          const key = store.name + ' - ' + sku.sku + ' - price';
          for (const price of sku.prices) {
            const startDay = dayjs.unix(price.start).startOf('day');
            addToArray(
              {
                [key]: price.price,
                timestamp: startDay.unix()
              },
              prices
            );
            const endDay = dayjs.unix(price.end).endOf('day');
            let nextDay = startDay.add(1, 'day');
            while (nextDay.isBefore(endDay)) {
              addToArray(
                {
                  [key]: price.price,
                  timestamp: nextDay.unix()
                },
                prices
              );
              nextDay = nextDay.add(1, 'day');
            }
          }
          const saleKey = store.name + ' - ' + sku.sku + ' - salePrice';
          if (sku.salePrices) {
            for (const price of sku.salePrices) {
              const startDay = dayjs.unix(price.start).startOf('day');
              addToArray(
                {
                  [saleKey]: price.price,
                  timestamp: startDay.unix()
                },
                prices
              );
              const endDay = dayjs.unix(price.end).endOf('day');
              let nextDay = startDay.add(1, 'day');
              while (nextDay.isBefore(endDay)) {
                addToArray(
                  {
                    [saleKey]: price.price,
                    timestamp: nextDay.unix()
                  },
                  prices
                );
                nextDay = nextDay.add(1, 'day');
              }
            }
          }
        });
      });
      return prices;
    };
    const filtered = selectedSkus.map((sku) => sku.value);
    fetch('/api/prices', {
      method: 'POST',
      body: JSON.stringify({
        skus: filtered,
        stores: selectedStores
      })
    })
      .then((res) => res.json())
      .then((res: PricesResponse) => {
        setPrices(formatPricesForRechart(res));
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }, [selectedSkus, selectedStores]);

  async function searchForSkusBeginningWith(
    term: string
  ): Promise<SelectValue[]> {
    return fetch('/api/autocomplete', {
      method: 'POST',
      body: JSON.stringify({
        term: term,
        stores: selectedStores
      })
    })
      .then((res) => res.json())
      .then((res: AutocompleteResponse) => {
        return res.terms.map((term: string) => ({
          key: term,
          label: term,
          value: term
        }));
      });
  }

  if (loading) {
    return <div>loading...</div>;
  }
  return (
    <div className={styles.container}>
      <Layout style={{ height: '100vh' }}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <SkuSelector
            mode="multiple"
            value={selectedSkus}
            placeholder="Leitaðu að vörunúmeri..."
            fetchOptions={searchForSkusBeginningWith}
            onChange={(newValue) => {
              setSelectedSkus(newValue as SelectValue[]);
            }}
            style={{ width: '89%' }}
          />
          <Select
            mode="multiple"
            allowClear
            style={{ width: '10%' }}
            placeholder="Veldu búð"
            defaultValue={selectedStores}
            onChange={(newValue) => {
              setSelectedStores(newValue);
            }}
            options={stores.map((store) => {
              return { label: store.name, value: store.name };
            })}
          />
        </Header>
        <Layout style={{ height: '100vh' }} ref={mainLayoutRef}>
          <Content>
            <Flex
              justify="space-around"
              align="center"
              style={{ height: '100%' }}
            >
              <PriceChart prices={prices} />
            </Flex>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
