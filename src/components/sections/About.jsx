import styles from './About.module.css'
import Section from '../layout/Section'
import { siteMetadata } from '../../data/siteMetadata'
import { useInView } from '../../hooks/useInView'

function About() {
  const [ref, isInView] = useInView()

  return (
    <Section id="about" title="About Me" withGrid>
      <div ref={ref} className={`${styles.content} fade-in ${isInView ? 'visible' : ''}`}>
        <p className={styles.lead}>{siteMetadata.about.lead}</p>

        {siteMetadata.about.paragraphs.map((p, i) => (
          <p key={i} className={styles.paragraph}>{p}</p>
        ))}

        <blockquote className={styles.emphasis}>
          {siteMetadata.about.emphasis}
        </blockquote>

        <p className={styles.closing}>{siteMetadata.about.closing}</p>

        <p className={styles.credentials}>{siteMetadata.credentials}</p>
      </div>
    </Section>
  )
}

export default About
