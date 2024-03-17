import { CartesianGrid, Line, LineChart, Tooltip, XAxis } from 'recharts';
import { PriceChartProps } from '../../types';
import dayjs from 'dayjs';

export default function PriceChart({ prices, width, height }: PriceChartProps) {
  const getRandomColor = () => {
    return (
      '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
    );
  };

  const getRechartLines = () => {
    if (!prices) return null;
    const entries = prices.map((option) => {
      const keys = Object.keys(option);
      return keys;
    });
    const flattened = entries.reduce((prev, current) => {
      prev = prev.concat(current);
      return prev;
    }, []);
    const filtered = flattened.filter((key) => key !== 'timestamp');
    const uniqueKeys = [...new Set(filtered)];
    return uniqueKeys.map((key) => {
      return (
        <Line
          key={key}
          type="stepAfter"
          stroke={getRandomColor()}
          dataKey={key}
        />
      );
    });
  };

  const everyMonthInRange = () => {
    const lowestTimestamp = prices[0].timestamp;
    const highestTimestamp = prices[prices.length - 1].timestamp;
    let timestamps = [];
    const lowest = dayjs.unix(lowestTimestamp);
    const highest = dayjs.unix(highestTimestamp);
    const firstOfLowest = lowest.startOf('month').unix();
    timestamps.push(firstOfLowest);
    let next = dayjs.unix(timestamps[timestamps.length - 1]).add(1, 'month');
    while (next.isBefore(highest)) {
      timestamps.push(next.unix());
      next = next.add(1, 'month');
      console.log(next);
      console.log(highest);
    }
    console.log(lowestTimestamp);
    console.log(highestTimestamp);
    console.log(timestamps);
    return timestamps;
  };

  const lowestAndHighestOfTimestamps = () => {
    const lowestTimestamp = prices[0].timestamp;
    const highestTimestamp = prices[prices.length - 1].timestamp;
    return [lowestTimestamp, highestTimestamp];
  };

  return (
    <LineChart
      width={width}
      height={height}
      data={prices}
      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
    >
      <XAxis
        dataKey="timestamp"
        type="number"
        domain={lowestAndHighestOfTimestamps()}
        ticks={everyMonthInRange()}
        interval={0}
        // tickCount={10}
        tickFormatter={(value) => {
          const date = dayjs.unix(value);
          return date.format('MM/YY');
        }}
      />
      <Tooltip labelFormatter={(t) => dayjs.unix(t).toLocaleString()} />
      <CartesianGrid stroke="#f5f5f5" />
      {getRechartLines()}
    </LineChart>
  );
}
