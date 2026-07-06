import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false
}) {
  const className = `btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''}`;

  return (
    <button
      className={className}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
