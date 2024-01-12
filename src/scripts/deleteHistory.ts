import { onRequest } from 'firebase-functions/v2/https'
import { firestore } from '../firestore'

export const deleteHistory = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'DELETE') return

  const snap = await firestore.collection('matches').get()
  await Promise.all(
    snap.docs.map((doc) =>
      firestore.collection('matches').doc(doc.id).delete(),
    ),
  )

  res.send({
    status: 'OK',
    message: 'All matches were deleted',
  })
})
