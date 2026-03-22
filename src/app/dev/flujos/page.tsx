import Link from 'next/link'
import { notFound } from 'next/navigation'

/** IDs alineados con `database/05_seed_data.sql` */
const SEMILLA = {
  producto: '30000000-0000-4000-8000-000000000001',
  almacen: '20000000-0000-4000-8000-000000000001',
}

export default function DevFlujosPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const pedidoUrl = `/catalogo/pedido?producto_id=${SEMILLA.producto}&almacen_id=${SEMILLA.almacen}`

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
            Solo desarrollo — no se despliega en producción
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Flujos de prueba
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Caficultor y almacén — mismas rutas que cubren las pruebas E2E
          </p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Iniciá sesión con el rol correspondiente (OTP). Esta página enlaza las mismas rutas que usan las
            pruebas Playwright en <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">e2e/</code>.
          </p>
        </header>

        <section className="rounded-2xl border border-emerald-200 bg-white p-6 dark:border-emerald-900 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">
            Caficultor (rol por defecto tras OTP)
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-zinc-700 dark:text-zinc-300">
            <li>
              <Link className="font-medium text-emerald-800 underline dark:text-emerald-400" href="/login">
                Login
              </Link>{' '}
              — enviar código SMS y verificar.
            </li>
            <li>
              <Link className="font-medium text-emerald-800 underline dark:text-emerald-400" href="/catalogo">
                Catálogo
              </Link>{' '}
              — listado de productos con precio desde.
            </li>
            <li>
              <Link
                className="font-medium text-emerald-800 underline dark:text-emerald-400"
                href={`/catalogo/${SEMILLA.producto}`}
              >
                Detalle producto (semilla)
              </Link>{' '}
              — comparador; botón &quot;Pedir aquí&quot;.
            </li>
            <li>
              <Link className="font-medium text-emerald-800 underline dark:text-emerald-400" href={pedidoUrl}>
                Formulario de pedido (producto + almacén de semilla)
              </Link>
              .
            </li>
            <li>
              Tras crear pedido, la app redirige a{' '}
              <span className="font-mono text-sm">/catalogo/pedido/confirmacion?id=…</span>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-white p-6 dark:border-amber-900 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
            Almacén (requiere rol warehouse + user_id en warehouses)
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            En Supabase: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">users.role = warehouse</code>{' '}
            y <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">warehouses.user_id</code> = tu UUID de
            auth.
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-zinc-700 dark:text-zinc-300">
            <li>
              <Link
                className="font-medium text-amber-900 underline dark:text-amber-400"
                href="/almacen/dashboard"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link className="font-medium text-amber-900 underline dark:text-amber-400" href="/almacen/pedidos">
                Pedidos
              </Link>
            </li>
            <li>
              <Link
                className="font-medium text-amber-900 underline dark:text-amber-400"
                href="/almacen/productos"
              >
                Productos y precios
              </Link>
            </li>
          </ol>
        </section>

        <footer className="text-sm text-zinc-500 dark:text-zinc-500">
          <p>
            Pruebas automáticas: <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">npm run test:e2e</code>{' '}
            · UI interactiva: <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">npm run test:e2e:ui</code>
          </p>
        </footer>
      </div>
    </div>
  )
}
