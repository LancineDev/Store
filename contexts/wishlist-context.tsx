"use client"

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import type { Product } from '@/lib/products'

interface WishlistState {
  items: Product[]
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: Product[] }

const initialState: WishlistState = {
  items: [],
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.some((item) => item.id === action.payload.id)
      if (exists) return state
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] }
    case 'LOAD_WISHLIST':
      return { ...state, items: action.payload }
    default:
      return state
  }
}

interface WishlistContextType {
  items: Product[]
  isLoaded: boolean
  addItem: (product: Product) => void
  removeItem: (id: number) => void
  clearWishlist: () => void
  isInWishlist: (id: number) => boolean
  toggleWishlist: (product: Product) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('sportzone-wishlist')
    if (savedWishlist) {
      try {
        const items = JSON.parse(savedWishlist)
        dispatch({ type: 'LOAD_WISHLIST', payload: items })
      } catch (e) {
        console.error('Failed to load wishlist from localStorage', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save wishlist to localStorage on change
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('sportzone-wishlist', JSON.stringify(state.items))
  }, [isLoaded, state.items])

  const addItem = (product: Product) => dispatch({ type: 'ADD_ITEM', payload: product })
  const removeItem = (id: number) => dispatch({ type: 'REMOVE_ITEM', payload: id })
  const clearWishlist = () => dispatch({ type: 'CLEAR_WISHLIST' })
  const isInWishlist = (id: number) => state.items.some((item) => item.id === id)
  
  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeItem(product.id)
    } else {
      addItem(product)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        isLoaded,
        addItem,
        removeItem,
        clearWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
