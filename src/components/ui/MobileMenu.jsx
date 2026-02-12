import { useEffect, useRef } from 'react'
import styles from './MobileMenu.module.css'

const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

function MobileMenu({ isOpen, onClose }) {
  const menuRef = useRef(null)
  const firstLinkRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      firstLinkRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleLinkClick = () => {
    onClose()
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <nav
        ref={menuRef}
        className={`${styles.menu} ${isOpen ? styles.menuOpen : ''}`}
        role="dialog"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className={styles.menuContent}>
          {navLinks.map((link, index) => (
            <a
              key={link.id}
              ref={index === 0 ? firstLinkRef : null}
              href={`#${link.id}`}
              className={styles.menuLink}
              onClick={handleLinkClick}
              tabIndex={isOpen ? 0 : -1}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}

export default MobileMenu
