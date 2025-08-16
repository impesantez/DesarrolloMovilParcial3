import { ApiUser, ApiAttendance } from '../types'
import { CapacitorHttp, HttpResponse } from '@capacitor/core'
import { Capacitor } from '@capacitor/core'

const getApiBaseUrl = () => {
  if (Capacitor.isNativePlatform()) {
    console.log('nativo')
    return 'https://puce.estudioika.com/api'
  }
  if (import.meta.env.DEV) {
    console.log('dev')
    return '/api'
  }
  console.log('prod')
  return 'https://puce.estudioika.com/api'
}

const makeRequest = async (url: string, options: { method?: string; body?: any } = {}): Promise<any> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const requestOptions: any = {
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }

      if (options.method === 'POST' && options.body) {
        requestOptions.data = options.body
        const response: HttpResponse = await CapacitorHttp.post(requestOptions)
        
        if (response.status >= 200 && response.status < 300) {
          return response.data
        } else {
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`)
        }
      } else {
        const response: HttpResponse = await CapacitorHttp.get(requestOptions)
        
        if (response.status >= 200 && response.status < 300) {
          return response.data
        } else {
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`)
        }
      }
    } else {
      // Use fetch for web
      const fetchOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }

      if (options.method === 'POST' && options.body) {
        fetchOptions.method = 'POST'
        fetchOptions.body = JSON.stringify(options.body)
      }

      const res = await fetch(url, fetchOptions)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      return res.json()
    }
  } catch (error) {
    console.error('API request failed:', { url, options, error })
    throw error
  }
}

export const fetchUsers = async (): Promise<ApiUser[]> => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/examen.php`
  console.log('Fetching users from:', url)
  return makeRequest(url)
}

export const fetchAttendanceByRecord = async (record: string | number): Promise<ApiAttendance[]> => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/examen.php?record=${record}`
  console.log('Fetching attendance from:', url)
  return makeRequest(url)
}

export const postAttendance = async (data: { record_user: number; join_user: string }): Promise<any> => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/examen.php`
  console.log('Posting attendance to:', url)
  console.log('Platform:', Capacitor.isNativePlatform() ? 'Native' : 'Web')
  console.log('Request data:', data)
  
  try {
    const result = await makeRequest(url, { method: 'POST', body: data })
    console.log('Resultado:', result)
    return result
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
