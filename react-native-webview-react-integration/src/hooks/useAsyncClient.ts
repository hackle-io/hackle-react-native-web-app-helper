import { useEffect, useRef, useState } from "react";

export function useAsyncClient<T>(
  asyncFn: () => Promise<T>,
  deps: any[] = [],
  options?: { suspense?: boolean }
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [promise, setPromise] = useState<Promise<T> | null>(null);

  if (options?.suspense && promise) throw promise;

  useEffect(() => {
    setIsLoading(true);
    const promise = asyncFn();
    setPromise(promise);

    promise
      .then((res) => {
        setData(res);
      })
      .catch(() => {})
      .finally(() => {
        setPromise(null);
        setIsLoading(false);
      });
  }, deps);

  return { isLoading, data };
}
