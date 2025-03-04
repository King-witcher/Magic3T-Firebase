import { firestore } from '../firestore'
import { WithId } from '../types/with-id'
import { getConverter } from '../utils'

export type Choice = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface PlayerData {
  uid: string
  name: string
  rating: number
  rv: number
}

export interface Move {
  player: 'white' | 'black'
  move: Choice | 'forfeit' | 'timeout'
  time: number
}

/** Represents a match registry in the History. */
export interface Match extends WithId {
  white: PlayerData
  black: PlayerData
  moves: Move[]
  winner: 'white' | 'black' | 'none'
  mode: 'casual' | 'ranked'
  timestamp: Date
}

const converter = getConverter<Match>()
const collection = firestore.collection('matches').withConverter(converter)

export const matches = { collection }
