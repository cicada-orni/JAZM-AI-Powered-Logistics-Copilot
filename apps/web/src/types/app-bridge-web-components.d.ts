import 'react'

declare module 'react' {
  interface HTMLAttributes<T> {
    label?: string
    variants?: 'primary' | 'breadcrumb'
  }
}
