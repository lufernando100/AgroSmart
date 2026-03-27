'use client'

import Link from 'next/link'
import { QuickAdd } from '@/components/catalogo/QuickAdd'

type Props = {
  productId: string
  productName: string
  presentation: string | null
  unitOfMeasure: string
  warehouseId: string
  warehouseName: string
  unitPrice: number
}

/**
 * Per-warehouse actions on product detail: add to cart (QuickAdd) or open order form with notes.
 */
export function ProductDetailWarehouseActions({
  productId,
  productName,
  presentation,
  unitOfMeasure,
  warehouseId,
  warehouseName,
  unitPrice,
}: Props) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href={`/catalogo/pedido?producto_id=${productId}&almacen_id=${warehouseId}`}
        className="flex h-14 flex-1 items-center justify-center rounded-xl border border-[#059669] bg-white text-base font-semibold text-[#059669] hover:bg-[#ECFDF5]"
      >
        Pedir con notas
      </Link>
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <span className="text-sm text-[#7B675B]">Al carrito</span>
        <QuickAdd
          productId={productId}
          warehouseId={warehouseId}
          warehouseName={warehouseName}
          unitPrice={unitPrice}
          productName={productName}
          presentation={presentation}
          unitOfMeasure={unitOfMeasure}
        />
      </div>
    </div>
  )
}
