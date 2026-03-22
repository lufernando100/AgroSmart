import Link from 'next/link'

export default function AlmacenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <nav className="mx-auto flex max-w-4xl flex-wrap gap-2 px-4 py-3 text-sm font-medium">
          <Link
            href="/almacen/dashboard"
            className="rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Inicio
          </Link>
          <Link
            href="/almacen/pedidos"
            className="rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Pedidos
          </Link>
          <Link
            href="/almacen/productos"
            className="rounded-lg px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Productos y precios
          </Link>
        </nav>
      </header>
      {children}
    </div>
  )
}
