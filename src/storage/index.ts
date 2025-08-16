import { AuthUser, LocalAttendance } from '../types'

export const saveLoggedUser = (user: AuthUser) => {
  localStorage.setItem('loggedUser', JSON.stringify(user))
}

export const getLoggedUser = (): AuthUser | null => {
  const user = localStorage.getItem('loggedUser')
  return user ? JSON.parse(user) : null
}

export const logout = () => {
  localStorage.removeItem('loggedUser')
}

export const getLocalAttendance = (username: string) => {
  const data = localStorage.getItem(`attendance_${username}`)
  return data ? JSON.parse(data) : []
}

export const addLocalAttendance = (username: string, reg: LocalAttendance) => {
  const existing = getLocalAttendance(username)
  existing.push(reg)
  localStorage.setItem(`attendance_${username}`, JSON.stringify(existing))
}

export const getLocalUsers = () => {
  const data = localStorage.getItem('localUsers')
  return data ? JSON.parse(data) : []
}

