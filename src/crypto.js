import crypto from 'crypto'
import { randomBytes, pbkdf2Sync } from 'crypto'

const iterations = 10000
const keylen = 512 //RECOMMENDED
const saltlen = 32 // RECOMMENDED
const digest = 'sha512'
const algorithm = 'aes-256-ctr'
const ivlen = 16

export const generateSecureCode = (length = 6) => {
	if (length) {
		const possible = '0123456789'
		let string = ''

		for (let i = 0; i < length; i++) {
			string += possible.charAt(Math.floor(Math.random() * possible.length))
		}
		return string
	}
	return
}
export const generateRandom = (length, encoding = 'hex') => randomBytes(length).toString(encoding)
export const generateSalt = () => generateRandom(saltlen)
export const generateHash = (value, salt) => pbkdf2Sync(value, salt, iterations, keylen, digest).toString('hex')
export const verify = (key, salt, hash) => (key && salt && hash) ? (generateHash(key, salt) === hash) : false

export const encrypt = (key, value) => {
	const iv = crypto.randomBytes(ivlen)
	const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv)

	let encrypted = cipher.update(value)
	encrypted = Buffer.concat([encrypted, cipher.final()])

	return iv.toString('hex') + '.' + encrypted.toString('hex')
}

export const decrypt = (key, value) => {
	const textParts = value.split('.')
	const iv = Buffer.from(textParts.shift(), 'hex')
	const encryptedText = Buffer.from(textParts.join('.'), 'hex')
	const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv)

	let decrypted = decipher.update(encryptedText)
	decrypted = Buffer.concat([decrypted, decipher.final()])

	return decrypted.toString()
}
