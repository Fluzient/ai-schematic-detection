import antfu from '@antfu/eslint-config';

export default antfu({
	stylistic: {
		indent: 'tab',
		quotes: 'single',
		semi: true,
	},

	typescript: true,

	ignores: [
		'.npm-cache/**',
		'build/**',
		'dist/**',
		'coverage/**',
		'node_modules/**',
		'.eslintcache',
		'debug.log',
		'**/*.md',
		'**/*.html',
		'ui/chat/*.js',
		'ui/chat/vendor/**',
		'docs/**',
		'packages/**',
	],
});
