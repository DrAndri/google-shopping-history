import { useCallback, useState } from 'react';
import { LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    if (query.length) {
      fetch(process.env.BASE_URL + '/api/prices/' + query)
        .then((res) => res.json())
        .then((res) => {
          setData(res.prices);
          setLoading(false);
        });
    } else {
      setData([]);
    }
  }, []);
  if (loading) {
    return <div>loading...</div>;
  }
  return (
    <div className={styles.container}>
      <input onChange={onChange} />
      {data.length > 0 && (
        <LineChart
          width={400}
          height={400}
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis dataKey="timestamp" />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="price" stroke="#ff7300" yAxisId={0} />
        </LineChart>
      )}
    </div>
  );
}
