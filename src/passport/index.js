import { Passport } from 'passport'
import jwtStrategy from './jwt.js'
import apiKeyStrategy from './apiKey.js'
import localStrategy from './local.js'
import googleStrategy from './googleAuth.js'

export default ({ config, services }) => {
	const passport = new Passport()

	jwtStrategy({ passport, config, services })
	apiKeyStrategy({ passport, config, services })
	localStrategy({ passport, config, services })
	googleStrategy({ passport, config, services })

	return passport
}