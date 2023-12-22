/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { HttpsError, onRequest } from 'firebase-functions/v2/https'
import * as logger from 'firebase-functions/logger'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { firestore } from './firestore'
import * as functions from 'firebase-functions'
import { userConverter, usersCollection } from './models/User'
import { Timestamp } from 'firebase-admin/firestore'
import { getUserPhotos } from './scripts/getUserPhotos'

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const beforeCreate = beforeUserCreated(async (event) => {
  await firestore
    .collection('users')
    .withConverter(userConverter)
    .doc(event.data.uid)
    .create({
      nickname: event.data.displayName || '',
      photoURL: event.data.photoURL || '',
      role: 'player',
      glicko: {
        rating: 1500,
        deviation: 200,
        timestamp: Timestamp.now(),
      },
    })
  logger.info(`${event.data.displayName} has created an account.`)
})

export const resetRatings = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'POST') return

  const snap = await usersCollection.get()
  await Promise.all(
    snap.docs.map((user) =>
      usersCollection.doc(user.id).update({
        glicko: {
          deviation: 200,
          rating: 1500,
          timestamp: Timestamp.now(),
        },
      }),
    ),
  )

  await usersCollection.doc('botlmm4').update({
    glicko: {
      deviation: 0,
      rating: 1500,
      timestamp: Timestamp.now(),
    },
  })

  res.send({
    status: 'OK',
    message: 'Hard rating reset successful',
  })
})

export const deleteHistory = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'DELETE') return

  const snap = await firestore.collection('matches').get()
  await Promise.all(
    snap.docs.map((doc) =>
      firestore.collection('matches').doc(doc.id).delete(),
    ),
  )

  res.send({
    status: 'OK',
    message: 'All matches were deleted',
  })
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
