import { Timestamp, UpdateData } from 'firebase-admin/firestore'
import { onRequest } from 'firebase-functions/v2/https'
import { models } from '../models'
import { UserModel } from '@magic3t/types'

export const resetRatings = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'POST') return

  const [ratingConfig, usersSnap] = await Promise.all([
    models.ratingConfig.get(),
    models.users.collection.get(),
  ])

  await Promise.all(
    usersSnap.docs.map((user) => {
      const updateData: UpdateData<UserModel> = {
        glicko: {
          deviation: ratingConfig.max_rd,
          rating: ratingConfig.base_score,
          timestamp: Timestamp.now(),
        },
        elo: {
          score: ratingConfig.base_score,
          matches: 0,
          k: ratingConfig.initial_k_value,
        },
      }
      return models.users.collection.doc(user.id).update(updateData)
    })
  )

  res.send({
    status: 'OK',
    message: 'Hard rating reset successful',
  })
})
