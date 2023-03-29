const path = require('path')
const fs = require('fs')

const args = {
	'module': '-esm',
	'commonjs': '-cjs'
}

Object.keys(args).forEach(packageType => {
	const argName = args[packageType]
	const tsconfigEsm = process.argv[process.argv.findIndex(arg => arg === argName) + 1]

	if (tsconfigEsm) {
		const tsconfigEsmJson = require(`./${tsconfigEsm}`)

		if (tsconfigEsmJson.compilerOptions.outDir) {
			fs.writeFileSync(path.join('.', tsconfigEsmJson.compilerOptions.outDir, 'package.json'), `{\n\t"type": "${packageType}"\n}`)
		}
	}
})

