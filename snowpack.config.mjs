/** @type { import('snowpack').SnowpackUserConfig } */
export default {
	mount: {
		src: { url: '/' },
	},
	plugins: [
		[
			'@snowpack/plugin-typescript',
		],
	],
}
