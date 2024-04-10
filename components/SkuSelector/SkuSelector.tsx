import React, { useMemo, useRef, useState } from 'react';
import { Select, Spin } from 'antd';
import type { SelectProps } from 'antd';
import debounce from 'lodash/debounce';
import { SelectValue } from '../../types';

export interface DebounceSelectProps<ValueType>
  extends Omit<SelectProps<ValueType | SelectValue[]>, 'options' | 'children'> {
  fetchOptions: (term: string) => Promise<SelectValue[]>;
  debounceTimeout?: number;
}

export default function SkuSelector({
  fetchOptions,
  debounceTimeout = 500,
  ...props
}: DebounceSelectProps<SelectValue>) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<SelectValue[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value)
        .then((newOptions) => {
          if (fetchId !== fetchRef.current) {
            // for fetch callback order
            return;
          }

          setOptions(newOptions);
          setFetching(false);
        })
        .catch((error) => console.log(error));
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}
