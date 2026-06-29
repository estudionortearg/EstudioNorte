import { InputHTMLAttributes, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', style, ...props }: InputProps) {
  const id = useId()
  const inputId = props.id ?? id

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: error ? '1px solid #FF6B6B' : '1px solid rgba(78,205,196,0.15)',
    color: '#F7F7F2',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    width: '100%',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: '1rem',
    transition: 'border-color 150ms ease',
    ...style,
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={inputId}
          style={{
            color: 'rgba(247,247,242,0.5)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '13px',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={inputStyle}
        className={`placeholder:text-[rgba(247,247,242,0.3)] focus:border-[#4ECDC4] focus:ring-0 focus:outline-none ${className}`}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = '#4ECDC4'
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = 'rgba(78,205,196,0.15)'
          props.onBlur?.(e)
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            color: '#FF6B6B',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
