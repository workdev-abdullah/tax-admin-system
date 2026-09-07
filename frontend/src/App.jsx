import { Component, useEffect, useState } from 'react';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/auth/LoginPage';
import ClientsPage from './pages/clients/ClientsPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/products/ProductsPage';
import InventoryPage from './pages/inventory/InventoryPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import SummaryPage from './pages/summary/SummaryPage';
import SettingsPage from './pages/settings/SettingsPage';
import { apiFetch, clearToken, getToken } from './services/api';

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fatal-error card">
          <div className="eyebrow">APPLICATION ERROR</div>
          <h3>Something went wrong</h3>
          <p className="muted">This page hit an unexpected error. Your saved data was not changed by this error.</p>
          <button className="primary" type="button" onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ShellApp() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState('Dashboard');

  useEffect(() => {
    function handleUnauthorized() {
      setAdmin(null);
      setChecking(false);
    }

    window.addEventListener('admin:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('admin:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setChecking(false);
      return undefined;
    }

    let active = true;
    apiFetch('/auth/me')
      .then((data) => {
        if (active) setAdmin(data.admin);
      })
      .catch(() => {
        clearToken();
        if (active) setAdmin(null);
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => { active = false; };
  }, []);

  if (checking) return <div className="loading"><span className="loading-spinner" />Checking admin session…</div>;
  if (!admin) return <LoginPage onLogin={setAdmin} />;

  const nav = (nextPage) => setPage(nextPage);
  const content = {
    Dashboard: <DashboardPage navigate={nav} />,
    Clients: <ClientsPage />,
    Products: <ProductsPage />,
    Inventory: <InventoryPage />,
    Invoices: <InvoicesPage />,
    Summary: <SummaryPage />,
    Settings: <SettingsPage />
  }[page] || <DashboardPage navigate={nav} />;

  return (
    <AppShell
      page={page}
      onNavigate={nav}
      admin={admin}
      onLogout={() => { clearToken(); setAdmin(null); setPage('Dashboard'); }}
    >
      {content}
    </AppShell>
  );
}

export default function App() {
  return <ErrorBoundary><ShellApp /></ErrorBoundary>;
}
