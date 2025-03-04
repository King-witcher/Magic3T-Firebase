import { Timestamp } from 'firebase-admin/firestore'
import { onRequest } from 'firebase-functions/v2/https'
import { models } from '../models'

export const resetRatings = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'POST') return

  const [ratingConfig, usersSnap] = await Promise.all([
    models.ratingConfig.get(),
    models.users.collection.get(),
  ])

  await Promise.all(
    usersSnap.docs.map((user) =>
      models.users.collection.doc(user.id).update({
        glicko: {
          deviation: ratingConfig.max_rd,
          rating: ratingConfig.base_score,
          timestamp: Timestamp.now(),
        },
      })
    )
  )

  res.send({
    status: 'OK',
    message: 'Hard rating reset successful',
  })
})
