import { create } from 'zustand'

interface User {
    id: string,
    email: string,
    role: string,
    workspaceId: string,
    lastActive: string | null,
    createdAt: string | null,
}

interface AuthState {
    user: User | null,
    accessToken: string | null,
    login: (user: User, accessToken: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    login: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken)
        set({ user, accessToken })
    },
    logout: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null })
    },
}))