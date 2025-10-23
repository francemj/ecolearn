"use client"

import { useState, useEffect } from "react"

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(
    typeof window !== "undefined" && localStorage.getItem("darkMode") === "true"
  )

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [isDark])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    localStorage.setItem("darkMode", String(newDarkMode))

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-6 right-6 p-3 rounded-full bg-gradient-to-br from-sage-light to-sage-green/20 dark:from-dark-teal dark:to-dark-green hover:from-sage-green/30 hover:to-sage-green/40 dark:hover:from-dark-green dark:hover:to-sage-green transition-all shadow-lg hover:shadow-xl border border-sage-green/30 dark:border-sage-green/50"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <svg
          className="w-5 h-5 text-sage-light"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-dark-teal"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}
