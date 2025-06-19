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

export enum League {
  Provisional = 'provisional',
  Bronze = 'bronze',
  Silver = 'silver',
  Gold = 'gold',
  Diamond = 'diamond',
  Master = 'master',
  Challenger = 'challenger',
}

export interface MatchModelTeam {
  uid: string
  name: string
  league: League
  division: number | null
  score: number
  lp_gain: number
}

export enum GameMode {
  Casual = 0b00,
  Ranked = 0b10,
  PvP = 0b00,
  PvC = 0b01,
}

export enum MatchEventType {
  Choice = 0,
  Forfeit = 1,
  Timeout = 2,
  Message = 3,
}

export enum Team {
  Order = 0,
  Chaos = 1,
}

type BaseMatchEvent = {
  event: MatchEventType
  side: Team
  time: number
}

export type MatchModelEvent = BaseMatchEvent &
  (
    | {
        event: MatchEventType.Choice
        choice: Choice
      }
    | {
        event: MatchEventType.Message
        message: string
      }
    | {
        event: MatchEventType.Timeout | MatchEventType.Forfeit
      }
  )

/** Represents a match registry in the History. */
export interface MatchModel extends WithId {
  [Team.Order]: MatchModelTeam // TODO: put inside a teams object
  [Team.Chaos]: MatchModelTeam
  events: MatchModelEvent[]
  winner: Team | null
  game_mode: GameMode
  timestamp: Date
}

const converter = getConverter<MatchModel>()
const collection = firestore.collection('matches').withConverter(converter)

export const matches = { collection }
