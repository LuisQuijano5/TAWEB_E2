import TransactionForm from './components/TransactionForm';
import MineButton from './components/MineButton';
import PeerList from './components/PeerList';
import ChainViewer from './components/ChainViewer';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Panel de Control Blockchain</h1>
          <p className="text-gray-600">Simulador de Red Distribuida de Grados Académicos</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Actions */}
          <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
            <PeerList />
            <TransactionForm />
            <MineButton />
          </div>

          {/* Right Column: The Ledger */}
          <div className="col-span-1 lg:col-span-2">
            <ChainViewer />
          </div>
        </div>

      </div>
    </div>
  );
}