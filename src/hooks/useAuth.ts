import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface UserData {
  uid: string
  username: string
  bio: string
  avatar: string
  profileVisible: boolean
  notificationsEnabled: boolean
  createdAt: string
  totalCandies: number
  potions: number
  totalSpins: number
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return unsubscribe
  }, [])

  const signIn = async (emailOrUsername: string, password: string) => {
    return signInWithEmailAndPassword(auth, emailOrUsername, password)
  }

  const signUp = async (
    email: string,
    password: string,
    userData: Omit<UserData, 'uid'>
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const completeUserData: UserData = {
      uid: userCredential.user.uid,
      ...userData,
    }
    await setDoc(doc(db, 'users', userCredential.user.uid), completeUserData)
    return userCredential
  }

  const signInAnonymously = () => {
    return firebaseSignInAnonymously(auth)
  }

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email)
  }

  const updateEmail = async (newEmail: string, currentPassword: string) => {
    const user = auth.currentUser
    if (user) {
      try {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword)
        await reauthenticateWithCredential(user, credential)
        await firebaseUpdateEmail(user, newEmail)
      } catch (error) {
        console.error('Error updating email:', error)
        throw error
      }
    } else {
      throw new Error('No user is currently signed in')
    }
  }

  const updatePassword = async (newPassword: string, currentPassword: string) => {
    const user = auth.currentUser
    if (user) {
      try {
        const credential = EmailAuthProvider.credential(user.email!, currentPassword)
        await reauthenticateWithCredential(user, credential)
        await firebaseUpdatePassword(user, newPassword)
      } catch (error) {
        console.error('Error updating password:', error)
        throw error
      }
    } else {
      throw new Error('No user is currently signed in')
    }
  }

  return {
    user,
    signIn,
    signUp,
    signInAnonymously,
    resetPassword,
    updateEmail,
    updatePassword,
  }
}