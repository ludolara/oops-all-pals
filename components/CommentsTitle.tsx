import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function CommentsTitle({ children }: Props) {
  return (
    <h1 className="mt-2 text-base font-medium leading-5 tracking-normal text-gray-900 dark:text-gray-100 sm:mt-3 sm:text-lg sm:leading-6 md:mt-4 md:text-xl md:leading-7">
      {children}
    </h1>
  )
}
