import styles from './Experience.module.css'
import Section from '../layout/Section'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { experiences } from '../../data/experience'
import { useInView } from '../../hooks/useInView'

function Experience() {
  const [ref, isInView] = useInView()

  return (
    <Section
      id="experience"
      title="Experience"
      subtitle="Key delivery highlights from 30 years leading technology transformation across energy, broadcasting, and government."
      withGrid
    >
      <div ref={ref} className={styles.grid}>
        {experiences.map((exp, index) => (
          <Card
            key={exp.id}
            className={`${styles.card} fade-in ${isInView ? 'visible' : ''} stagger-${Math.min(index + 1, 6)}`}
          >
            <div className={styles.image}>
              <img
                src={exp.image}
                alt={`${exp.company} - ${exp.title}`}
                loading="lazy"
                width={400}
                height={225}
              />
            </div>
            <div className={styles.details}>
              <h3 className={styles.cardTitle}>{exp.title}</h3>
              <div className={styles.meta}>
                <span className={styles.company}>{exp.company}</span>
                <span className={styles.period}>{exp.period}</span>
              </div>
              <p className={styles.description}>{exp.description}</p>
              <div className={styles.outcomes}>
                <h4 className={styles.outcomesHeading}>Key Outcomes:</h4>
                <ul aria-label="Key outcomes">
                  {exp.outcomes.map((outcome, i) => (
                    <li key={i} className={styles.outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.tags}>
                {exp.tech.map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export default Experience
