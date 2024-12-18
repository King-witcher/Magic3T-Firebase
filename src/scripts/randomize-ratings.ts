import { Timestamp } from 'firebase-admin/firestore'
import { onRequest } from 'firebase-functions/v2/https'
import { models } from '../models'

export const randomizeRatings = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'POST') return

  const [usersSnap, config] = await Promise.all([
    models.users.collection.get(),
    models.ratingConfig.get(),
  ])

  const bronze1 =
    config.initialRating - config.ranks.tierSize * config.ranks.initialTier

  await Promise.all(
    usersSnap.docs.map(
      (user) =>
        user.id !== 'botlmm1' &&
        models.users.collection.doc(user.id).update({
          glicko: {
            deviation: config.maxReliableDeviation - 1,
            rating: bronze1 + Math.random() * 5 * config.ranks.tierSize,
            timestamp: Timestamp.now(),
          },
        }),
    ),
  )

  res.send({
    status: 'OK',
    message: 'Rating randomizing successful',
  })
})
