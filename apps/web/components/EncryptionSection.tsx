'use client';

import { useState } from 'react';
import { api } from '../lib/api-client';

export default function EncryptSection() {
  const [partyId, setPartyId] = useState('');
  const [jsonPayload, setJsonPayload] = useState('{\n  "amount": 1000,\n  "currency": "USD"\n}');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      // 1. Validate JSON locally first
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(jsonPayload);
      } catch (e) {
        throw new Error('Invalid JSON format in payload');
      }

      // 2. Send to API
      const response = await api.encrypt(partyId, parsedPayload);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🔒 New Transaction
      </h2>

      <form onSubmit={handleEncrypt} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Party ID</label>
          <input
            type="text"
            required
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            placeholder="e.g., bank-001"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payload (JSON)</label>
          <textarea
            required
            rows={5}
            value={jsonPayload}
            onChange={(e) => setJsonPayload(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Encrypting...' : 'Encrypt & Store'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-green-800">Transaction Secured</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(result.id)}
              className="text-xs bg-white border border-green-300 px-2 py-1 rounded text-green-700 hover:bg-green-100"
            >
              Copy ID
            </button>
          </div>
          <p className="text-xs text-green-700 mb-2 break-all">
            <strong>ID:</strong> {result.id}
          </p>
          <details>
            <summary className="text-xs text-green-600 cursor-pointer hover:underline">View Raw Response</summary>
            <pre className="mt-2 text-[10px] bg-white p-2 rounded border border-green-100 overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}