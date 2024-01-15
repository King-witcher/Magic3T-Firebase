import { Timestamp } from 'firebase-admin/firestore'
import { firestore } from '../firestore'
import { getConverter } from '../utils'
import { WithId } from '../types/WithId'

const userConverter = getConverter<UserData>()

const collection = firestore.collection('users').withConverter(userConverter)

export interface UserData extends WithId {
  nickname: string
  glicko: {
    rating: number
    deviation: number
    timestamp: Timestamp
  }
  photoURL: string
  role: 'player' | 'creator' | 'bot'
  stats: {
    wins: number
    draws: number
    defeats: number
  }
}

export const users = { collection }
