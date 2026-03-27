import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CatalogoCliente } from './CatalogoCliente'
import type { ProductSummary } from '@/lib/catalogo/queries'

const CATEGORIES = [{ id: 'cat-1', name: 'Fertilizantes', sort_order: 1 }]

const PRODUCTS: ProductSummary[] = [
  {
    id: 'p1',
    name: 'Fertilizante 26-4-22',
    short_name: '26-4-22',
    presentation: 'Bulto 50 kg',
    unit_of_measure: 'bulto',
    category_id: 'cat-1',
    category_name: 'Fertilizantes',
    price_from: 160000,
    warehouse_count: 2,
    photo_url: null,
  },
  {
    id: 'p2',
    name: 'Glifosato Roundup',
    short_name: 'Roundup',
    presentation: 'Litro',
    unit_of_measure: 'litro',
    category_id: 'cat-1',
    category_name: 'Fertilizantes',
    price_from: 45000,
    warehouse_count: 1,
    photo_url: null,
  },
]

describe('CatalogoCliente — búsqueda', () => {
  it('muestra todos los productos al inicio', () => {
    render(
      <CatalogoCliente
        categories={CATEGORIES}
        products={PRODUCTS}
        activeCategoryId={null}
      />
    )

    expect(screen.getByText('Fertilizante 26-4-22')).toBeInTheDocument()
    expect(screen.getByText('Glifosato Roundup')).toBeInTheDocument()
  })

  it('filtra productos cuando el usuario escribe en búsqueda', () => {
    render(
      <CatalogoCliente
        categories={CATEGORIES}
        products={PRODUCTS}
        activeCategoryId={null}
      />
    )
    const searchInput = screen.getByRole('searchbox') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: '26-4-22' } })

    expect(screen.getByText('Fertilizante 26-4-22')).toBeInTheDocument()
    expect(screen.queryByText('Glifosato Roundup')).not.toBeInTheDocument()
  })

  it('el campo de búsqueda inicia vacío por defecto', () => {
    render(
      <CatalogoCliente
        categories={CATEGORIES}
        products={PRODUCTS}
        activeCategoryId={null}
      />
    )

    const searchInput = screen.getByRole('searchbox') as HTMLInputElement
    expect(searchInput.value).toBe('')
  })

  it('funciona correctamente sin initialSearch (por defecto vacío)', () => {
    render(
      <CatalogoCliente
        categories={CATEGORIES}
        products={PRODUCTS}
        activeCategoryId={null}
      />
    )

    const searchInput = screen.getByRole('searchbox') as HTMLInputElement
    expect(searchInput.value).toBe('')
  })

  it('muestra estado vacío cuando búsqueda no coincide con ningún producto', () => {
    render(
      <CatalogoCliente
        categories={CATEGORIES}
        products={PRODUCTS}
        activeCategoryId={null}
      />
    )
    const searchInput = screen.getByRole('searchbox') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'xyz-inexistente' } })

    expect(screen.queryByText('Fertilizante 26-4-22')).not.toBeInTheDocument()
    expect(screen.queryByText('Glifosato Roundup')).not.toBeInTheDocument()
  })
})
