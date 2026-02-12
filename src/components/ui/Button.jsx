import styles from './Button.module.css'

function Button({ href, variant = 'primary', size = 'md', children, ...props }) {
  const Tag = href ? 'a' : 'button'
  const externalProps = href ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <Tag
      href={href}
      className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
      {...externalProps}
      {...props}
    >
      {children}
    </Tag>
  )
}

export default Button
