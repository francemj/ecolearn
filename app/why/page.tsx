import Link from "next/link"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

export default function WhyPage() {
  return (
    <main className="min-h-screen py-12 px-4 transition-colors duration-300 bg-gradient-to-b from-white to-sage-light dark:from-gray-900 dark:to-dark-slate">
      <div className="max-w-4xl mx-auto">
        <Header
          subtitle="A short note on the intent behind EcoLearn Daily."
          linkToHome={true}
        />

        <section className="bg-gradient-to-br from-sage-light/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 md:p-10 mb-8 fade-in border border-sage-green/30 dark:border-sage-green/50">
          <h2 className="text-2xl md:text-3xl text-dark-green dark:text-sage-light mb-6">
            Why I made this site
          </h2>

          <div className="space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              I wanted to use AI for good—and, honestly, to build something that
              pushes against the direction I see a lot of tech taking: endless
              feeds, infinite scroll, and products that win by quietly spending
              as much of your attention as possible.
            </p>

            <p>
              EcoLearn Daily is my attempt at the opposite. The goal is quick,
              high-quality interaction: one focused topic per day, a synthesis
              that points back to real research, and a chat that helps you ask
              better questions—then lets you leave.
            </p>

            <p>
              That “then lets you leave” part matters. If a tool is genuinely
              useful, it shouldn’t need tricks to keep you around. I’m trying to
              build something calm: no streaks, no notifications, no gamified
              loops—just a small daily window where you can learn something
              grounded and move on with your life.
            </p>

            <p>
              I also didn’t want to ignore the environmental story behind AI.
              This site teaches sustainability topics, but it also keeps the
              conversation honest about the fact that AI has a footprint too. If
              we’re going to use these systems, we should at least understand
              their costs—and use them with intention.
            </p>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-dark-green dark:text-sage-light mb-3">
                What I’m aiming for
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  A daily, shared learning moment—small enough to fit into real
                  life.
                </li>
                <li>
                  Fast paths to primary sources (papers you can actually read).
                </li>
                <li>
                  A product that respects your time and avoids dark patterns.
                </li>
                <li>
                  Clear, practical awareness of AI’s environmental impact.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-white/80 to-sage-light/40 dark:from-gray-800/70 dark:to-gray-900/80 rounded-lg p-6 md:p-10 mb-8 fade-in border border-sage-green/30 dark:border-sage-green/50">
          <h2 className="text-2xl md:text-3xl text-dark-green dark:text-sage-light mb-6">
            About the thought process
          </h2>

          <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              The product choices are intentionally narrow: one topic per day,
              5-7 source papers, and a short synthesis in either an academic or
              casual tone. That keeps the app useful without turning it into a
              feed you can scroll forever.
            </p>
            <p>
              Topic selection is deterministic by date, so everyone gets the
              same subject each day. The list is broad (around 90 pointed
              sustainability subthemes) and interleaved across categories to
              avoid repetitive runs of similar subjects.
            </p>
            <p>
              The summary is generated with citations and linked references
              because the goal is not to replace papers, but to lower the
              barrier to opening them. Fast access to primary sources matters
              more than polished AI prose.
            </p>
            <p>
              Infrastructure decisions follow the same mindset: optional shared
              caching reduces duplicate model calls, and token usage is tracked
              to surface energy and emissions estimates. If this app teaches
              sustainability, the delivery mechanism should stay visible too.
            </p>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-dark-teal to-dark-green text-white rounded-lg hover:from-dark-green hover:to-sage-green transition-all shadow-md hover:shadow-lg"
          >
            Back to Today&apos;s Topic
          </Link>
          <Link
            href="/articles"
            className="px-6 py-3 border border-sage-green/50 text-dark-green dark:text-sage-light rounded-lg hover:bg-sage-light/30 dark:hover:bg-gray-700/30 transition-all"
          >
            Browse the Archive
          </Link>
        </div>

        <Footer>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link
              href="/why"
              className="text-dark-teal dark:text-sage-green hover:text-dark-green dark:hover:text-sage-light underline underline-offset-4 transition-colors"
            >
              Why this exists
            </Link>
            <Link
              href="/articles"
              className="text-dark-teal dark:text-sage-green hover:text-dark-green dark:hover:text-sage-light underline underline-offset-4 transition-colors"
            >
              Articles
            </Link>
          </div>
        </Footer>
      </div>
    </main>
  )
}
