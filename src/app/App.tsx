import { APP_NAME } from '@/config/app.config';
import { DashboardPage } from '@/pages/DashboardPage';
import { Providers } from './providers';

export const App = () => (
  <Providers>
    <div className="app">
      <header className="app-header">
        <h1>{APP_NAME}</h1>
      </header>
      <DashboardPage />
    </div>
  </Providers>
);
