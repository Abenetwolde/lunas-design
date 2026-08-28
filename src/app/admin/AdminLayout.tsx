import React from 'react';
import { ThemeProvider } from '@/lib/themeContext';
import AdminLayoutContent from '../AdminLayoutContent';

export const AdminLayout: React.FC = () => {
  return (
    <ThemeProvider>
      <AdminLayoutContent />
    </ThemeProvider>
  );
};

