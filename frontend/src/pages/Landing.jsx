import React from 'react';
import { Link } from 'react-router-dom';

const STEPS = ['Identify', 'Understand', 'Match', 'Collaborate', 'Develop', 'Deploy', 'Measure'];
const AUDIENCES = [
  { title: 'Citizens', desc: 'Report real, on-ground societal challenges from their community.' },
  { title: 'Government', desc: 'Validate challenges, track priorities and measure impact at scale.' },
  { title: 'Universities / HEIs', desc: 'Discover matched challenges and turn them into research projects.' },
  { title: 'Students & Faculty', desc: 'Build deployable solutions as part of real academic project work.' },
  { title: 'Industry / Startups / MSMEs', desc: 'Offer mentorship, resources and funding to promising projects.' },
  { title: 'Communities', desc: 'Benefit directly from deployed, measured solutions.' },
];

export default function Landing() {
  return (
    <div>
      <section className="bg-gradient-to-br from-gov-900 to-gov-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Turning Societal Challenges into Scalable Innovation
          </h1>
          <p className="mt-5 text-lg text-gov-100 max-w-2xl mx-auto">
            Connect citizens, government, universities and industry to transform real-world problems
            into measurable impact.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/login" className="bg-white text-gov-900 font-semibold px-6 py-3 rounded-lg hover:bg-gov-50 transition">
              Get Started
            </Link>
            <a href="#flow" className="border border-white/60 px-6 py-3 rounded-lg hover:bg-white/10 transition">
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section id="flow" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gov-900 text-center mb-10">The Innovation Lifecycle</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="bg-white border border-gov-100 shadow-sm rounded-lg px-4 py-3 text-gov-900 font-semibold text-sm">
                {step}
              </div>
              {i < STEPS.length - 1 && <span className="text-gov-600">→</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gov-900 text-center mb-10">Who Uses the Platform</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-gov-900">{a.title}</h3>
                <p className="text-sm text-slate-500 mt-2">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
