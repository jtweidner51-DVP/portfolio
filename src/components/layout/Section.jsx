import styles from './Section.module.css'

function Section({ id, title, subtitle, withGrid = true, className = '', children }) {
  return (
    <section
      id={id}
      className={`${styles.section} ${withGrid ? styles.withGrid : ''} ${className}`}
      aria-labelledby={title ? `${id}-heading` : undefined}
    >
      <div className={styles.container}>
        {title && (
          <header className={styles.header}>
            <h2 id={`${id}-heading`} className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}

export default Section
