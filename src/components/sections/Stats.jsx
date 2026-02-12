import styles from './Stats.module.css'
import { stats } from '../../data/stats'
import { useInView } from '../../hooks/useInView'
import AnimatedCounter from '../ui/AnimatedCounter'

function Stats() {
  const [ref, isInView] = useInView()

  return (
    <section className={styles.stats} ref={ref}>
      <div className={styles.content}>
        {stats.map((stat, index) => (
          <a
            key={index}
            href="#experience"
            className={`${styles.item} fade-in ${isInView ? 'visible' : ''} stagger-${index + 1}`}
            aria-label={`${stat.number} ${stat.label}`}
          >
            <div className={styles.number}>
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix || ''}
                suffix={stat.suffix}
                trigger={isInView}
              />
            </div>
            <div className={styles.label}>{stat.label}</div>
          </a>
        ))}
      </div>
    </section>
  )
}

export default Stats
