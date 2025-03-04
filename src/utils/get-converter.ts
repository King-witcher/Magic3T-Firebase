import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore'
import { Firestorify } from '../types/firestorify'
import { OptionalProp } from '../types/optional-prop'
import { WithId } from '../types/with-id'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function convert(data: Record<string, any>) {
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      data[key] = value.toDate()
    } else if (value instanceof Object) {
      convert(data[key])
    }
  }
}

export function getConverter<T extends WithId>(): FirestoreDataConverter<T> {
  return {
    fromFirestore(snap: QueryDocumentSnapshot<T>) {
      const data = snap.data()
      convert(data)
      return {
        ...data,
        _id: snap.id,
      }
    },

    toFirestore: (data: T): Firestorify<T> => {
      const output: OptionalProp<T, '_id'> = { ...data }
      delete output._id
      return output
    },
  }
}
