import styles from './Footer.module.css'
import { siteMetadata } from '../../data/siteMetadata'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.main}>
          <h3 className={styles.name}>{siteMetadata.name}</h3>
          <p className={styles.tagline}>{siteMetadata.tagline}</p>
        </div>

        <div className={styles.links}>
          <h4 className={styles.heading}>Connect</h4>
          <a href={siteMetadata.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
            LinkedIn
          </a>
          <a href={siteMetadata.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
            GitHub
          </a>
          <a href={`mailto:${siteMetadata.social.email}`} aria-label="Send email">
            Email
          </a>
        </div>

        <div className={styles.about}>
          <h4 className={styles.heading}>About This Site</h4>
          <p>Built with React & Vite</p>
          <p>Deployed from London</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {currentYear} {siteMetadata.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
