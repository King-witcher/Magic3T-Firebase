import { Timestamp } from 'firebase-admin/firestore'
import { firestore } from '../firestore'
import { getConverter } from '../utils'

export const userConverter = getConverter<UserData>()

export const usersCollection = firestore
  .collection('users')
  .withConverter(userConverter)

export type UserData = {
  nickname: string
  glicko: {
    rating: number
    deviation: number
    timestamp: Timestamp
  }
  photoURL: string
  role: 'player' | 'admin'
}
