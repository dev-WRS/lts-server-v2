import _ from 'lodash'
import { Router } from 'express'
import { loadModules } from './utils.js'

const prefix = '/'

const routesLoader = async (dirname, { app, config, ...options }) => {
	const defaultName = 'default'
	const modules = await loadModules(dirname)
	const defaultModule = modules.find(({ name }) => (name === defaultName))
	const { apiVersion } = config || {}
	let defaultOptions = {}

	if (defaultModule) {
		const { module } = defaultModule
		defaultOptions = await module.default({ app, config, ...options })
	}

	await Promise.all(modules
		.filter(({ name }) => (name !== defaultName))
		.map(async ({ name, module }) => {
			const router = await module.default(_.merge({}, options, {
				app, config,
				router: options.router || new Router(),
				...defaultOptions
			}))
			const paths = []

			if (apiVersion) paths.push(apiVersion)

			app.use(prefix + paths.join('/'), router)
		})
	)
}
export default routesLoader