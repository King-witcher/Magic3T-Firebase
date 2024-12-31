import { Timestamp } from 'firebase-admin/firestore'
import { onRequest } from 'firebase-functions/v2/https'
import { models } from '../models'

export const randomizeRatings = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'POST') return

  const [usersSnap, config] = await Promise.all([
    models.users.collection.get(),
    models.ratingConfig.get(),
  ])

  const bronze4 = config.base_score - config.league_length * config.base_league

  await Promise.all(
    usersSnap.docs.map((user) =>
      models.users.collection.doc(user.id).update({
        glicko: {
          deviation: config.rd_threshold - 1,
          rating: bronze4 + Math.random() * 5 * config.league_length,
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
