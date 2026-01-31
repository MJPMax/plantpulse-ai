import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Overview from './pages/Overview';
import Anomalies from './pages/Anomalies';
import AnomalyDetail from './pages/AnomalyDetail';
import MetricDetail from './pages/MetricDetail';
import Actions from './pages/Actions';
import Specs from './pages/Specs';
import Settings from './pages/Settings';
import Scoreboard from './pages/Scoreboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Overview /> },
      { path: 'anomalies', element: <Anomalies /> },
      { path: 'anomalies/:id', element: <AnomalyDetail /> },
      { path: 'metrics/:id', element: <MetricDetail /> },
      { path: 'actions', element: <Actions /> },
      { path: 'specs', element: <Specs /> },
      { path: 'scoreboard', element: <Scoreboard /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
