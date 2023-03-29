/* eslint-disable no-undef */

import fs from 'fs'
import path from 'path'
import { Strategy as StrategyJwt, ExtractJwt } from 'passport-jwt'
import { HttpUnauthorizedError } from '../error-handler.js'

const strategy = 'jwt'

export default ({ passport, config }) => {
	// TODO: get certs by env ?
	const secretOrKey = fs.readFileSync(path.join(process.cwd(), 'certs', 'jwt_public.pem'), 'utf8')
	const jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()

	passport.use(strategy, new StrategyJwt({
		secretOrKey,
		issuer: config.issuer,
		ignoreExpiration: false,
		jwtFromRequest,
		passReqToCallback: true
	}, (req, payload, done) => {
		if (payload) {
			const token = jwtFromRequest(req)
			const id = payload.id
			const email = payload.sub

			return done(null, {
				id, email, token
			})
		}
		return done(new HttpUnauthorizedError('Invalid token'), false)
	}))
}