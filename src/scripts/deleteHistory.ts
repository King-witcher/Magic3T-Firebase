import { onRequest } from 'firebase-functions/v2/https'
import { models } from '../models'
import { UserData } from '../models/User'

export const deleteHistory = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'DELETE') return

  const stats: UserData['stats'] = {
    defeats: 0,
    draws: 0,
    wins: 0,
  }

  const matchesPromise = models.matches.collection
    .get()
    .then(async (matchesSnap) => {
      await Promise.all(
        matchesSnap.docs.map((doc) =>
          models.matches.collection.doc(doc.id).delete(),
        ),
      )
    })

  const usersPromise = models.users.collection.get().then(async (usersSnap) => {
    await Promise.all(
      usersSnap.docs.map((doc) =>
        models.users.collection.doc(doc.id).update({
          stats,
        }),
      ),
    )
  })

  await Promise.all([matchesPromise, usersPromise])

  res.send({
    status: 'OK',
    message: 'All matches were deleted',
  })
})
