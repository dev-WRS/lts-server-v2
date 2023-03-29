import fs from 'fs'
import { modulePath, lstat } from './utils.js'

const sessionStoreLoader = async (fullPath, config = {}) => {
	if (fs.existsSync(fullPath)) {
		const module = await import(modulePath(fullPath))
		return await module.default({ config })
	}
	return null
}
export default sessionStoreLoader