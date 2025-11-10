// tailwind.config.js
export default {
	content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				background: 'var(--color-bg)',
				foreground: 'var(--color-fg)',
				card: 'var(--color-card)',
				border: 'var(--color-border)',
				primary: 'var(--color-primary)',
				muted: {
					DEFAULT: 'hsl(210 20% 95%)',
					foreground: 'hsl(210 20% 45%)',
				},
			},
		},
	},
	plugins: [],
};
