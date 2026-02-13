'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api-client';
import { HealthResponse } from '../types/api';

export default function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data as HealthResponse);
    } catch (err) {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-xs text-gray-500 animate-pulse">Checking API...</div>;

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border shadow-sm">
      <span className={`relative flex h-3 w-3`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHealthy ? 'bg-green-400' : 'bg-red-400'}`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
      </span>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-700 uppercase">{isHealthy ? 'System Online' : 'System Offline'}</span>
        {isHealthy && <span className="text-[10px] text-gray-400">Storage: {health.storage}</span>}
      </div>
    </div>
  );
}