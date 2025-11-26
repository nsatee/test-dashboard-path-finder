import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { PathFinderPage } from './pages/PathFinderPage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[var(--color-background)]">
        <main className="w-full">
          <Routes>
            {/* Redirect root to path-finder for this demo */}
            <Route path="/" element={<PathFinderPage />} />
            <Route path="/path-finder" element={<PathFinderPage />} />
            <Route path="*" element={<div className="p-8 text-muted-foreground">Page under construction</div>} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}