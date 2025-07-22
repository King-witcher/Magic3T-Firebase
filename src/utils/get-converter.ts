import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  WithFieldValue,
} from 'firebase-admin/firestore'
import { OptionalProp } from '../types/optional-prop'
import { WithId } from '@magic3t/types'

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

    toFirestore: (data: T): WithFieldValue<DocumentData> => {
      const output: OptionalProp<T, '_id'> = { ...data }
      delete output._id
      return output
    },
  }
}
