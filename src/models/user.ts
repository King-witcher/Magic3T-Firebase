import { firestore } from '../firestore'
import { WithId } from '../types/with-id'
import { getConverter } from '../utils'

export const userConverter = getConverter<UserModel>()

const collection = firestore.collection('users').withConverter(userConverter)

export interface EloModel {
  score: number
  matches: number
  k: number
}

export interface GlickoModel {
  rating: number
  deviation: number
  timestamp: Date
}

export interface UserModel extends WithId {
  identification: {
    unique_id: string // nickname.toLower() without spaces
    nickname: string
    last_changed: Date
  } | null

  experience: number
  magic_points: number // bought with money
  perfect_squares: number // earned playing
  summoner_icon: number

  role: UserRole

  elo: EloModel | null
  glicko: GlickoModel | null

  stats: {
    wins: number
    draws: number
    defeats: number
  }
}

export enum UserRole {
  Player = 'player',
  Creator = 'creator',
  Bot = 'bot',
}

export const users = { collection }
