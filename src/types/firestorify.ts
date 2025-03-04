import { DocumentData, Timestamp } from 'firebase-admin/firestore'
import { ModifyProp } from './modify-prop'

export type Firestorify<T extends DocumentData> = Omit<
  ModifyProp<T, Date, Timestamp>,
  '_id'
>
