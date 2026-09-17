import { useEffect, useState } from 'react';
import supabase from '../services/supabase';

export function useHealthCheck() {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('SiteSetting')
      .select('key')
      .limit(1)
      .then(({ error: err }) => {
        if (!cancelled) {
          if (err) {
            // Even if table is empty or unseeded, as long as network connected it's ok
            if (err.code === 'PGRST116' || !err.message.includes('fetch failed')) {
              setStatus('ok');
            } else {
              setStatus('error');
              setError(err.message);
            }
          } else {
            setStatus('ok');
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStatus('error');
          setError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, error };
}
