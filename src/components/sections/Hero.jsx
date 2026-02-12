import { useState, useEffect } from 'react'
import styles from './Hero.module.css'
import { siteMetadata } from '../../data/siteMetadata'
import Button from '../ui/Button'

function Hero() {
  const [matrixActive, setMatrixActive] = useState(false)

  const handleNameClick = () => {
    if (matrixActive) return
    setMatrixActive(true)
    setTimeout(() => setMatrixActive(false), 5000)
  }

  return (
    <section className={styles.hero}>
      {matrixActive && (
        <div className={styles.matrixOverlay} aria-hidden="true">
          <MatrixCanvas />
        </div>
      )}

      <div className={`${styles.content} ${matrixActive ? styles.faded : ''}`}>
        <div className={styles.status}>
          <span className={styles.statusDot} />
          {siteMetadata.statusLine}
        </div>

        <div
          className={`${styles.photo} ${matrixActive ? styles.glitch : ''}`}
          onClick={handleNameClick}
          title="Click for a surprise..."
        >
          <img
            src="/images/profile.jpg"
            alt="Janek Weidner"
            width={180}
            height={180}
            fetchpriority="high"
          />
        </div>

        <h1 className={styles.title}>{siteMetadata.name} <span className={styles.postNominal}>CITP</span></h1>
        <p className={styles.subtitle}>{siteMetadata.title}</p>

        <div className={styles.ctas}>
          <Button href={siteMetadata.social.linkedin} variant="primary" size="md">
            LinkedIn
          </Button>
          <Button href={siteMetadata.social.github} variant="secondary" size="md">
            GitHub
          </Button>
          <Button href={`mailto:${siteMetadata.social.email}`} variant="secondary" size="md" target="_self" rel="">
            Contact
          </Button>
        </div>
      </div>

      {matrixActive && (
        <div className={styles.matrixMessage} aria-hidden="true">
          <p>Unlocking NET ZERO through technology ...</p>
          <p className={styles.matrixSub}>// 30 years of code compiled into leadership</p>
        </div>
      )}

      <a href="#about" className={styles.scrollIndicator} aria-label="Scroll to about section">
        <span>Scroll to explore</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </a>
    </section>
  )
}

function MatrixCanvas() {
  useEffect(() => {
    const canvas = document.getElementById('matrix-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const chars = '01NETZERO'
    const fontSize = 14
    const columns = Math.floor(canvas.width / fontSize)
    const drops = Array.from({ length: columns }, () => 1)

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#667eea'
      ctx.font = fontSize + 'px monospace'

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }

    const interval = setInterval(draw, 33)
    return () => clearInterval(interval)
  }, [])

  return <canvas id="matrix-canvas" style={{ width: '100%', height: '100%' }} />
}

export default Hero
