import { UserModel } from '@magic3t/types'
import { firestore } from '../firestore'
import { getConverter } from '../utils'

export const userConverter = getConverter<UserModel>()

const collection = firestore.collection('users').withConverter(userConverter)

export const users = { collection }
