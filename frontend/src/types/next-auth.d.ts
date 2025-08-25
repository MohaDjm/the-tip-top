declare module "next-auth" {
  interface Session {
    accessToken?: string
    provider?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      backendId?: string
      role?: string
    }
  }

  interface User {
    backendId?: string
    role?: string
  }

  interface JWT {
    accessToken?: string
    provider?: string
    backendId?: string
    role?: string
  }
}
