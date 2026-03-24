import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const QTY_MAX = 9_999

export type CartLine = {
  productId: string
  warehouseId: string
  productName: string
  warehouseName: string
  unitPrice: number
  presentation: string | null
  unitOfMeasure: string
  quantity: number
}

type CartState = {
  lines: CartLine[]
  addLine: (line: Omit<CartLine, 'quantity'> & { quantity: number }) => void
  setQuantity: (
    productId: string,
    warehouseId: string,
    quantity: number
  ) => void
  removeLine: (productId: string, warehouseId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line) => {
        const q = Math.min(QTY_MAX, Math.max(1, Math.floor(line.quantity)))
        const existing = get().lines
        const idx = existing.findIndex(
          (l) =>
            l.productId === line.productId && l.warehouseId === line.warehouseId
        )
        if (idx >= 0) {
          const next = [...existing]
          const merged = Math.min(QTY_MAX, next[idx].quantity + q)
          next[idx] = { ...next[idx], quantity: merged }
          set({ lines: next })
          return
        }
        set({
          lines: [
            ...existing,
            {
              productId: line.productId,
              warehouseId: line.warehouseId,
              productName: line.productName,
              warehouseName: line.warehouseName,
              unitPrice: line.unitPrice,
              presentation: line.presentation,
              unitOfMeasure: line.unitOfMeasure,
              quantity: q,
            },
          ],
        })
      },
      setQuantity: (productId, warehouseId, quantity) => {
        const q = Math.min(QTY_MAX, Math.max(1, Math.floor(quantity)))
        set({
          lines: get()
            .lines.map((l) =>
              l.productId === productId && l.warehouseId === warehouseId
                ? { ...l, quantity: q }
                : l
            )
            .filter((l) => l.quantity > 0),
        })
      },
      removeLine: (productId, warehouseId) => {
        set({
          lines: get().lines.filter(
            (l) =>
              !(l.productId === productId && l.warehouseId === warehouseId)
          ),
        })
      },
      clear: () => set({ lines: [] }),
    }),
    {
      name: 'grano-cart-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
    }
  )
)

export function cartTotalCents(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.quantity, 0)
}

export function groupCartByWarehouse(
  lines: CartLine[]
): Map<string, CartLine[]> {
  const m = new Map<string, CartLine[]>()
  for (const line of lines) {
    const cur = m.get(line.warehouseId) ?? []
    cur.push(line)
    m.set(line.warehouseId, cur)
  }
  return m
}
