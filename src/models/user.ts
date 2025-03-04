import { Timestamp } from 'firebase-admin/firestore'
import { firestore } from '../firestore'
import { getConverter } from '../utils'
import { WithId } from '../types/with-id'

const userConverter = getConverter<UserData>()

const collection = firestore.collection('users').withConverter(userConverter)

export interface UserData extends WithId {
  identification: {
    unique_id: string
    nickname: string
    last_changed: Date
  } | null

  experience: number
  magic_points: number // bought with money
  perfect_squares: number // earned playing
  summoner_icon: number

  role: 'player' | 'creator' | 'bot'

  glicko: {
    rating: number
    deviation: number
    timestamp: Timestamp
  }

  stats: {
    wins: number
    draws: number
    defeats: number
  }
}

export const users = { collection }
