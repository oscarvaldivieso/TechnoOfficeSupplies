import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
} from "firebase/auth";
import app from "./config";

export const auth = getAuth(app);

/** Inicia sesión con email y contraseña */
export async function signIn(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

/** Cierra la sesión actual */
export async function signOutUser(): Promise<void> {
    await signOut(auth);
}

/** Suscribe a cambios de estado de autenticación (para el AuthProvider) */
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
