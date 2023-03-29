import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

const dirname = process.cwd()

const expiresIn = '24h'
const algorithm = 'RS256'

export default (config) => {
	// TODO: get certs by env ?
	const privateKey = fs.readFileSync(path.join(dirname, 'certs', 'jwt_private.pem'), 'utf8')
	const publicKey = fs.readFileSync(path.join(dirname, 'certs', 'jwt_public.pem'), 'utf8')

	return {
		expiresIn,
		algorithm,
		publicKey,
		sign: (payload, opts) => {
			opts = opts || {}
			const signOptions = {
				issuer: opts.issuer,
				subject: opts.subject,
				audience: opts.audience,
				expiresIn: opts.expiresIn || expiresIn, 
				algorithm
			}
			return (payload) ? jwt.sign(payload, privateKey, signOptions) : payload
		},
		verify: (token, opts) => {
			opts = opts || {}
			const verifyOptions = {
				issuer: opts.issuer,
				subject: opts.subject,
				audience: opts.audience,
				expiresIn: opts.expiresIn || expiresIn, 
				algorithm: [algorithm]
			}

			try {
				return jwt.verify(token, publicKey, verifyOptions)
			}
			catch (error) {
				return false
			}
		}
	}
}