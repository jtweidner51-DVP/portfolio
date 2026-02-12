import { useState, useEffect, useCallback } from 'react'
import styles from './Nav.module.css'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useTheme } from '../../hooks/useTheme'
import ThemeToggle from '../ui/ThemeToggle'
import MobileMenu from '../ui/MobileMenu'

const sectionIds = ['about', 'skills', 'experience', 'projects', 'contact']

const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
]

function Nav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const activeSection = useScrollSpy(sectionIds)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isDesktop && mobileMenuOpen) setMobileMenuOpen(false)
  }, [isDesktop, mobileMenuOpen])

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  return (
    <>
      <nav
        className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}
        aria-label="Main navigation"
      >
        <div className={styles.content}>
          <a href="#" className={styles.logo}>Janek Weidner</a>

          {isDesktop && (
            <div className={styles.links}>
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`${styles.link} ${activeSection === link.id ? styles.active : ''}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />

            {isDesktop && (
              <a href="#contact" className={styles.cta}>Contact</a>
            )}

            {!isDesktop && (
              <button
                className={styles.hamburger}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.open : ''}`} />
                <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.open : ''}`} />
                <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.open : ''}`} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {!isDesktop && (
        <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />
      )}
    </>
  )
}

export default Nav
