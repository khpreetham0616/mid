import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { suggestionAPI } from '@/services/api';
import type { SuggestionResult } from '@/types';

export default function SymptomChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const s = searchParams.get('symptoms');
    if (s) {
      const list = s.split(',').map(x => x.trim()).filter(Boolean);
      setSymptoms(list);
      fetchSuggestions(list);
    }
  }, []);

  const fetchSuggestions = async (list: string[]) => {
    if (!list.length) return;
    setLoading(true);
    try {
      const res = await suggestionAPI.suggest(list);
      setResult(res.data);
    } catch { setResult({ doctors: [], hospitals: [] }); }
    finally { setLoading(false); }
  };

  const addSymptom = () => {
    const t = input.trim();
    if (t && !symptoms.includes(t)) {
      const updated = [...symptoms, t];
      setSymptoms(updated);
      setInput('');
      fetchSuggestions(updated);
    }
  };

  const removeSymptom = (s: string) => {
    const updated = symptoms.filter(x => x !== s);
    setSymptoms(updated);
    if (updated.length) fetchSuggestions(updated);
    else setResult(null);
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          <i className="fas fa-stethoscope mr-3 text-blue-500" />Symptom Checker
        </h1>
        <p className="text-slate-500">Enter your symptoms to find the right doctors and hospitals</p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border p-5 mb-6">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSymptom()}
            placeholder="e.g. Chest pain, Shortness of breath..."
            className="flex-1"
          />
          <Button onClick={addSymptom} className="bg-blue-600 hover:bg-blue-700 text-white px-5">
            <i className="fas fa-plus mr-2" />Add
          </Button>
        </div>

        <AnimatePresence>
          {symptoms.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-400 font-medium">Symptoms:</span>
              {symptoms.map(s => (
                <motion.span key={s} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {s}
                  <button onClick={() => removeSymptom(s)} className="text-blue-400 hover:text-blue-700 ml-0.5 leading-none">
                    <i className="fas fa-times text-xs" />
                  </button>
                </motion.span>
              ))}
              <button onClick={() => { setSymptoms([]); setResult(null); }} className="text-xs text-slate-400 hover:text-red-500 ml-2">
                Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {symptoms.length === 0 && (
        <div className="text-center py-20 text-slate-300">
          <i className="fas fa-search text-6xl mb-4" />
          <p className="text-lg font-medium text-slate-400">Add symptoms to get started</p>
          <p className="text-sm text-slate-400 mt-1">Try: Fever, Headache, Chest pain, Back pain</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      )}

      {result && !loading && (
        <Tabs defaultValue="doctors">
          <TabsList className="mb-6">
            <TabsTrigger value="doctors"><i className="fas fa-user-md mr-1.5 text-indigo-500" />Doctors ({result.doctors.length})</TabsTrigger>
            <TabsTrigger value="hospitals"><i className="fas fa-hospital mr-1.5 text-emerald-500" />Hospitals ({result.hospitals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors">
            {result.doctors.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-user-md text-4xl mb-3" />
                <p>No matching doctors found</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.doctors.map((doc, i) => (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="card-hover cursor-pointer" onClick={() => navigate(`/doctors/${doc.id}`)}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 flex-shrink-0">
                            {doc.first_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate">Dr. {doc.first_name} {doc.last_name}</h3>
                            <p className="text-sm text-blue-600">{doc.specialization}</p>
                          </div>
                          <Badge variant={doc.is_available ? 'success' : 'secondary'} className="text-xs">{doc.is_available ? 'Available' : 'Busy'}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                          <span><i className="fas fa-briefcase mr-1" />{doc.experience_years} yrs</span>
                          <span className="text-amber-500"><i className="fas fa-star mr-1" />{doc.rating.toFixed(1)}</span>
                          <span className="font-bold text-green-600">₹{doc.consult_fee}</span>
                        </div>
                        <Button size="sm" className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={e => { e.stopPropagation(); navigate(`/patient/book/${doc.id}`); }}>
                          <i className="fas fa-calendar-plus mr-1.5" />Book
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hospitals">
            {result.hospitals.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-hospital text-4xl mb-3" />
                <p>No matching hospitals found</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.hospitals.map((h, i) => (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="card-hover cursor-pointer" onClick={() => navigate(`/hospitals/${h.id}`)}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                            <i className="fas fa-hospital text-xl" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate">{h.name}</h3>
                            <Badge variant="secondary" className="text-xs mt-0.5">{h.type}</Badge>
                          </div>
                          <Badge variant="hospital" className="text-xs">{h.mid}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {h.city && <span><i className="fas fa-map-marker-alt mr-1" />{h.city}</span>}
                          <span><i className="fas fa-procedures mr-1" />{h.beds} beds</span>
                          <span className="text-amber-500"><i className="fas fa-star mr-1" />{h.rating.toFixed(1)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}
