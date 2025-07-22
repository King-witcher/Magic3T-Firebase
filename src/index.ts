import { Timestamp } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import { HttpsError } from 'firebase-functions/v2/https'
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from 'firebase-functions/v2/identity'
import { firestore } from './firestore'
import { models } from './models'

export { deleteHistory } from './scripts/delete-history'
export { resetRatings } from './scripts/reset-ratings'
import * as functions1 from 'firebase-functions/v1'
import { userConverter } from './models/user'
import { UserRole } from '@magic3t/types'

// Set the user's display name to their nickname
export const beforeCreate = beforeUserCreated(async (event) => {
  if (!event.data) throw new Error('auth event without data')

  const { max_rd, base_score, initial_k_value } =
    await models.ratingConfig.get()

  await models.users.collection
    .withConverter(userConverter)
    .doc(event.data?.uid)
    .create({
      _id: '',
      identification: null,
      experience: 0,
      magic_points: 0,
      perfect_squares: 0,
      summoner_icon: 29,
      role: UserRole.Player,
      glicko: {
        rating: base_score,
        deviation: max_rd,
        timestamp: Timestamp.now(),
      },
      elo: {
        score: base_score,
        k: initial_k_value,
        matches: 0,
      },
      stats: {
        wins: 0,
        draws: 0,
        defeats: 0,
      },
    })

  logger.info(`${event.data.displayName} has created an account.`)
})

// Set the user's display name to their nickname
export const beforeSignIn = beforeUserSignedIn(async (event) => {
  if (!event.data) throw new Error('auth event without data')
  const snap = await firestore.collection('users').doc(event.data.uid).get()
  const data = snap.data()
  if (!data) throw new HttpsError('internal', 'user data not found')
  return {
    displayName: data.nickname,
  }
})

// Delete user data when a user is deleted
export const onDeleteUser = functions1.auth.user().onDelete(async (user) => {
  // Delete icon_assignments
  const iconAssignments = await firestore
    .collection('users')
    .doc(user.uid)
    .collection('icon_assignments')
    .get()

  const batch = firestore.batch()
  for (const doc of iconAssignments.docs) {
    batch.delete(doc.ref)
  }
  await batch.commit()

  // Delete the user
  await firestore.collection('users').doc(user.uid).delete()
})
