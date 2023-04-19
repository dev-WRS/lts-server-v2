/* eslint-disable no-undef */
import path from 'path'
import express from 'express'
import session from 'express-session'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import configLoader from './config-loader.js'
import dbLoader from './db-loader.js'
import servicesLoader from './services-loader.js'
import routesLoader from './routes-loader.js'
import sessionStoreLoader from './session-store-loader.js'

import jwtInit from './jwt.js'
import mailerInit from './mailer.js'
import passportInit from './passport/index.js'
import * as errorHandlerModule from './error-handler.js'

const { errorHandler, ...HttpErrorsClasses } = errorHandlerModule

const createApp = async () => {
	const cwd = process.cwd()
	//added lines by oto
	if (cwd.includes('\\src')) {
	   cwd = cwd.replace('\\src', '')
	}
	const configDir = path.join(cwd, 'src', 'config')
	const dbDir = path.join(cwd, 'src', 'db')
	const servicesDir = path.join(cwd, 'src', 'services')
	const routesDir = path.join(cwd, 'src', 'routes')
	const sessionStorePath = path.join(cwd, 'src', 'session-store.js')

	const env = process.env.NODE_ENV || 'development'
	const isProduction = (env === 'production' || env === 'testing')

	const config = await configLoader(configDir, env)
	const db = await dbLoader(dbDir, config)
	const app = express()
	const sessionOpts = config.session ? {
		name: `${config.session.name}`,
		resave: false,

		saveUninitialized: true,
		
		secret: config.session.secret,
		cookie: { 
			secure: isProduction,
			maxAge: config.session.cookieMaxAge
		}
	} : null

	app.set('port', config.port || process.env.PORT)
	app.set('strict routing', true)

	app.use(cookieParser())
	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))

	if (isProduction) {
		app.set('trust proxy', 1)
		app.use(morgan('combined'))
	}

	if (sessionOpts) {
		sessionOpts.store = await sessionStoreLoader(sessionStorePath, config)
		app.use(session(sessionOpts))
	}

	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*')
		res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
		res.header('Access-Control-Allow-Headers', 'Authorization, Cache-Control, Origin, X-Requested-With, Content-Type, Accept')
		next()
	})

	if (config.staticPath) {
		app.use(config.staticPath.alias, express.static(path.join(process.cwd(), ...config.staticPath.path)))
	}

	const services = await servicesLoader(servicesDir, { 
		db, config 
	})
	const passport = passportInit({ config, services })
	const smtp = await mailerInit({ config, services })

	await routesLoader(routesDir, {
		app, passport, services, config, smtp
	})

	app.use(errorHandler)

	app.set('config', config)
	app.set('db', db)
	app.set('services', services)

	return app
}

export default createApp

export const start = (appPromise) => new Promise((resolve, reject) => {
	appPromise
		.then(app => {
			app.listen(app.get('port'), () => resolve(app))
		})
		.catch(reject)
})

export * as crypto from './crypto.js'
export * as utils from './utils.js'
export * as validator from './validator-request.js'
export * as middlewares from './middlewares/index.js'
export const errors = { ...HttpErrorsClasses }
export const jwt = jwtInit
