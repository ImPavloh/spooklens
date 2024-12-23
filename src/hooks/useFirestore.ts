import { useState, useCallback } from 'react'

import {
  Query,
  CollectionReference,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const useFirestore = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addDocument = useCallback(async (collectionName: string, data: DocumentData) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = await addDoc(collection(db, collectionName), data)
      setLoading(false)
      return docRef
    } catch (err) {
      setError('Failed to add document')
      setLoading(false)
      console.error('Error adding document: ', err)
    }
  }, [])

  const updateDocument = useCallback(async (collectionName: string, docId: string, data: Partial<DocumentData>) => {
    setLoading(true)
    setError(null)
    try {
      await updateDoc(doc(db, collectionName, docId), data)
      setLoading(false)
    } catch (err) {
      setError('Failed to update document')
      setLoading(false)
      console.error('Error updating document: ', err)
    }
  }, [])

  const deleteDocument = useCallback(async (collectionName: string, docId: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(db, collectionName, docId))
      setLoading(false)
    } catch (err) {
      setError('Failed to delete document')
      setLoading(false)
      console.error('Error deleting document: ', err)
    }
  }, [])

  const getDocuments = useCallback(async (collectionName: string, conditions?: [string, any, any][]) => {
    setLoading(true)
    setError(null)
    try {
      let q: Query<DocumentData> | CollectionReference<DocumentData> = collection(db, collectionName)
      if (conditions) {
        conditions.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value))
        })
      }
      const querySnapshot = await getDocs(q)
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setLoading(false)
      return documents
    } catch (err) {
      setError('Failed to fetch documents')
      setLoading(false)
      console.error('Error fetching documents: ', err)
    }
  }, [])

  const getDocument = useCallback(async <T extends DocumentData>(
    collectionName: string,
    docId: string
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      setLoading(false)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T
      } else {
        setError('Document does not exist')
        return null
      }
    } catch (err) {
      setError('Failed to fetch document')
      setLoading(false)
      console.error('Error fetching document: ', err)
      return null
    }
  }, [])

  return {
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    getDocument,
    loading,
    error
  }
}