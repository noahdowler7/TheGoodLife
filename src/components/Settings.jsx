import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import PageWrapper from './PageWrapper'
import { CAPITALS, CAPITAL_ORDER } from '../utils/capitals'
import { compressImage } from '../utils/imageUtils'
import { STORAGE_KEYS } from '../hooks/useStorage'
import MovementLogo from './MovementLogo'
import { dataService } from '../services/dataService'

function Settings({ settings, setSettings, partners, setPartners, customDisciplines, setCustomDisciplines, isGuest, isAuthenticated, onSignIn, onSignOut }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [newPartnerName, setNewPartnerName] = useState('')
  const [newDiscipline, setNewDiscipline] = useState({ label: '', capitalId: 'spiritual' })

  // Partner search & requests state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] })
  const [acceptedPartners, setAcceptedPartners] = useState([])
  const [toast, setToast] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const debounceRef = useRef(null)

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const capitalToggles = settings?.capitals || {}

  const handleProfilePicture = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const compressed = await compressImage(file, { maxSize: 200, quality: 0.8 })
      setSettings(prev => ({ ...prev, profilePicture: compressed }))
    } catch {
      const reader = new FileReader()
      reader.onloadend = () => setSettings(prev => ({ ...prev, profilePicture: reader.result }))
      reader.readAsDataURL(file)
    }
  }

  const handleToggleCapital = (capitalId) => {
    setSettings(prev => ({
      ...prev,
      capitals: {
        ...prev.capitals,
        [capitalId]: !prev.capitals?.[capitalId],
      },
    }))
  }

  const handleThemeToggle = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }))
  }

  const handleAddPartner = () => {
    if (!newPartnerName.trim()) return
    const colors = ['#D4A843', '#E07B6A', '#5BB98B', '#6B8DE3', '#B07EE0']
    setPartners(prev => [...prev, {
      id: uuidv4(),
      name: newPartnerName.trim(),
      color: colors[prev.length % colors.length],
      createdAt: new Date().toISOString(),
    }])
    setNewPartnerName('')
  }

  const handleRemovePartner = (id) => {
    setPartners(prev => prev.filter(p => p.id !== id))
  }

  // Partner API handlers
  useEffect(() => {
    if (!isGuest) {
      loadPartnerData()
    }
  }, [isGuest])

  const loadPartnerData = async () => {
    try {
      const [requests, acceptedList] = await Promise.all([
        dataService.getPendingRequests(),
        dataService.getPartners()
      ])
      setPendingRequests(requests)
      setAcceptedPartners(acceptedList)
    } catch (error) {
      console.error('Failed to load partner data:', error)
    }
  }

  const handleSearchPartners = (query) => {
    setSearchQuery(query)
    if (query.length < 3) {
      setSearchResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await dataService.searchUsers(query)
        setSearchResults(results)
      } catch (error) {
        console.error('Search failed:', error)
        showToast('Search failed. Please try again.')
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  const handleSendRequest = async (userId) => {
    try {
      await dataService.sendPartnerRequest(userId)
      setSearchQuery('')
      setSearchResults([])
      await loadPartnerData()
    } catch (error) {
      console.error('Failed to send request:', error)
      showToast(error.message || 'Failed to send partnership request')
    }
  }

  const handleRespondToRequest = async (requestId, action) => {
    try {
      await dataService.respondToRequest(requestId, action)
      await loadPartnerData()
    } catch (error) {
      console.error(`Failed to ${action} request:`, error)
      showToast(error.message || `Failed to ${action} partnership request`)
    }
  }

  const handleRemovePartnership = async (partnershipId) => {
    setConfirmAction({
      message: 'Remove this accountability partnership?',
      onConfirm: async () => {
        setConfirmAction(null)
        try {
          await dataService.removePartner(partnershipId)
          await loadPartnerData()
        } catch (error) {
          console.error('Failed to remove partner:', error)
          showToast(error.message || 'Failed to remove partnership')
        }
      },
    })
  }

  const handleViewPartnerSummary = (partnerId) => {
    navigate(`/partners/${partnerId}`)
  }

  const handleAddCustomDiscipline = () => {
    if (!newDiscipline.label.trim()) return
    setCustomDisciplines(prev => [...prev, {
      id: `custom-${uuidv4().slice(0, 8)}`,
      label: newDiscipline.label.trim(),
      capitalId: newDiscipline.capitalId,
    }])
    setNewDiscipline({ label: '', capitalId: 'spiritual' })
  }

  const handleRemoveCustomDiscipline = (id) => {
    setCustomDisciplines(prev => prev.filter(d => d.id !== id))
  }

  const handleExportData = () => {
    const data = {}
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key)
      if (item) data[key] = JSON.parse(item)
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thegoodlife-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value))
        })
        window.location.reload()
      } catch {
        showToast('Invalid backup file')
      }
    }
    reader.readAsText(file)
  }

  const handleImportWithConfirm = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setConfirmAction({
      message: 'This will overwrite your current data with the backup. Continue?',
      onConfirm: () => {
        setConfirmAction(null)
        handleImportData({ target: { files: [file] } })
      },
    })
  }

  const handleResetData = () => {
    setConfirmAction({
      message: 'This will delete ALL your data. This cannot be undone.',
      onConfirm: () => {
        setConfirmAction(null)
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
        window.location.reload()
      },
    })
  }

  return (
    <PageWrapper className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.03em' }}>Settings</h1>
      </header>

      <div className="space-y-2">
        {/* Sign In (Guest Users Only) */}
        {isGuest && (
          <>
            <p className="list-header">ACCOUNT</p>
            <div className="card-inset">
              <div className="px-4 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      Sign In to Sync Your Data
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                      Your data is currently stored only on this device. Sign in to sync across devices and keep your progress safe in the cloud.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onSignIn}
                  className="w-full py-3 rounded-xl font-medium text-[15px]"
                  style={{ background: 'var(--accent)', color: '#0A0A0A' }}
                >
                  Sign In Now
                </button>
              </div>
            </div>
          </>
        )}

        {/* Sign Out (Authenticated Users) */}
        {isAuthenticated && (
          <>
            <p className="list-header">ACCOUNT</p>
            <div className="card-inset">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>Signed In</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Data syncing to cloud</p>
                </div>
                <button
                  onClick={onSignOut}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Profile */}
        <p className="list-header">PROFILE</p>
        <div className="card-inset">
          <div className="list-row">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePicture} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: settings?.profilePicture ? 'transparent' : 'var(--bg-tertiary)', border: '2px solid var(--border)' }}
            >
              {settings?.profilePicture ? (
                <img src={settings.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {settings?.currentUser?.name || 'Add your name'}
              </p>
              <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Tap photo to change</p>
            </div>
          </div>
        </div>

        {/* Capitals */}
        <p className="list-header">FIVE CAPITALS</p>
        <div className="card-inset">
          {CAPITAL_ORDER.map((capitalId, i) => {
            const capital = CAPITALS[capitalId]
            const enabled = capitalToggles[capitalId] !== false
            return (
              <div key={capitalId} className="list-row" style={{ borderTop: i > 0 ? '1px solid var(--separator)' : 'none' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: capital.color }} />
                <span className="body flex-1">{capital.name}</span>
                <button
                  onClick={() => handleToggleCapital(capitalId)}
                  className={`toggle ${enabled ? 'active' : ''}`}
                  style={enabled ? { background: capital.color } : {}}
                >
                  <div className="toggle-knob" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Custom Disciplines */}
        <p className="list-header">CUSTOM DISCIPLINES</p>
        <div className="card-inset">
          {customDisciplines.map((d, i) => {
            const capital = CAPITALS[d.capitalId]
            return (
              <div key={d.id} className="list-row" style={{ borderTop: i > 0 ? '1px solid var(--separator)' : 'none' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: capital?.color || 'var(--text-muted)' }} />
                <span className="body flex-1">{d.label}</span>
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{capital?.name}</span>
                <button onClick={() => handleRemoveCustomDiscipline(d.id)} style={{ color: 'var(--danger)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )
          })}
          <div className="px-4 py-3 flex gap-2">
            <input
              type="text"
              value={newDiscipline.label}
              onChange={(e) => setNewDiscipline(prev => ({ ...prev, label: e.target.value }))}
              placeholder="New discipline name"
              className="flex-1 px-3 py-2 rounded-xl text-[14px] outline-none"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            <select
              value={newDiscipline.capitalId}
              onChange={(e) => setNewDiscipline(prev => ({ ...prev, capitalId: e.target.value }))}
              className="px-2 py-2 rounded-xl text-[13px]"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
            >
              {CAPITAL_ORDER.map(id => (
                <option key={id} value={id}>{CAPITALS[id].name}</option>
              ))}
            </select>
            <button
              onClick={handleAddCustomDiscipline}
              disabled={!newDiscipline.label.trim()}
              className="px-3 py-2 rounded-xl text-[14px] font-medium"
              style={{ background: 'var(--accent)', color: '#0A0A0A', opacity: newDiscipline.label.trim() ? 1 : 0.5 }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Display */}
        <p className="list-header">DISPLAY</p>
        <div className="card-inset">
          <div className="list-row">
            <span className="body flex-1">Dark Mode</span>
            <button
              onClick={handleThemeToggle}
              className={`toggle ${settings?.theme === 'dark' ? 'active' : ''}`}
            >
              <div className="toggle-knob" />
            </button>
          </div>
        </div>

        {/* Accountability Partners */}
        <p className="list-header">ACCOUNTABILITY PARTNERS</p>

        {isGuest ? (
          /* Guest mode - simple list */
          <div className="card-inset">
            {partners.map((partner, i) => (
              <div key={partner.id} className="list-row" style={{ borderTop: i > 0 ? '1px solid var(--separator)' : 'none' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-semibold" style={{ background: partner.color }}>
                  {partner.name.charAt(0)}
                </div>
                <span className="body flex-1">{partner.name}</span>
                <button onClick={() => handleRemovePartner(partner.id)} style={{ color: 'var(--danger)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="px-4 py-3 flex gap-2">
              <input
                type="text"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                placeholder="Partner name"
                className="flex-1 px-3 py-2 rounded-xl text-[14px] outline-none"
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPartner()}
              />
              <button
                onClick={handleAddPartner}
                disabled={!newPartnerName.trim()}
                className="px-3 py-2 rounded-xl text-[14px] font-medium"
                style={{ background: 'var(--accent)', color: '#0A0A0A', opacity: newPartnerName.trim() ? 1 : 0.5 }}
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          /* Authenticated mode - real partner system */
          <>
            {/* Search & Request */}
            <div className="card-inset">
              <div className="px-4 py-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchPartners(e.target.value)}
                  placeholder="Search by email or name (min 3 chars)"
                  className="w-full px-3 py-2 rounded-xl text-[14px] outline-none"
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
                {isSearching && (
                  <p className="text-[12px] mt-2" style={{ color: 'var(--text-tertiary)' }}>Searching...</p>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {searchResults.map(user => (
                      <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                        {user.profile_photo_url ? (
                          <img src={user.profile_photo_url} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-semibold" style={{ background: '#6B8DE3' }}>
                            {(user.display_name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {user.display_name || user.email}
                          </p>
                          <p className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendRequest(user.id)}
                          className="px-3 py-1 rounded-lg text-[12px] font-medium"
                          style={{ background: 'var(--accent)', color: '#0A0A0A' }}
                        >
                          Request
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending Requests (incoming) */}
            {pendingRequests.incoming.length > 0 && (
              <>
                <p className="list-header mt-4">PENDING REQUESTS</p>
                <div className="card-inset">
                  {pendingRequests.incoming.map((request, i) => (
                    <div key={request.id} className="px-4 py-3" style={{ borderTop: i > 0 ? '1px solid var(--separator)' : 'none' }}>
                      <div className="flex items-center gap-3 mb-2">
                        {request.partner_photo ? (
                          <img src={request.partner_photo} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-semibold" style={{ background: '#E07B6A' }}>
                            {(request.partner_display_name || request.partner_email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                            {request.partner_display_name || request.partner_email}
                          </p>
                          <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                            {request.partner_email}
                          </p>
                        </div>
                      </div>
                      {request.message && (
                        <p className="text-[13px] mb-3 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                          "{request.message}"
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'accept')}
                          className="flex-1 py-2 rounded-xl text-[13px] font-medium"
                          style={{ background: 'var(--accent)', color: '#0A0A0A' }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondToRequest(request.id, 'decline')}
                          className="flex-1 py-2 rounded-xl text-[13px] font-medium"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Accepted Partners */}
            {acceptedPartners.length > 0 && (
              <>
                <p className="list-header mt-4">ACCEPTED PARTNERS</p>
                <div className="card-inset">
                  {acceptedPartners.map((partner, i) => (
                    <button
                      key={partner.id}
                      onClick={() => handleViewPartnerSummary(partner.partner_user_id)}
                      className="list-row w-full text-left cursor-pointer"
                      style={{ borderTop: i > 0 ? '1px solid var(--separator)' : 'none' }}
                    >
                      {partner.partner_photo ? (
                        <img src={partner.partner_photo} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-semibold" style={{ background: partner.color || '#5BB98B' }}>
                          {(partner.partner_display_name || partner.name).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="body flex-1">{partner.partner_display_name || partner.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemovePartnership(partner.id)
                        }}
                        style={{ color: 'var(--danger)' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Data */}
        <p className="list-header">DATA</p>
        <div className="card-inset">
          <button onClick={handleExportData} className="list-row w-full text-left cursor-pointer">
            <svg className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="body flex-1">Export Data</span>
          </button>
          <label className="list-row cursor-pointer" style={{ borderTop: '1px solid var(--separator)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="body flex-1">Import Data</span>
            <input type="file" accept=".json" onChange={handleImportWithConfirm} className="hidden" />
          </label>
          <button onClick={handleResetData} className="list-row w-full text-left cursor-pointer" style={{ borderTop: '1px solid var(--separator)' }}>
            <svg className="w-5 h-5" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="body flex-1" style={{ color: 'var(--danger)' }}>Reset All Data</span>
          </button>
        </div>

        {/* About */}
        <div className="px-5 py-8 flex flex-col items-center">
          <MovementLogo width={140} />
          <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>Version 1.0.0</p>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
          <div
            className="px-4 py-3 rounded-xl text-[13px] font-medium shadow-lg pointer-events-auto"
            style={{
              background: toast.type === 'error' ? '#EF4444' : '#22C55E',
              color: 'white',
            }}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ background: 'var(--bg-secondary)' }}>
            <p className="text-[15px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
              {confirmAction.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-medium"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.onConfirm}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-medium"
                style={{ background: 'var(--danger, #EF4444)', color: 'white' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}

export default Settings
