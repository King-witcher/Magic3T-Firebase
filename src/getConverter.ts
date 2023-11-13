import { DocumentData, FirestoreDataConverter } from 'firebase-admin/firestore'

export function getConverter<
  T extends DocumentData,
>(): FirestoreDataConverter<T> {
  return {
    fromFirestore(snapshot: DocumentData) {
      return snapshot as T
    },
    toFirestore(data: T) {
      return data
    },
  }
}
