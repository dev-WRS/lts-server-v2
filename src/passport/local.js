import { Strategy as LocalStrategy } from 'passport-local'
import { verify } from '../crypto.js'
import jwt from '../jwt.js'
import { HttpUnauthorizedError } from '../error-handler.js'

export default ({ passport, services, config }) => {
	const jwtApi = jwt()
	const { Auth } = services

	passport.use('login', new LocalStrategy({
		usernameField: 'email',
		passReqToCallback: true
	}, async (req, email, password, done) => {
		try {
			const user = await Auth.getUserByEmail(email) 
			
			if (user && verify(password, user.salt, user.hash)) {
				const token = jwtApi.sign({ id: user.id }, {
					issuer: config.issuer,
					subject: email, 
					audience: config.audience
				})
				
				return done(null, {
					id: user.id,
					email, token
				})
			}
			done(new HttpUnauthorizedError('Incorrect email and/or password'), false) 
		}
		catch (error) {
			done(error, false)
		}
	}))

	passport.use('emailVerify', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'secureCode',
		passReqToCallback: true
	}, async (req, email, secureCode, done) => {
		try {
			const user = await Auth.getUserByCode({ email, secureCode })

			if (user) {
				const token = jwtApi.sign({ id: user.id }, {
					issuer: config.issuer,
					subject: email, 
					audience: config.audience
				})

				return done(null, {
					id: user.id,
					email, token
				})
			}
			done(new HttpUnauthorizedError('Incorrect email and/or code'), false)
		}
		catch (error) {
			done(error, false)
		}
	}))
}