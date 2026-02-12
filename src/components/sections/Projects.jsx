import { lazy, Suspense } from 'react'
import styles from './Projects.module.css'
import Section from '../layout/Section'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { projects } from '../../data/projects'
import { useInView } from '../../hooks/useInView'

const ForceGraph = lazy(() => import('../ui/ForceGraph'))

function Projects() {
  const [ref, isInView] = useInView()

  return (
    <Section
      id="projects"
      title="Projects"
      subtitle="Learning by building. Each project represents a step in rebuilding my technical skills."
      withGrid
    >
      <div ref={ref} className={styles.grid}>
        {projects.map((project, index) => (
          <Card
            key={project.id}
            className={`${styles.card} fade-in ${isInView ? 'visible' : ''} stagger-${Math.min(index + 1, 6)}`}
          >
            <div className={styles.image}>
              {project.liveDemo ? (
                <Suspense fallback={<div className={styles.graphPlaceholder}>Loading visualization...</div>}>
                  <ForceGraph />
                </Suspense>
              ) : project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  width={400}
                  height={225}
                />
              ) : (
                <div className={styles.noImage}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
              )}
            </div>
            <div className={styles.details}>
              <h3 className={styles.cardTitle}>{project.title}</h3>
              <p className={styles.description}>{project.description}</p>
              <div className={styles.tags}>
                {project.tech.map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
              <div className={styles.links}>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkBtn}
                    aria-label={`View ${project.title} live`}
                  >
                    View Live
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.linkBtn} ${styles.linkBtnSecondary}`}
                    aria-label={`View ${project.title} source code on GitHub`}
                  >
                    View Code
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  )
}

export default Projects
