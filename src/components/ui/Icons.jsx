function Icon({ children, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const ClipboardIcon = (props) => (
  <Icon {...props}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6M9 16h4" />
  </Icon>
);

export const TrendingDownIcon = (props) => (
  <Icon {...props}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </Icon>
);

export const PlugIcon = (props) => (
  <Icon {...props}>
    <path d="M9 2v6M15 2v6" />
    <path d="M7 8h10v4a5 5 0 0 1-10 0V8z" />
    <path d="M12 17v5" />
  </Icon>
);

export const ClockIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14" />
  </Icon>
);

export const ZapIcon = (props) => (
  <Icon {...props}>
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
  </Icon>
);

export const RefreshIcon = (props) => (
  <Icon {...props}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <polyline points="21 3 21 9 15 9" />
  </Icon>
);

export const WorkflowIcon = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <path d="M10 6.5h5a2 2 0 0 1 2 2V14" />
  </Icon>
);

export const TrendingUpIcon = (props) => (
  <Icon {...props}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </Icon>
);
