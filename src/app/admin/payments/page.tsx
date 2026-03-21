'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/payments/page.tsx
import { useEffect, useState } from 'react';
import { getAllPurchases } from '@/lib/firestore';
import { Purchase } from '@/types';
import { FaRupeeSign, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { format } from 'date-fns';

export default function PaymentsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPurchases()
      .then(setPurchases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const revenue = purchases
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1 text-sm">All Razorpay transactions</p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Transactions', value: purchases.length, color: 'bg-gray-50 text-gray-700' },
          { label: 'Successful', value: purchases.filter((p) => p.status === 'paid').length, color: 'bg-emerald-50 text-emerald-700' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-5 ${stat.color}`}>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-2xl font-bold font-display mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Transaction History</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaRupeeSign className="text-4xl mx-auto mb-3 opacity-30" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  {['User', 'Item', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700 truncate max-w-[180px]">{p.userEmail}</td>
                    <td className="px-6 py-4 text-gray-700 truncate max-w-[200px]">{p.itemTitle}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{p.amount}</td>
                    <td className="px-6 py-4">
                      {p.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <FaCheckCircle size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                          <FaTimesCircle size={12} /> {p.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {p.createdAt
                        ? format(
                            (p.createdAt as any)?.toDate?.() ?? new Date(p.createdAt as any),
                            'dd MMM yyyy'
                          )
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
