import { HttpsError } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { firestore } from './firestore'
import * as functions from 'firebase-functions'
import { userConverter } from './models/User'
import { Timestamp } from 'firebase-admin/firestore'
import { getRatingConfig } from './models/RatingConfig'

export { distributeRatings } from './scripts/distributerRatings'
export { deleteHistory } from './scripts/deleteHistory'
export { resetRatings } from './scripts/resetRatings'
export { randomizeRatings } from './scripts/randomizeRatings'

export const beforeCreate = beforeUserCreated(async (event) => {
  const { initialRD, initialRating } = await getRatingConfig()

  await firestore
    .collection('users')
    .withConverter(userConverter)
    .doc(event.data.uid)
    .create({
      nickname: event.data.displayName || '',
      photoURL: event.data.photoURL || '',
      role: 'player',
      glicko: {
        rating: initialRating,
        deviation: initialRD,
        timestamp: Timestamp.now(),
      },
    })

  logger.info(`${event.data.displayName} has created an account.`)
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
