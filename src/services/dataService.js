import { api } from './api'
import { auth } from './auth'

const STORAGE_KEYS = {
  disciplines: 'thegoodlife_disciplines',
  ratings: 'thegoodlife_ratings',
  reflections: 'thegoodlife_reflections',
  events: 'thegoodlife_events',
  fasting: 'thegoodlife_fasting',
  partners: 'thegoodlife_partners',
  customDisciplines: 'thegoodlife_custom_disc',
  settings: 'thegoodlife_settings',
  syncQueue: 'thegoodlife_syncQueue',
}

class DataService {
  constructor() {
    this.syncQueue = this.loadSyncQueue()
  }

  isOnline() {
    return navigator.onLine
  }

  isAuthenticated() {
    return auth.isAuthenticated()
  }

  shouldUseAPI() {
    return this.isAuthenticated() && this.isOnline()
  }

  loadSyncQueue() {
    const queue = localStorage.getItem(STORAGE_KEYS.syncQueue)
    return queue ? JSON.parse(queue) : []
  }

  saveSyncQueue() {
    localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify(this.syncQueue))
  }

  addToSyncQueue(operation) {
    this.syncQueue.push({
      ...operation,
      timestamp: Date.now(),
    })
    this.saveSyncQueue()
  }

  async processSyncQueue() {
    if (!this.shouldUseAPI() || this.syncQueue.length === 0) return

    const queue = [...this.syncQueue]
    this.syncQueue = []
    this.saveSyncQueue()

    for (const operation of queue) {
      try {
        await this.executeOperation(operation)
      } catch (error) {
        console.error('Sync queue operation failed:', operation, error)
        this.syncQueue.push(operation)
      }
    }

    this.saveSyncQueue()
  }

  async executeOperation(operation) {
    const { type, endpoint, data } = operation

    switch (type) {
      case 'POST':
        return await api.post(endpoint, data)
      case 'PUT':
        return await api.put(endpoint, data)
      case 'DELETE':
        return await api.delete(endpoint)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  // Disciplines
  async getDisciplines(date) {
    if (this.shouldUseAPI()) {
      try {
        const response = await api.get(`/api/v1/investments/today?date=${date}`)
        return response
      } catch (error) {
        console.error('API failed, falling back to localStorage:', error)
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.disciplines)
    return data ? JSON.parse(data) : {}
  }

  async saveDisciplines(disciplines) {
    localStorage.setItem(STORAGE_KEYS.disciplines, JSON.stringify(disciplines))

    if (this.shouldUseAPI()) {
      try {
        await this.processSyncQueue()
      } catch (error) {
        console.error('Sync failed:', error)
      }
    }
  }

  async toggleDiscipline(date, disciplineId, completed) {
    if (this.shouldUseAPI()) {
      try {
        await api.post('/api/v1/investments/', {
          date,
          discipline_id: disciplineId,
          completed,
        })
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: 'POST',
          endpoint: '/api/v1/investments/',
          data: { date, discipline_id: disciplineId, completed },
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  // Ratings
  async getRatings(date) {
    if (this.shouldUseAPI()) {
      try {
        const response = await api.get(`/api/v1/ratings/${date}`)
        return response
      } catch (error) {
        console.error('API failed, falling back to localStorage:', error)
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.ratings)
    return data ? JSON.parse(data) : {}
  }

  async saveRatings(date, ratings) {
    if (this.shouldUseAPI()) {
      try {
        await api.put(`/api/v1/ratings/${date}`, { ratings })
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: 'PUT',
          endpoint: `/api/v1/ratings/${date}`,
          data: { ratings },
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  // Reflections
  async getReflections(date) {
    if (this.shouldUseAPI()) {
      try {
        const response = await api.get(`/api/v1/reflections/${date}`)
        return response
      } catch (error) {
        console.error('API failed, falling back to localStorage:', error)
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.reflections)
    return data ? JSON.parse(data) : {}
  }

  async saveReflections(date, reflections) {
    if (this.shouldUseAPI()) {
      try {
        await api.put(`/api/v1/reflections/${date}`, { reflections })
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: 'PUT',
          endpoint: `/api/v1/reflections/${date}`,
          data: { reflections },
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  // Events
  async getEvents() {
    if (this.shouldUseAPI()) {
      try {
        const response = await api.get('/api/v1/events/')
        return response
      } catch (error) {
        console.error('API failed, falling back to localStorage:', error)
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.events)
    return data ? JSON.parse(data) : []
  }

  async saveEvent(event) {
    if (this.shouldUseAPI()) {
      try {
        if (event.id && !event.id.startsWith('temp-')) {
          await api.put(`/api/v1/events/${event.id}`, event)
        } else {
          await api.post('/api/v1/events/', event)
        }
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: event.id ? 'PUT' : 'POST',
          endpoint: event.id ? `/api/v1/events/${event.id}` : '/api/v1/events/',
          data: event,
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  async deleteEvent(eventId) {
    if (this.shouldUseAPI()) {
      try {
        await api.delete(`/api/v1/events/${eventId}`)
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: 'DELETE',
          endpoint: `/api/v1/events/${eventId}`,
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  // Fasting
  async getFasting() {
    if (this.shouldUseAPI()) {
      try {
        const response = await api.get('/api/v1/fasting/')
        return response
      } catch (error) {
        console.error('API failed, falling back to localStorage:', error)
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.fasting)
    return data ? JSON.parse(data) : []
  }

  async saveFasting(record) {
    if (this.shouldUseAPI()) {
      try {
        if (record.id && !record.id.startsWith('temp-')) {
          await api.put(`/api/v1/fasting/${record.id}`, record)
        } else {
          await api.post('/api/v1/fasting/', record)
        }
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: record.id ? 'PUT' : 'POST',
          endpoint: record.id ? `/api/v1/fasting/${record.id}` : '/api/v1/fasting/',
          data: record,
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  // Partners - Real API Implementation
  async searchUsers(query) {
    if (!this.shouldUseAPI()) {
      throw new Error('Partner search requires authentication')
    }
    return await api.get(`/api/v1/partners/search?q=${encodeURIComponent(query)}`)
  }

  async sendPartnerRequest(partnerUserId, message = null) {
    if (!this.shouldUseAPI()) {
      throw new Error('Partner requests require authentication')
    }
    return await api.post('/api/v1/partners/request', {
      partner_user_id: partnerUserId,
      message
    })
  }

  async getPendingRequests() {
    if (!this.shouldUseAPI()) {
      return { incoming: [], outgoing: [] }
    }
    try {
      const [incoming, outgoing] = await Promise.all([
        api.get('/api/v1/partners/requests/incoming'),
        api.get('/api/v1/partners/requests/outgoing')
      ])
      return { incoming, outgoing }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
      return { incoming: [], outgoing: [] }
    }
  }

  async respondToRequest(requestId, action) {
    if (!this.shouldUseAPI()) {
      throw new Error('Responding to requests requires authentication')
    }
    return await api.put(`/api/v1/partners/requests/${requestId}/respond?action=${action}`)
  }

  async getPartners() {
    if (this.shouldUseAPI()) {
      try {
        return await api.get('/api/v1/partners/')
      } catch (error) {
        console.error('API failed, falling back to localStorage:', error)
      }
    }

    // Fallback to localStorage for guest mode
    const data = localStorage.getItem(STORAGE_KEYS.partners)
    return data ? JSON.parse(data) : []
  }

  async getPartnerSummary(partnerId) {
    if (!this.shouldUseAPI()) {
      throw new Error('Partner summaries require authentication')
    }
    return await api.get(`/api/v1/partners/${partnerId}/summary`)
  }

  async removePartner(partnershipId) {
    if (!this.shouldUseAPI()) {
      throw new Error('Removing partners requires authentication')
    }
    return await api.delete(`/api/v1/partners/${partnershipId}`)
  }

  // Custom Disciplines
  async getCustomDisciplines() {
    if (this.shouldUseAPI()) {
      try {
        const response = await api.get('/api/v1/disciplines/')
        return response.custom || []
      } catch (error) {
        console.error('API failed, falling back to localStorage:', error)
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.customDisciplines)
    return data ? JSON.parse(data) : []
  }

  async saveCustomDiscipline(discipline) {
    if (this.shouldUseAPI()) {
      try {
        await api.post('/api/v1/disciplines/custom', discipline)
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: 'POST',
          endpoint: '/api/v1/disciplines/custom',
          data: discipline,
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  async deleteCustomDiscipline(disciplineId) {
    if (this.shouldUseAPI()) {
      try {
        await api.delete(`/api/v1/disciplines/custom/${disciplineId}`)
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: 'DELETE',
          endpoint: `/api/v1/disciplines/custom/${disciplineId}`,
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  // Settings
  async getSettings() {
    if (this.shouldUseAPI()) {
      try {
        const response = await api.get('/api/v1/users/me')
        return response.settings || {}
      } catch (error) {
        console.error('API failed, falling back to localStorage:', error)
      }
    }

    const data = localStorage.getItem(STORAGE_KEYS.settings)
    return data ? JSON.parse(data) : {}
  }

  async saveSettings(settings) {
    if (this.shouldUseAPI()) {
      try {
        await api.put('/api/v1/users/me', { settings })
        return 'synced'
      } catch (error) {
        this.addToSyncQueue({
          type: 'PUT',
          endpoint: '/api/v1/users/me',
          data: { settings },
        })
        return 'pending'
      }
    }

    return 'offline'
  }

  getSyncStatus() {
    if (!this.isAuthenticated()) return 'offline'
    if (!this.isOnline()) return 'offline'
    if (this.syncQueue.length > 0) return 'pending'
    return 'synced'
  }
}

export const dataService = new DataService()

// Auto-sync queue when coming online
window.addEventListener('online', () => {
  dataService.processSyncQueue()
})
