import { onRequest } from 'firebase-functions/v2/https'
import { usersCollection } from '../models/User'
import { Timestamp } from 'firebase-admin/firestore'
import { getRatingConfig } from '../models/RatingConfig'

export const resetRatings = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'POST') return

  const [ratingConfig, usersSnap] = await Promise.all([
    getRatingConfig(),
    usersCollection.get(),
  ])

  await Promise.all([
    usersCollection.doc('botlmm1').update({
      glicko: {
        deviation: 0,
        rating: ratingConfig.initialRating,
        timestamp: Timestamp.now(),
      },
    }),
    ...usersSnap.docs.map(
      (user) =>
        user.id !== 'botlmm1' &&
        usersCollection.doc(user.id).update({
          glicko: {
            deviation: ratingConfig.initialRD,
            rating: ratingConfig.initialRating,
            timestamp: Timestamp.now(),
          },
        }),
    ),
  ])

  res.send({
    status: 'OK',
    message: 'Hard rating reset successful',
  })
})
