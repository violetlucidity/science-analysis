import './index.css'

/**
 * Root application component for Sci Paper Reader.
 */
function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold p-8">{import.meta.env.VITE_APP_TITLE || 'Sci Paper Reader'}</h1>
    </div>
  )
}

export default App
