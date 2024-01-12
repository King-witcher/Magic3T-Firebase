import { onRequest } from 'firebase-functions/v2/https'
import { getRatingConfig } from '../models/RatingConfig'
import { usersCollection } from '../models/User'
import { shuffle } from '../utils'
import { Timestamp } from 'firebase-admin/firestore'

export const distributeRatings = onRequest(
  { cors: ['*'] },
  async (req, res) => {
    if (req.method !== 'POST') return

    const [usersSnap, config] = await Promise.all([
      usersCollection.get(),
      getRatingConfig(),
    ])

    const docs = usersSnap.docs.filter((doc) => doc.id !== 'botlmm1')
    shuffle(docs)

    const bronze1 =
      config.initialRating - config.ranks.tierSize * config.ranks.initialTier

    await Promise.all(
      docs.map((user, index) =>
        usersCollection.doc(user.id).update({
          glicko: {
            deviation: config.maxReliableDeviation - 1,
            rating:
              bronze1 + (index / (docs.length - 1)) * 4 * config.ranks.tierSize,
            timestamp: Timestamp.now(),
          },
        }),
      ),
    )

    res.send({
      status: 'OK',
      message: 'Rating distribution successful',
    })
  },
)
