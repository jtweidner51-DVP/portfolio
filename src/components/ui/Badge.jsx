import styles from './Badge.module.css'

function Badge({ children }) {
  return <span className={styles.badge}>{children}</span>
}

export default Badge
