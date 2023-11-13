export type UserData = {
  nickname: string
  glicko: {
    rating: number
    deviation: number
    timestamp: number
  }
  photoUrl: string
  role: 'player' | 'admin'
}
