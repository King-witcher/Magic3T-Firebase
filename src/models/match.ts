import { firestore } from '../firestore'
import { getConverter } from '../utils'
import { MatchModel } from '@magic3t/types'

const converter = getConverter<MatchModel>()
const collection = firestore.collection('matches').withConverter(converter)

export const matches = { collection }
