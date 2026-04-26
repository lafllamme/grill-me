declare module '#auth-utils' {
  interface User {
    githubId: string
    login: string
    avatarUrl?: string
    name?: string
  }

  interface UserSession {
    loggedInAt?: string
  }
}

export {}
