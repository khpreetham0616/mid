import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

const features = [
  { icon: 'fa-user-injured', color: 'from-teal-500 to-teal-600', title: 'P-MID — Patient', desc: 'Your universal medical identity. Book appointments, view prescriptions, track medical history, and find nearby doctors instantly.' },
  { icon: 'fa-user-md', color: 'from-indigo-500 to-indigo-600', title: 'D-MID — Doctor', desc: 'Lookup patients by their P-MID, write digital prescriptions, manage appointments, and maintain complete medical records.' },
  { icon: 'fa-hospital', color: 'from-emerald-500 to-emerald-600', title: 'H-MID — Hospital', desc: 'Manage affiliated doctors, departments, and hospital information. Connect healthcare professionals and patients seamlessly.' },
  { icon: 'fa-user-shield', color: 'from-rose-500 to-rose-600', title: 'Super Admin', desc: 'Complete oversight of all users — patients, doctors, and hospitals — with system-wide analytics and management tools.' },
];

const stats = [
  { icon: 'fa-user-injured', value: '10,000+', label: 'Patients Registered', color: 'text-teal-400' },
  { icon: 'fa-user-md', value: '1,200+', label: 'Verified Doctors', color: 'text-indigo-400' },
  { icon: 'fa-hospital', value: '350+', label: 'Partner Hospitals', color: 'text-emerald-400' },
  { icon: 'fa-file-medical', value: '50,000+', label: 'Records Secured', color: 'text-blue-400' },
];

const capabilities = [
  { icon: 'fa-id-card', title: 'Unified Medical Identity', desc: 'One MID, all your health records across any hospital or doctor.' },
  { icon: 'fa-map-marker-alt', title: 'Nearby Doctor Search', desc: 'Find qualified doctors in your city based on specialization and symptoms.' },
  { icon: 'fa-prescription', title: 'Digital Prescriptions', desc: 'Doctors write and store prescriptions digitally — no lost paperwork.' },
  { icon: 'fa-history', title: 'Complete Medical History', desc: 'Consultations, surgeries, lab reports — all in one secure place.' },
  { icon: 'fa-diagnoses', title: 'AI Symptom Checker', desc: 'Describe your symptoms and get matched with the right specialists.' },
  { icon: 'fa-shield-alt', title: 'Privacy & Security', desc: 'Your health data is encrypted and only shared with your consent.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/30"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: 'translate(-50%,-50%)',
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-24 lg:py-32 relative">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl mx-auto text-center">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 text-sm text-blue-300 mb-6">
                <i className="fas fa-star text-xs" /> The Future of Healthcare Identity
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              Your Medical Identity,{' '}
              <span className="text-gradient">Everywhere</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              MID gives every patient, doctor, and hospital a unique identity. One system to connect all healthcare — from appointments to surgeries.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-xl w-full sm:w-auto">
                  <i className="fas fa-user-plus mr-2" /> Create Your MID
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  <i className="fas fa-sign-in-alt mr-2" /> Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 720 0 0 40L0 80Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border"
              >
                <i className={`fas ${s.icon} text-2xl ${s.color} mb-3`} />
                <p className="text-3xl font-extrabold text-slate-800">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User type cards */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Who is MID for?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Separate identities, unified system — tailored experience for every role in healthcare.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border bg-slate-50 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 shadow`}>
                  <i className={`fas ${f.icon}`} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Everything Healthcare Needs</h2>
            <p className="text-slate-500 max-w-xl mx-auto">From symptom checking to surgery records — MID handles it all.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <i className={`fas ${c.icon} text-sm`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">{c.title}</h3>
                  <p className="text-sm text-slate-500">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-extrabold mb-4">Ready to get your MID?</h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">Join thousands of patients, doctors, and hospitals already using MID for seamless healthcare.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-xl w-full sm:w-auto">
                  <i className="fas fa-rocket mr-2" /> Get Started Free
                </Button>
              </Link>
              <Link to="/symptom-checker">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto">
                  <i className="fas fa-diagnoses mr-2" /> Try Symptom Checker
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 text-center text-sm py-8">
        <p className="font-medium text-slate-300 mb-1">MID — Medical Identity System</p>
        <p className="text-xs">P-MID · D-MID · H-MID · Secure · Universal · 2026</p>
      </footer>
    </div>
  );
}
