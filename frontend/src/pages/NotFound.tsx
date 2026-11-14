import React from 'react';
import { NavLink } from 'react-router-dom';
import { Flame, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-ignis-orange mb-6 shadow-glow-orange">
        <Flame size={38} />
      </div>

      <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-2">
        Error 404 · Navigation Deviation
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono mb-3">
        Page Orbit Not Found
      </h1>
      <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-6 font-sans">
        The requested research route does not exist in the IGNIS Space Fire Intelligence navigation matrix.
      </p>

      <NavLink to="/" className="btn-primary text-xs py-2.5 px-6 rounded-xl flex items-center gap-2">
        <Home size={15} />
        <span>Return to Mission Control</span>
      </NavLink>
    </div>
  );
};
