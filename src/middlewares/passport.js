import { HttpUnauthorizedError } from '../error-handler.js'

const reqWithUser = (user, req, res) => {
	req.user = user
}

const processResponse = {
	login: reqWithUser,
	emailVerify: reqWithUser,
	jwt: reqWithUser,
	googleAuth: reqWithUser
}

export const withPassport = (passport, config) => (strategy, options) => async (req, res, next) => {
	const authenticate = (strategy, options) => (req, res, next) => 
		new Promise((resolve, reject) => {
			passport.authenticate(strategy, options, (error, info, challenge, status) => {
				if (error) {
					return reject(new HttpUnauthorizedError(error.message))
				}
				else if (!info && challenge) {
					return reject(new HttpUnauthorizedError(challenge.message))
				}
				return resolve(info)
			})(req, res, next)
		})

	try {
		const info = await authenticate(strategy, options)(req, res, next)

		processResponse[strategy] && processResponse[strategy](info, req, res)
		next()
	}
	catch (error) {
		next(error)
	}
}