import path from 'path'
import fs from 'fs'
import os from 'os'
import { pathToFileURL } from 'url'

export const capitalized = str => (str.length > 0) ? `${str[0].toUpperCase()}${str.substring(1, str.length)}` : str

export const encodeBase64 = value => {
	value = JSON.stringify(value)
	return (value) ? Buffer.from(value).toString('base64') : value
}

export const decodeBase64 = value => {
	value = value ? Buffer.from(value, 'base64').toString('ascii') : value
	try {
		return JSON.parse(value)
	}
	catch (error) {
		return
	}
}

// export const modulePath = (moduleFilename) => moduleFilename
const isCommonJS = typeof module !== 'undefined'
export const modulePath = (moduleFilename) => (os.platform() === 'win32' && global.jestRuntime !== true && !isCommonJS) ? pathToFileURL(moduleFilename) : moduleFilename

export const lstat = (filename) => new Promise((resolve, reject) => fs.lstat(filename, (error, stats) => (error) ? reject(error) : resolve(stats)))

export const lsModules = (dirname) => fs.readdirSync(dirname)
	// .filter(item => item !== 'index.js')
	.filter(item => !['__tests__', 'index.js'].includes(item))
	.map(filename => {
		const index = filename.indexOf('.')
		const name = filename.substring(0, index > -1 ? index : filename.length)
		
		return { filename, name }
	})

export const loadModules = (dirname) => Promise.all(
	lsModules(dirname).map(({ filename, name }) => {
		let fullPath = path.join(dirname, filename)

		return lstat(fullPath)
			.then(stats => import(modulePath(stats.isDirectory() ? path.join(fullPath, 'index.js') : fullPath))
				.then(module => ({ name, module })))
	})
)