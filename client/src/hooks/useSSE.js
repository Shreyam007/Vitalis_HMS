import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function useSSE(onEvent) {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const eventSource = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

    const handleEvent = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onEvent) {
          onEvent(event.type, payload);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.addEventListener('appointment:created', handleEvent);
    eventSource.addEventListener('appointment:statusChanged', handleEvent);
    eventSource.addEventListener('queue:update', handleEvent);
    eventSource.addEventListener('prescription:issued', handleEvent);
    eventSource.addEventListener('invoice:paid', handleEvent);
    eventSource.addEventListener('notification:new', handleEvent);

    return () => {
      eventSource.close();
    };
  }, [token, onEvent]);
}
