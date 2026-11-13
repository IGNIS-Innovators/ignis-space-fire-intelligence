import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Dashboard } from '../pages/Dashboard';
import { ResearchExplorer } from '../pages/ResearchExplorer';
import { Visualization } from '../pages/Visualization';
import { Comparison } from '../pages/Comparison';
import { Insights } from '../pages/Insights';
import { PredictiveLab } from '../pages/PredictiveLab';
import { SubmitExperiment } from '../pages/SubmitExperiment';
import { Settings } from '../pages/Settings';
import { Help } from '../pages/Help';
import { NotFound } from '../pages/NotFound';
import { ROUTES } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path={ROUTES.DASHBOARD_ALIAS} element={<Navigate to="/" replace />} />
          <Route path={ROUTES.RESEARCH} element={<ResearchExplorer />} />
          <Route path={ROUTES.VISUALIZATION} element={<Visualization />} />
          <Route path={ROUTES.COMPARISON} element={<Comparison />} />
          <Route path={ROUTES.INSIGHTS} element={<Insights />} />
          <Route path={ROUTES.PREDICTIVE_LAB} element={<PredictiveLab />} />
          <Route path={ROUTES.SUBMIT_EXPERIMENT} element={<SubmitExperiment />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path={ROUTES.HELP} element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
