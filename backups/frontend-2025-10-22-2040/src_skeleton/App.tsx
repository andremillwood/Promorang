import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useEconomy } from './hooks/useEconomy'
import './App.css'

function App() {
  const { user, loading: authLoading, error: authError, signInWithGoogle } = useAuth()
  const { balance, loading: economyLoading, error: economyError, refresh: refreshBalance } = useEconomy()
  const [activeTab, setActiveTab] = useState<'home' | 'economy'>('home')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Promorang</h1>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700">Welcome, {user.name || user.email}</span>
                  <button
                    onClick={() => window.location.href = '/api/auth/logout'}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  disabled={authLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {authLoading ? 'Signing in...' : 'Sign in with Google'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('home')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'home'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('economy')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'economy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Economy
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to Promorang</h2>
            {authError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">Authentication Error: {authError}</p>
              </div>
            )}
            <p className="text-gray-600">
              This is the Promorang application. Sign in with Google to access your account and view your economy data.
            </p>
          </div>
        )}

        {activeTab === 'economy' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Your Economy</h2>
              <button
                onClick={refreshBalance}
                disabled={economyLoading}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                {economyLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {economyError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">Error: {economyError}</p>
              </div>
            )}

            {balance ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{balance.points}</div>
                  <div className="text-sm text-blue-600">Points</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{balance.keys}</div>
                  <div className="text-sm text-green-600">Keys</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{balance.gems}</div>
                  <div className="text-sm text-purple-600">Gems</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{balance.gold}</div>
                  <div className="text-sm text-yellow-600">Gold</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Sign in to view your economy data.</p>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Promorang - Built with React & TypeScript
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
