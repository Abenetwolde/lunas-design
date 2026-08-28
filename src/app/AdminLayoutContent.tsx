import { ThemeProvider } from '@/lib/themeContext';

// Placeholder for admin content - in a real app this would contain the actual admin pages
// For now, we just render a minimal container that demonstrates the theme context is available

function AdminLayoutContent() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Theme customization and product management</p>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
          <p>Manage brand colors, fonts, and overall appearance.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <p>View and manage product listings, variants, and inventory.</p>
        </section>
      </main>
    </div>
  );
}

export default AdminLayoutContent;