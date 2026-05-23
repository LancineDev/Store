"use client"

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import type { Product } from '@/lib/products'

export interface CartItem {
  product: Product
  quantity: number
  size?: string
  color?: string
}

export function getCartItemKey(item: Pick<CartItem, 'product' | 'size' | 'color'>): string {
  return [item.product.id, item.size ?? 'default', item.color ?? 'default'].join(':')
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { key: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  isOpen: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const itemKey = getCartItemKey(action.payload)
      const existingIndex = state.items.findIndex(
        (item) => getCartItemKey(item) === itemKey
      )
      if (existingIndex > -1) {
        const newItems = [...state.items]
        newItems[existingIndex].quantity += action.payload.quantity
        return { ...state, items: newItems }
      }
      return { ...state, items: [...state.items, action.payload] }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => getCartItemKey(item) !== action.payload),
      }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((item) =>
          getCartItemKey(item) === action.payload.key
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'LOAD_CART':
      return { ...state, items: action.payload }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  isLoaded: boolean
  addItem: (item: CartItem) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('sportzone-cart')
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: items })
      } catch (e) {
        console.error('Failed to load cart from localStorage', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('sportzone-cart', JSON.stringify(state.items))
  }, [isLoaded, state.items])

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item })
  const removeItem = (key: string) => dispatch({ type: 'REMOVE_ITEM', payload: key })
  const updateQuantity = (key: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })
  const toggleCart = () => dispatch({ type: 'TOGGLE_CART' })

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        isLoaded,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
