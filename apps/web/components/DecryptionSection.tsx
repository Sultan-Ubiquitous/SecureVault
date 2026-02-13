'use client';

import { useState } from 'react';
import { api } from '../lib/api-client';

export default function DecryptSection() {
  const [txId, setTxId] = useState('');
  const [encryptedData, setEncryptedData] = useState<any>(null);
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId) return;
    
    setError('');
    setEncryptedData(null);
    setDecryptedData(null);
    setLoading(true);

    try {
      const data = await api.getTx(txId);
      setEncryptedData(data);
    } catch (err: any) {
      setError(err.message || 'Transaction not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!txId) return;
    setDecrypting(true);
    setError('');
    
    try {
      const data = await api.decryptTx(txId);
      setDecryptedData(data);
    } catch (err: any) {
      setError(err.message || 'Decryption failed');
    } finally {
      setDecrypting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🔓 Decrypt Transaction
      </h2>

      <form onSubmit={handleFetch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={txId}
          onChange={(e) => setTxId(e.target.value)}
          placeholder="Enter Transaction UUID"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? '...' : 'Fetch'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {encryptedData && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Encrypted Record</span>
              <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600">ReadOnly</span>
            </div>
            <pre className="text-[10px] text-gray-700 overflow-x-auto max-h-40">
              {JSON.stringify(encryptedData, null, 2)}
            </pre>
          </div>

          {!decryptedData ? (
            <button
              onClick={handleDecrypt}
              disabled={decrypting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {decrypting ? 'Decrypting...' : 'Decrypt Payload'}
            </button>
          ) : (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 animate-in zoom-in-95">
              <h3 className="font-semibold text-purple-900 mb-2">Decrypted Successfully</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Party ID:</strong> {decryptedData.partyId}</p>
                <div>
                  <strong>Payload:</strong>
                  <pre className="mt-1 p-2 bg-white rounded border border-purple-100 text-xs overflow-x-auto">
                    {JSON.stringify(decryptedData.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}