/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { HttpsError } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { firestore } from './firestore'
import * as functions from 'firebase-functions'

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const beforeCreate = beforeUserCreated(async (event) => {
  await firestore
    .collection('users')
    .doc(event.data.uid)
    .create({
      nickname: event.data.displayName,
      role: 'player',
      glicko: {
        rating: 1500,
        deviation: 350,
        timestamp: new Date(),
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
    // sessionClaims: {
    //   displayName: data.nickname,
    // },
  }
})

export const onDeleteUser = functions.auth.user().onDelete(async (user) => {
  await firestore.collection('users').doc(user.uid).delete()
})
