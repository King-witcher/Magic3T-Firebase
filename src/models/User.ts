import { Timestamp } from 'firebase-admin/firestore'
import { getConverter } from '../getConverter'
import { firestore } from '../firestore'

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
  photoUrl: string
  role: 'player' | 'admin'
}
