import styles from './Card.module.css'

function Card({ as: Tag = 'div', hover = true, className = '', children, ...props }) {
  return (
    <Tag className={`${styles.card} ${hover ? styles.hoverable : ''} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export default Card
