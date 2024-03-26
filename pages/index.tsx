import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';
import {
  RechartFormat,
  PricesResponse,
  AutocompleteResponse,
  SelectValue,
  StoreConfig,
} from '../types';
import PriceChart from '../components/PriceChart/PriceChart';
import { Flex, Layout, Select } from 'antd';
import SkuSelector from '../components/SkuSelector/SkuSelector';
import getMongoClient from '../utils/mongodb';
import { InferGetServerSidePropsType } from 'next/types';

const { Header, Content } = Layout;

export async function getServerSideProps() {
  const stores = await getMongoClient()
    .db('google-shopping-scraper')
    .collection<StoreConfig>('stores')
    .find({}, { projection: { name: 1 } })
    .toArray();
  return {
    props: {
      stores,
    },
  };
}

export default function Home({
  stores,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const mainLayoutRef = useRef<HTMLElement | null>(null);
  const [prices, setPrices] = useState<RechartFormat[]>();
  const [loading, setLoading] = useState(false);
  const [mainLayoutDimensions, setMainLayoutDimensions] = useState<{
    offsetWidth: number;
    offsetHeight: number;
  }>({ offsetHeight: 0, offsetWidth: 0 });
  const [selectedSkus, setSelectedSkus] = useState<SelectValue[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>(['Origo']);

  useEffect(() => {
    const filtered = selectedSkus.map((sku) => sku.value);
    fetch('/api/prices', {
      method: 'POST',
      body: JSON.stringify({
        skus: filtered,
        stores: selectedStores,
      }),
    })
      .then((res) => res.json())
      .then((res: PricesResponse) => {
        setPrices(formatPricesForRechart(res));
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }, [selectedSkus, selectedStores]);

  useEffect(() => {
    const offsetWidth = mainLayoutRef.current
      ? mainLayoutRef.current.offsetWidth
      : 0;
    const offsetHeight = mainLayoutRef.current
      ? mainLayoutRef.current.offsetHeight
      : 0;
    setMainLayoutDimensions({ offsetWidth, offsetHeight });
  }, []);

  const formatPricesForRechart = (res: PricesResponse) => {
    const prices: RechartFormat[] = [];
    res.stores?.forEach((store) => {
      store.skus.forEach((sku) => {
        const key = store.name + ' - ' + sku.sku + ' - price';
        sku.prices.forEach((price) => {
          prices.push({
            [key]: price.price,
            timestamp: price.timestamp,
          });
        });
        const saleKey = store.name + ' - ' + sku.sku + ' - salePrice';
        sku.salePrices?.forEach((price) => {
          prices.push({
            [saleKey]: price.price,
            timestamp: price.timestamp,
          });
        });
      });
    });
    return prices;
  };

  async function searchForSkusBeginningWith(
    term: string,
  ): Promise<SelectValue[]> {
    return fetch('/api/autocomplete', {
      method: 'POST',
      body: JSON.stringify({
        term: term,
        stores: selectedStores,
      }),
    })
      .then((res) => res.json())
      .then((res: AutocompleteResponse) => {
        return res.terms.map((term: string) => ({
          key: term,
          label: term,
          value: term,
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
            justifyContent: 'space-between',
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
            style={{ width: '80%' }}
          />
          <Select
            mode="multiple"
            allowClear
            style={{ width: '10%' }}
            placeholder="Veldu búð"
            defaultValue={['Origo']}
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
              {prices && prices.length > 0 && (
                <PriceChart
                  prices={prices}
                  width={mainLayoutDimensions.offsetWidth - 50}
                  height={mainLayoutDimensions.offsetHeight - 50}
                />
              )}
            </Flex>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}
