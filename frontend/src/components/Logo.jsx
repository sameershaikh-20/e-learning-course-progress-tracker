export function LogoMark({ size = 24, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="OpenBook"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="var(--accent-complete)"
        d="M2.5 4.5c3.7-.8 6.6-.1 9.5 2v14c-2.9-2.1-5.8-2.8-9.5-2V4.5Zm19 0c-3.7-.8-6.6-.1-9.5 2v14c2.9-2.1 5.8-2.8 9.5-2V4.5Z"
      />
      <path
        fill="var(--ink)"
        d="M4.5 7.1v9.8c2.1-.2 4.1.3 6.1 1.4V8.5c-1.9-1.1-3.9-1.6-6.1-1.4Zm15 0c-2.2-.2-4.2.3-6.1 1.4v9.8c2-1.1 4-1.6 6.1-1.4V7.1Z"
      />
      <path d="M12 6.5v14" stroke="var(--bg)" strokeWidth="1" />
    </svg>
  );
}

export function Logo({ className = '', markSize = 24 }) {
  return (
    <span className={`openbook-logo ${className}`.trim()}>
      <LogoMark size={markSize} />
      <span>OpenBook</span>
    </span>
  );
}

export default Logo;
