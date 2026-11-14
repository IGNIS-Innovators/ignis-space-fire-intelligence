import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GalaxyBackground } from '../visuals/GalaxyBackground';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ignis_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ignis_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const active = document.activeElement;
        const isInput =
          active instanceof HTMLInputElement ||
          active instanceof HTMLTextAreaElement ||
          active?.getAttribute('contenteditable') === 'true';
        if (isInput) return;

        e.preventDefault();
        handleToggleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-[#EAF2FF] flex relative overflow-x-hidden">
      {/* Shared Cinematic Deep-Space Galaxy Background (Consistent across all 5 pages) */}
      <GalaxyBackground />

      {/* Left Sidebar (Collapsible on Desktop, Slide-in Drawer on Mobile) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area (Expands smoothly to full width when sidebar is collapsed) */}
      <div
        className={`flex-1 flex flex-col min-w-0 relative z-10 transition-[padding] duration-300 ease-in-out motion-reduce:transition-none ${
          isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
        <footer className="px-6 py-4 border-t border-[#1E3252]/60 bg-[#050B18]/70 backdrop-blur-md text-center text-xs font-mono text-[#9FB0C8]/70 relative z-10">
          IGNIS · Space Fire Intelligence · NASA Physical Sciences Informatics (PSI) Research System
        </footer>
      </div>
    </div>
  );
};
