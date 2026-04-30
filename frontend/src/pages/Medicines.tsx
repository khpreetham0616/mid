import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { medicineAPI } from '@/services/api';
import type { Medicine } from '@/types';

const CATEGORIES = ['All', 'Antibiotic', 'Analgesic', 'Antiviral', 'Antifungal', 'Cardiovascular', 'Diabetes', 'Vitamin', 'Supplement'];

export default function Medicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMeds = async () => {
    setLoading(true);
    try {
      const res = await medicineAPI.list({ page, limit: 12, search: search || undefined });
      setMedicines(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch { setMedicines([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMeds(); }, [page, search]);

  const totalPages = Math.ceil(total / 12);

  const handleSearch = () => { setSearch(searchInput); setPage(1); };

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          <i className="fas fa-pills mr-3 text-purple-500" />Medicine Directory
        </h1>
        <p className="text-slate-500">{total} medicines listed</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border p-4 mb-6 space-y-4">
        <div className="flex gap-3">
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, category, manufacturer..."
            className="flex-1"
          />
          <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white px-5">
            <i className="fas fa-search mr-2" />Search
          </Button>
          {search && (
            <Button variant="ghost" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }} className="text-slate-400">
              <i className="fas fa-times" />
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <i className="fas fa-pills text-5xl mb-4" />
          <p className="text-lg font-medium">No medicines found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {medicines.map((med, i) => (
              <motion.div key={med.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="card-hover h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                        <i className="fas fa-capsules text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{med.name}</h3>
                        {med.generic_name && <p className="text-xs text-slate-400 italic truncate">{med.generic_name}</p>}
                      </div>
                      <Badge variant={med.is_available ? 'success' : 'secondary'} className="text-xs flex-shrink-0">
                        {med.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 mb-3 flex-1">
                      {med.category && (
                        <Badge variant="secondary" className="text-xs">{med.category}</Badge>
                      )}
                      {med.manufacturer && (
                        <p className="mt-2"><i className="fas fa-industry mr-1.5 text-slate-400" />{med.manufacturer}</p>
                      )}
                      {med.dosage && <p><i className="fas fa-prescription-bottle mr-1.5 text-slate-400" />Dosage: {med.dosage}</p>}
                      {med.description && (
                        <p className="text-slate-500 leading-relaxed">
                          {med.description.length > 100 ? `${med.description.slice(0, 100)}…` : med.description}
                        </p>
                      )}
                    </div>

                    {med.side_effects && (
                      <div className="bg-amber-50 rounded-lg px-3 py-2 mb-3 border border-amber-100">
                        <p className="text-xs text-amber-700"><i className="fas fa-exclamation-triangle mr-1.5" />
                          {med.side_effects.length > 80 ? `${med.side_effects.slice(0, 80)}…` : med.side_effects}
                        </p>
                      </div>
                    )}

                    <div className="pt-3 border-t flex items-center justify-between mt-auto">
                      <span className="text-xl font-extrabold text-green-600">₹{med.price}</span>
                      {med.requires_prescription && (
                        <Badge variant="warning" className="text-xs"><i className="fas fa-file-prescription mr-1" />Rx</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}><i className="fas fa-chevron-left" /></Button>
              <span className="flex items-center px-4 text-sm text-slate-600">Page {page} of {totalPages}</span>
              <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><i className="fas fa-chevron-right" /></Button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
