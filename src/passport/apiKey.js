import { HeaderAPIKeyStrategy } from 'passport-headerapikey'
import lodash from 'lodash'
import { verify } from '../crypto.js'
import { HttpUnauthorizedError } from '../error-handler.js'

const { isArray } = lodash
const strategy = 'apikey'
const unauthorizedMessage = 'Invalid api key'

export default ({ passport, services }) => {
	const { ApiKey } = services

	passport.use(strategy, new HeaderAPIKeyStrategy({
		header: 'X-API-Key', 
		prefix: 'apikey '
	}, true,
	async (apikey, done, req) => {
		const point = apikey.indexOf('.')
		const prefix = apikey.substring(0, point)
        
		try {
			const apiKeyRecord = await ApiKey.getByPrefix(prefix)

			if (apiKeyRecord) {
				const salt = apiKeyRecord.salt
				const hash = apiKeyRecord.hash
				const key = apikey.substring(point + 1, apikey.length)
				
				req.scope = !isArray(req.scope) ? [req.scope] : req.scope

				if (verify(key, salt, hash) && apiKeyRecord.status == 'enabled' && req.scope.includes(apiKeyRecord.scope)) {
					return done(null, { apikey })
				} 
				else {
					done(new HttpUnauthorizedError(unauthorizedMessage), false) 
				}
			} 
			else {
				done(new HttpUnauthorizedError(unauthorizedMessage), false) 
			}
		}
		catch (error) {
			done(error, false)
		}  
	}))	
}