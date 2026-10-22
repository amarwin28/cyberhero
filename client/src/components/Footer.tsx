import React from 'react';
import { ShieldCheck, Mail, MapPin, Phone, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cyber-950 border-t border-cyber-cyan/15 pt-12 pb-8 px-4 lg:px-8 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: College Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/college-logo.jpeg"
              alt="Dhaanish Shield"
              className="w-10 h-10 object-contain rounded bg-white p-1"
            />
            <div>
              <h3 className="text-white font-bold text-base tracking-wide">
                DHAANISH AHMED COLLEGE OF ENGINEERING
              </h3>
              <p className="text-xs text-cyan-400 font-semibold tracking-wider">
                AUTONOMOUS | NAAC A+ | ANNA UNIVERSITY & AICTE APPROVED
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
            CyberHero is an initiative by the Departments of Computer Science & Engineering and Information
            Technology to build robust cybersecurity awareness and ethical tech literacy for school students
            across Tamil Nadu and India.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Award className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Empowering Class 10, 11 & 12 students with next-generation digital defense skills.</span>
          </div>
        </div>

        {/* Col 2: Campus Location */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider text-cyan-400">
            Campus Address
          </h4>
          <div className="flex items-start gap-2 text-xs leading-relaxed">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Dhaanish Nagar, Vanchuvancherry,
              <br />Padappai (Near Tambaram),
              <br />Chennai, Tamil Nadu – 601301.
            </span>
          </div>
        </div>

        {/* Col 3: Contact & Privacy */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider text-cyan-400">
            Event Helpdesk
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>dhaanishchennai@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>+91 98401 23456 / +91 44 2717 6200</span>
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-400 leading-tight">
                Student data is protected under institutional school-event confidentiality guidelines.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 Dhaanish Ahmed College of Engineering, Chennai. All rights reserved.</p>
        <div className="flex items-center gap-6 text-slate-400">
          <span>CyberHero Examination Portal</span>
          <span>•</span>
          <span>Autonomous Institution</span>
        </div>
      </div>
    </footer>
  );
};
