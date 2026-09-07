import React from "react";

export function EasyChairIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-label="EasyChair Submission System"
    >
      {/* Real EasyChair Armchair Silhouette */}
      <path d="M5 4C4.44772 4 4 4.44772 4 5V13C4 13.5523 4.44772 14 5 14H6V17C6 17.5523 6.44772 18 7 18H8C8.55228 18 9 17.5523 9 17V15H15V17C15 17.5523 15.4477 18 16 18H17C17.5523 18 18 17.5523 18 17V14H19C19.5523 14 20 13.5523 20 13V5C20 4.44772 19.5523 4 19 4H18C17.4477 4 17 4.44772 17 5V11H7V5C7 4.44772 6.55228 4 6 4H5ZM2 9C2 8.44772 2.44772 8 3 8H4V13H3C2.44772 13 2 12.5523 2 12V9ZM20 8H21C21.5523 8 22 8.44772 22 9V12C22 12.5523 21.5523 13 21 13H20V8Z" />
    </svg>
  );
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
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Google Calendar"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" fill="white" stroke="#CBD5E1" />
      <path d="M3 8H21V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V8Z" fill="#115eff" />
      <rect x="7" y="1.5" width="2" height="3" rx="1" fill="#115eff" />
      <rect x="15" y="1.5" width="2" height="3" rx="1" fill="#115eff" />
      <text
        x="12"
        y="17"
        fontSize="8.5"
        fontWeight="800"
        fill="#115eff"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        15
      </text>
    </svg>
  );
}
