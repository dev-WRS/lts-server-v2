import { loadModules } from './utils.js'

const dbLoader = async (dirname, config = {}) => {
	const modules = await loadModules(dirname)

	return await modules.reduce(async (values, { module, name }) => {
		values[name] = await module.default({ config })
		return values
	}, {})
}
export default dbLoader