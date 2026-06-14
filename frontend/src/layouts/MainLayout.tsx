import { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/mainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export default function MainLayout({ children, onLogout }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
