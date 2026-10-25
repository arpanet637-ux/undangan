'use client'

import styles from './quote-section-b.module.css'

interface QuoteSectionBProps {
  data?: {
    settings?: Record<string, string>
  }
}

export function QuoteSectionB({ data }: QuoteSectionBProps) {
  // Get quote text from settings or use defaults
  const quote1 = data?.settings?.quote_line_1 || 'Ekoham dvitiyoham, bhava maya patih sada. Avinashino prem astu'
  const quote2 = data?.settings?.quote_line_2 || 'Yuvayoh premamritam pratyaham samvardhataam. Vivahasya mangalashisah!'
  const quote3 = data?.settings?.quote_line_3 || 'Rahajeng ngawit grihasta ashrama. Mugi kapanggihin śānti, sukha, sareng prīti ring saaking Ida Sang Hyang Widhi.'

  return (
    <section className={styles.quoteSection}>
      {/* Divider Top */}
      <div className={styles.dividerLarge}></div>

      <div className={styles.quoteBlock}>
        {/* Quote Line 1 */}
        <p className={styles.quoteText}>{quote1}</p>

        {/* Small Divider */}
        <div className={styles.dividerSmall}></div>

        {/* Quote Line 2 */}
        <p className={styles.quoteText}>{quote2}</p>

        {/* Quote Line 3 */}
        <p className={styles.quoteText}>{quote3}</p>
      </div>

      {/* Divider Bottom */}
      <div className={styles.dividerLarge}></div>
    </section>
  )
}
