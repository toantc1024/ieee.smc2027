import React from "react";

export function PaperCeptIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="PaperCept Submission System"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

// Backward compatibility alias
export function EasyChairIcon(props: { className?: string }) {
  return <PaperCeptIcon {...props} />;
}

export function IeeeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="IEEE"
    >
      <path d="M12 2L2 12L12 22L22 12L12 2ZM12 4.828L19.172 12L12 19.172L4.828 12L12 4.828ZM11 8V16H13V8H11ZM8 10V14H10V10H8ZM14 10V14H16V10H14Z" />
    </svg>
  );
}

export function IeeeXploreIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="IEEE Xplore Digital Library"
    >
      <rect width="24" height="24" rx="3" fill="#00629B" />
      <path
        d="M6 6L12 12L6 18H8.5L13.25 13.25L18 18H15.5L12 14.5L8.5 18H6L12 12L6 6Z"
        fill="white"
      />
      <circle cx="12" cy="12" r="1.5" fill="white" />
    </svg>
  );
}

export function ScopusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Elsevier Scopus Indexing"
    >
      <rect width="24" height="24" rx="3" fill="#E9711C" />
      <path
        d="M15.5 8C14.5 7.2 13.2 7 12 7C9.2 7 7.5 8.7 7.5 11C7.5 14.5 12.5 13.5 12.5 15.5C12.5 16.3 11.8 17 10.8 17C9.5 17 8.3 16.3 7.5 15.2L6 16.5C7.2 18.2 9 19 11 19C14 19 15.8 17.3 15.8 14.8C15.8 11.2 10.8 12.2 10.8 10.2C10.8 9.5 11.4 9 12.2 9C13.2 9 14.2 9.5 14.8 10.2L15.5 8Z"
        fill="white"
      />
    </svg>
  );
}

export function WebOfScienceIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Clarivate Web of Science"
    >
      <rect width="24" height="24" rx="3" fill="#5E33BF" />
      <path
        d="M6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="white" />
      <circle cx="18" cy="12" r="1.5" fill="#A87FFB" />
    </svg>
  );
}

export function EiCompendexIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EI Compendex"
    >
      <rect width="24" height="24" rx="3" fill="#007396" />
      <text
        x="12"
        y="16.5"
        fontSize="11"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        Ei
      </text>
    </svg>
  );
}

export function GoogleCalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}
