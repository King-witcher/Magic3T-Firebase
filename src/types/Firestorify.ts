import { ModifyProp } from './modify-prop'
import { DocumentData, Timestamp } from 'firebase-admin/firestore'

export type Firestorify<T extends DocumentData> = Omit<
  ModifyProp<T, Date, Timestamp>,
  '_id'
>
