import { forwardRef } from 'react'

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  required = false,
  ...props
}, ref) => {
  const inputClasses = error
    ? 'input-error'
    : 'input'

  return (
    <div className={className}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="error-text">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-neutral-600 mt-1">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input