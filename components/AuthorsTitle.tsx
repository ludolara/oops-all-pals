import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AuthorsTitle({ children }: Props) {
  return (
    <h1 className="mt-4 text-xl font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-100 sm:mt-6 sm:text-2xl sm:leading-8 md:mt-8 md:text-3xl md:leading-9">
      {Array.isArray(children) ? children.join(', ') : children}
    </h1>
  )
}
