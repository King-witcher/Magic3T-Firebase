import { auth, firestore } from '../firestore'
import { userConverter } from '../models/User'

export async function getUserPhotos() {
  const users = firestore.collection('users').withConverter(userConverter)

  const snapshot = await users.get()

  for (const doc of snapshot.docs) {
    auth.getUser(doc.id).then((user) => {
      users.doc(doc.id).update({
        photoURL: user.photoURL,
      })
    })
  }
}
