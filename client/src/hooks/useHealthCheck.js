import { useEffect, useState } from 'react';
import api from '../services/api';

export function useHealthCheck() {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/health')
      .then((response) => {
        if (!cancelled) {
          setStatus(response.data.status === 'ok' ? 'ok' : 'unknown');
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
