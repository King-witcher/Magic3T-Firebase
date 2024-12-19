import { HttpsError, onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { firestore } from './firestore'
import { Timestamp } from 'firebase-admin/firestore'
import { models } from './models'

export { distributeRatings } from './scripts/distribute-ratings'
export { deleteHistory } from './scripts/delete-history'
export { resetRatings } from './scripts/reset-ratings'
import * as functions1 from 'firebase-functions/v1'
export { randomizeRatings } from './scripts/randomize-ratings'

export const beforeCreate = beforeUserCreated(async (event) => {
  if (!event.data) throw new Error('auth event without data')

  const { initialRD, initialRating } = await models.ratingConfig.get()

  await models.users.collection.doc(event.data?.uid).create({
    _id: '',
    identification: null,
    experience: 0,
    magic_points: 0,
    perfect_squares: 0,
    summoner_icon: 29,
    role: 'player',
    glicko: {
      rating: initialRating,
      deviation: initialRD,
      timestamp: Timestamp.now(),
    },
    stats: {
      wins: 0,
      draws: 0,
      defeats: 0,
    },
  })

  logger.info(`${event.data.displayName} has created an account.`)
})

export const logSomething = onRequest({ cors: ['*'] }, async (req, res) => {
  const data = await models.ratingConfig.get()
  res.send(data)
})

export const beforeSignIn = beforeUserSignedIn(async (event) => {
  if (!event.data) throw new Error('auth event without data')
  const snap = await firestore.collection('users').doc(event.data.uid).get()
  const data = snap.data()
  if (!data) throw new HttpsError('internal', 'user data not found')
  return {
    displayName: data.nickname,
  }
})

export const onDeleteUser = functions1.auth.user().onDelete(async (user) => {
  await firestore.collection('users').doc(user.uid).delete()
})
