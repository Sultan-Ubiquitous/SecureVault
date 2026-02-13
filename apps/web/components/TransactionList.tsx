'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api-client';
import type { TxSummary } from '../types/api';

export default function TransactionList() {
  const [transactions, setTransactions] = useState<TxSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getAllTransactions();
      setTransactions(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Optional: Refresh every 10 seconds
    const interval = setInterval(fetchTransactions, 10000); 
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          📜 Transaction Log
        </h2>
        <button 
          onClick={fetchTransactions}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-auto max-h-125 border border-gray-100 rounded-lg">
        {loading && transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading records...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No transactions found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Party ID</th>
                <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">Transaction UUID</th>
                <th className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-3 text-sm font-medium text-gray-900">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {tx.partyId}
                    </span>
                  </td>
                  <td className="p-3 text-xs font-mono text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-45" title={tx.id}>{tx.id}</span>
                      <button 
                        onClick={() => copyToClipboard(tx.id)}
                        className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700"
                        title="Copy ID"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-400 text-right">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}