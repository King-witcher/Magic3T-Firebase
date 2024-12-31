import { firestore } from '../firestore'
import { getConverter } from '../utils'

export interface RatingConfig {
  /** How much time a player with RD=40 would take to go back to 350, in days. */
  rd_inflation_time: number

  /** The base rating in the game, which is assigned to every player at the beginning. */
  base_score: number

  /** The max RD a player can reach, which is also the initial RD for every player. */
  max_rd: number

  /** The min RD a player can reach. */
  min_rd: number

  /** The max rd a player can have to have their ranking revealed. */
  rd_threshold: number

  /** The legth of each league in score points. */
  league_length: number

  /** The league where a player would be with the base score. This number can be fractionary. */
  base_league: number
}

const converter = getConverter<RatingConfig>()

async function get(): Promise<RatingConfig> {
  const snap = await firestore
    .collection('config')
    .withConverter(converter)
    .doc('rating')
    .get()

  const data = snap.data()
  if (!data) throw new Error('No rating config found')

  return data
}

export const ratingConfig = { get }
