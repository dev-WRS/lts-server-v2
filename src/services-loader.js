import { capitalized, loadModules } from './utils.js'

const servicesLoader = async (dirname, options = {}) => {
	const modules = await loadModules(dirname)

	return modules.reduce((values, { module, name }) => {
		values[capitalized(name)] = module.default(options)
		return values
	}, {})
}
export default servicesLoader