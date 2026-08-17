  export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
    return (
      <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
        {/* SVG Icon Mark */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white shadow-sm transition-all duration-200 group-hover:bg-blue-600 group-hover:scale-105">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
          >
            <circle
              cx="16"
              cy="16"
              r="10"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-gray-400 group-hover:text-white/80 transition-colors"
              strokeDasharray="4 2"
            />
            <path
              d="M16 10V22M10 16H22"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-blue-400 group-hover:text-white transition-colors"
            />
            <circle cx="16" cy="16" r="3" fill="currentColor" className="text-white" />
          </svg>
        </div>

        {/* Logotype */}
        <span className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-gray-800 transition-colors">
          Open<span className="text-blue-600">Roles</span>
        </span>
      </div>
    );
  }