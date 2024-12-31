import { onRequest } from 'firebase-functions/v2/https'
import { shuffle } from '../utils'
import { Timestamp } from 'firebase-admin/firestore'
import { models } from '../models'

export const distributeRatings = onRequest(
  { cors: ['*'] },
  async (req, res) => {
    if (req.method !== 'POST') return

    const [usersSnap, config] = await Promise.all([
      models.users.collection.get(),
      models.ratingConfig.get(),
    ])

    const docs = usersSnap.docs
    shuffle(docs)

    const bronze1 =
      config.base_league - config.league_length * config.base_league

    await Promise.all(
      docs.map((user, index) =>
        models.users.collection.doc(user.id).update({
          glicko: {
            deviation: config.rd_threshold - 1,
            rating:
              bronze1 + (index / (docs.length - 1)) * 4 * config.league_length,
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
