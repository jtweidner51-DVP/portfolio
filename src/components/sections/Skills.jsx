import styles from './Skills.module.css'
import Section from '../layout/Section'
import Card from '../ui/Card'
import { skillCategories } from '../../data/skills'
import { useInView } from '../../hooks/useInView'

function Skills() {
  const [ref, isInView] = useInView()

  return (
    <Section id="skills" title="What I Bring" withGrid>
      <div ref={ref} className={styles.grid}>
        {skillCategories.map((category, index) => (
          <Card
            key={category.title}
            className={`${styles.category} fade-in ${isInView ? 'visible' : ''} stagger-${index + 1}`}
          >
            <div className={styles.categoryInner}>
              <h3 className={styles.categoryTitle}>{category.title}</h3>
              <ul className={styles.list}>
                {category.items.map((item) => (
                  <li key={item} className={styles.item}>{item}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
      <p className={styles.tagline}>
        30 years of strategic thinking + modern technical execution
      </p>
    </Section>
  )
}

export default Skills
