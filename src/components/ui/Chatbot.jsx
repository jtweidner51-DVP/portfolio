import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './Chatbot.module.css'

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 1024

const SUGGESTED_QUESTIONS = [
  'What makes Janek stand out as a leader?',
  'Tell me about a complex delivery he led',
  'How does he approach AI portfolio governance?',
  'What is his leadership philosophy?',
]

function Message({ role, content, streaming }) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      {role === 'assistant' && (
        <div className={styles.avatar} aria-hidden="true">J</div>
      )}
      <div className={styles.bubble}>
        <p className={styles.text}>
          {content}
          {streaming && <span className={styles.cursor} aria-hidden="true" />}
        </p>
      </div>
    </div>
  )
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm Janek's career assistant. Ask me anything about his background, experience, or how he works — I'm here to help.",
      }])
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const sendMessage = useCallback(async (text) => {
    const userText = text.trim()
    if (!userText || isLoading) return

    setError(null)
    setInput('')

    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setIsLoading(true)

    const assistantIndex = newMessages.length
    setMessages(msgs => [...msgs, { role: 'assistant', content: '', streaming: true }])

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error || `API error ${response.status}`)
      }

      const { reply } = await response.json()

      setMessages(msgs => {
        const updated = [...msgs]
        updated[assistantIndex] = { role: 'assistant', content: reply, streaming: false }
        return updated
      })
    } catch (err) {
      if (err.name === 'AbortError') return
      setMessages(msgs => msgs.slice(0, assistantIndex))
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestion = (question) => {
    sendMessage(question)
  }

  const showSuggestions = messages.length <= 1 && !isLoading

  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Close career chat' : 'Open career chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {!isOpen && <span className={styles.toggleLabel}>Ask about Janek</span>}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className={styles.panel} role="dialog" aria-label="Career chat">
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.headerAvatar}>J</div>
              <div>
                <p className={styles.headerName}>Career Assistant</p>
                <p className={styles.headerSub}>Ask me about Janek&apos;s background</p>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className={styles.messages} aria-live="polite" aria-label="Chat messages">
            {messages.map((msg, i) => (
              <Message key={i} role={msg.role} content={msg.content} streaming={msg.streaming} />
            ))}

            {showSuggestions && (
              <div className={styles.suggestions}>
                <p className={styles.suggestionsLabel}>Try asking:</p>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    className={styles.suggestion}
                    onClick={() => handleSuggestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputArea} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about experience, skills, leadership..."
              disabled={isLoading}
              aria-label="Chat message"
              maxLength={500}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              {isLoading ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
