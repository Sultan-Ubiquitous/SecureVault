import EncryptSection from '../components/EncryptionSection';
import DecryptSection from '../components/DecryptionSection';
import HealthStatus from '../components/HealthStatus';
import TransactionList from '../components/TransactionList'; // Import new component

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Secure<span className="text-blue-600">Vault</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Secure envelope encryption & storage system
            </p>
          </div>
          <HealthStatus />
        </header>

        {/* Top Row: Encrypt & Decrypt */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <section>
            <EncryptSection />
          </section>
          
          <section>
            <DecryptSection />
          </section>
        </div>

        {/* Bottom Row: Transaction Log */}
        <div className="w-full">
          <TransactionList />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Protected by @repo/crypto • Fastify • Next.js • Prisma</p>
        </footer>
      </div>
    </main>
  );
}