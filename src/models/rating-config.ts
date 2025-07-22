import { RatingConfigModel } from '@magic3t/types'
import { firestore } from '../firestore'
import { getConverter } from '../utils'

const converter = getConverter<RatingConfigModel>()

async function get(): Promise<RatingConfigModel> {
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
