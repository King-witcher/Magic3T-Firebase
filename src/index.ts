import { HttpsError, onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { firestore } from './firestore'
import * as functions from 'firebase-functions'
import { Timestamp } from 'firebase-admin/firestore'
import { models } from './models'

export { distributeRatings } from './scripts/distributerRatings'
export { deleteHistory } from './scripts/deleteHistory'
export { resetRatings } from './scripts/resetRatings'
export { randomizeRatings } from './scripts/randomizeRatings'

export const beforeCreate = beforeUserCreated(async (event) => {
  const { initialRD, initialRating } = await models.ratingConfig.get()

  await models.users.collection.doc(event.data.uid).create({
    _id: '',
    nickname:
      event.data.displayName || event.data.email?.split('@')[0] || 'Unnamed',
    photoURL: event.data.photoURL || '',
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
  const snap = await firestore.collection('users').doc(event.data.uid).get()
  const data = snap.data()
  if (!data) throw new HttpsError('internal', 'user data not found')
  return {
    displayName: data.nickname,
  }
})

export const onDeleteUser = functions.auth.user().onDelete(async (user) => {
  await firestore.collection('users').doc(user.uid).delete()
})
