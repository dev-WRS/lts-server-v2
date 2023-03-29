import { Strategy as CustomStrategy } from 'passport-custom'
import { OAuth2Client } from 'google-auth-library'
import jwt from '../jwt.js'
import { HttpUnauthorizedError, HttpBadRequestError } from '../error-handler.js'

const strategy = 'googleAuth'

export default ({ passport, services, config }) => {
	const oauthClient = new OAuth2Client(config.GOOGLE_CLIENT_ID)
	const jwtApi = jwt()
	const { Auth } = services

	passport.use(strategy, new CustomStrategy(
		async (req, done) => {
			const { idToken } = req.body || {}

			if (idToken) {
				try {
					const ticket = await oauthClient.verifyIdToken({
						idToken,
						audience: [config.googleClientId]
					})
					const payload = ticket.getPayload()
					const email = payload['email']

					const user = await Auth.getOrCreateUserByEmail(email, { email, emailVerified: true })
					
					const token = jwtApi.sign({ id: user.id }, {
						issuer: config.issuer,
						subject: email, 
						audience: config.audience
					})

					return done(null, {
						id: user.id, email, token
					})
				}
				catch (error) {
					return done(new HttpUnauthorizedError('Invalid token'), false)
				}
			}
			else {
				return done(new HttpBadRequestError('Bad request'), false)
			}
		}
	))
}