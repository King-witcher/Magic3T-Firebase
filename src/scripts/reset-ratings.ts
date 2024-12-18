import { onRequest } from 'firebase-functions/v2/https'
import { Timestamp } from 'firebase-admin/firestore'
import { models } from '../models'

export const resetRatings = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'POST') return

  const [ratingConfig, usersSnap] = await Promise.all([
    models.ratingConfig.get(),
    models.users.collection.get(),
  ])

  await Promise.all([
    models.users.collection.doc('botlmm1').update({
      glicko: {
        deviation: 0,
        rating: ratingConfig.initialRating,
        timestamp: Timestamp.now(),
      },
    }),
    ...usersSnap.docs.map(
      (user) =>
        user.id !== 'botlmm1' &&
        models.users.collection.doc(user.id).update({
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
