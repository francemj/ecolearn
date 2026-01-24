import Link from "next/link"

interface HeaderProps {
  /** Subtitle text displayed below the title */
  subtitle: string
  /** Whether the title links to home (default: true) */
  linkToHome?: boolean
}

export default function Header({ subtitle, linkToHome = true }: HeaderProps) {
  const titleClasses =
    "text-5xl md:text-6xl font-light mb-4 bg-gradient-to-r from-dark-teal via-dark-green to-sage-green dark:from-sage-green dark:via-sage-light dark:to-sage-green bg-clip-text text-transparent"

  return (
    <header className="mb-12 text-center fade-in">
      {linkToHome ? (
        <Link
          href="/"
          className={`${titleClasses} hover:opacity-80 transition-opacity`}
        >
          EcoLearn Daily
        </Link>
      ) : (
        <h1 className={titleClasses}>EcoLearn Daily</h1>
      )}
      <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg mt-2">
        {subtitle}
      </p>
    </header>
  )
}
