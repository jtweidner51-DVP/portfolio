import styles from './Contact.module.css'
import Section from '../layout/Section'
import Button from '../ui/Button'
import { siteMetadata } from '../../data/siteMetadata'
import { useInView } from '../../hooks/useInView'

function Contact() {
  const [ref, isInView] = useInView()

  return (
    <Section id="contact" title="Let's Connect" withGrid={false}>
      <div ref={ref} className={`${styles.content} fade-in ${isInView ? 'visible' : ''}`}>
        <p className={styles.text}>
          Interested in discussing climate tech, digital transformation, or collaboration opportunities?
        </p>
        <div className={styles.actions}>
          <Button
            href={`mailto:${siteMetadata.social.email}`}
            variant="primary"
            size="lg"
            target="_self"
            rel=""
          >
            Get In Touch
          </Button>
          <Button
            href={siteMetadata.social.linkedin}
            variant="secondary"
            size="lg"
          >
            Connect on LinkedIn
          </Button>
        </div>
      </div>
    </Section>
  )
}

export default Contact
