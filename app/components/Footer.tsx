import { ReactNode } from "react"

interface FooterProps {
  children?: ReactNode
}

export default function Footer({ children }: FooterProps) {
  return (
    <footer className="mt-16 pt-8 border-t border-sage-green/30 dark:border-sage-green/50 text-center space-y-4">
      {children}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Built to learn, not to keep you hooked.
      </p>
    </footer>
  )
}
