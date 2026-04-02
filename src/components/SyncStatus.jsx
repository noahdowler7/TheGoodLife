import { useEffect, useState } from 'react'
import { dataService } from '../services/dataService'

export default function SyncStatus() {
  const [status, setStatus] = useState(dataService.getSyncStatus())

  useEffect(() => {
    const refresh = () => setStatus(dataService.getSyncStatus())
    const handleOffline = () => setStatus('offline')

    window.addEventListener('online', refresh)
    window.addEventListener('offline', handleOffline)

    // Listen for sync state changes from dataService
    const onSync = () => setTimeout(refresh, 500)
    window.addEventListener('thegoodlife:sync', onSync)

    return () => {
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('thegoodlife:sync', onSync)
    }
  }, [])

  if (status === 'synced') return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
        status === 'offline'
          ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          : status === 'error'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      }`}>
        {status === 'offline' ? (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
            Offline
          </>
        ) : status === 'error' ? (
          <>
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Sync failed
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            Syncing...
          </>
        )}
      </div>
    </div>
  )
}
