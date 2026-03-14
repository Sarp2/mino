export interface IconProps {
    className?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export const Icons = {
    Google: ({ className, ...props }: IconProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            className={className}
            {...props}
        >
            <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
            />
            <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
            />
            <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
            />
        </svg>
    ),
    Github: ({ className, ...props }: IconProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            className={className}
            {...props}
        >
            <path
                fill="#24292e"
                d="M24 4C12.954 4 4 12.954 4 24c0 8.837 5.729 16.335 13.686 18.977 1.001.184 1.367-.434 1.367-.964 0-.476-.018-2.061-.027-3.739-5.567 1.209-6.742-2.361-6.742-2.361-.91-2.311-2.222-2.926-2.222-2.926-1.817-1.241.137-1.216.137-1.216 2.009.141 3.066 2.063 3.066 2.063 1.785 3.058 4.683 2.175 5.823 1.664.181-1.294.698-2.176 1.271-2.676-4.446-.505-9.122-2.223-9.122-9.894 0-2.186.78-3.972 2.061-5.372-.207-.506-.893-2.542.195-5.298 0 0 1.68-.538 5.502 2.052A19.13 19.13 0 0124 13.268c1.7.008 3.415.23 5.014.673 3.819-2.59 5.496-2.052 5.496-2.052 1.09 2.756.404 4.792.197 5.298 1.283 1.4 2.058 3.186 2.058 5.372 0 7.689-4.683 9.383-9.145 9.879.719.619 1.359 1.842 1.359 3.712 0 2.679-.024 4.841-.024 5.498 0 .534.36 1.157 1.376.962C38.275 40.331 44 32.835 44 24c0-11.046-8.954-20-20-20z"
            />
        </svg>
    ),
    Nextjs: ({ className, ...props }: IconProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            className={className}
            {...props}
        >
            <circle cx="24" cy="24" r="20" fill="#111111" />
            <path
                d="M16 33V15.8L30.4 33H32V15"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M27.2 15L32 22.2"
                stroke="#9CA3AF"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    ),
    Vite: ({ className, ...props }: IconProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            className={className}
            {...props}
        >
            <path
                d="M24 42L9 12.5l8.4 1.2L24 31.6l6.6-17.9L39 12.5 24 42z"
                fill="#8B5CF6"
            />
            <path d="M24 42L17.4 13.7 24 6l6.6 7.7L24 42z" fill="#F59E0B" />
        </svg>
    ),
    Nuxt: ({ className, ...props }: IconProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            className={className}
            {...props}
        >
            <path
                d="M8 34.5L17.4 18a3.2 3.2 0 015.6 0l3.6 6.2-7.4 12.9H10.8A2.8 2.8 0 018 34.5z"
                fill="#00C58E"
            />
            <path
                d="M18.8 37.1l8.8-15.4a3.2 3.2 0 015.6 0l6.8 11.9a2.8 2.8 0 01-2.4 4.2H18.8z"
                fill="#108775"
            />
            <path
                d="M26.6 24.2l2.2-3.9a3.2 3.2 0 015.6 0l4.2 7.3h-4.4l-7.6-3.4z"
                fill="#7EE8CA"
            />
        </svg>
    ),
    Projects: ({ className, ...props }: IconProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            className={className}
            {...props}
        >
            <circle cx="24" cy="24" r="20" fill="#111111" />
            <path
                d="M16 17.5L24 13l8 4.5v11L24 33l-8-4.5v-11z"
                stroke="#E5E5E5"
                strokeWidth="2.2"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M16 17.5L24 22l8-4.5M24 22v11"
                stroke="#737373"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </svg>
    ),
    Template: ({ className, ...props }: IconProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="20"
            height="20"
            className={className}
            {...props}
        >
            <rect x="8" y="10" width="24" height="28" rx="5" fill="#E5E7EB" />
            <rect x="16" y="14" width="24" height="28" rx="5" fill="#D1D5DB" />
            <rect x="20" y="20" width="16" height="3" rx="1.5" fill="#6B7280" />
            <rect x="20" y="26" width="12" height="3" rx="1.5" fill="#6B7280" />
            <rect x="20" y="32" width="14" height="3" rx="1.5" fill="#6B7280" />
        </svg>
    ),
    LoadingSpinner: ({ className, ...props }: IconProps) => (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <path
                d="M14.1693 8.0026C14.1693 11.4083 11.4083 14.1693 8.0026 14.1693C4.59685 14.1693 1.83594 11.4083 1.83594 8.0026C1.83594 4.59685 4.59685 1.83594 8.0026 1.83594C11.4083 1.83594 14.1693 4.59685 14.1693 8.0026Z"
                stroke="currentColor"
                strokeOpacity="0.3"
            />
            <path
                d="M14.1667 8C14.1667 11.4057 11.4057 14.1667 8 14.1667"
                stroke="currentColor"
                strokeOpacity="1"
                strokeLinecap="round"
            />
        </svg>
    ),
};
