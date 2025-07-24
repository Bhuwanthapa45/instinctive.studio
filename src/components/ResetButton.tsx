'use client';
import { useState } from 'react';

export default function ResetButton() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setToast('');
    try {
      const res = await fetch('/api/incidents/reset', {
        method: 'PATCH',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      setToast('Incidents reset to unresolved');
    } catch (err) {
      setToast('Failed to reset incidents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <button
        onClick={handleReset}
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Resetting...' : 'Reset All Incidents'}
      </button>
      {toast && <p className="mt-2 text-sm text-gray-700">{toast}</p>}
    </div>
  );
}
