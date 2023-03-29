import _ from 'lodash'
import path from 'path'
import { modulePath } from './utils.js'

const configLoader = async (dirname, env) => {
	const { default: defaultConfig } = await import(modulePath(path.join(dirname, 'default.js')))
	let { default: config } = await import(modulePath(path.join(dirname, `${env}.js`)))

	config = _.merge(defaultConfig, config, { env })
	return config
}
export default configLoader