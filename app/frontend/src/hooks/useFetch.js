import { useState, useEffect } from 'react';

export default function useFetch(url) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let mounted = true;
    if (!url) return;
    fetch(url)
      .then(r => r.json())
      .then(d => mounted && setData(d))
      .catch(() => {});
    return () => (mounted = false);
  }, [url]);
  return data;
}
