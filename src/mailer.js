import nodemailer from 'nodemailer'
import { HttpServerError } from './error-handler.js'
import { decrypt } from './crypto.js'

export default async ({ config, services }) => {
	const { sender } = config.smtp || {}
	const { Vault } = services
	let transporter

	if (Vault && (global.jestRuntime !== true)) {
		const mailer = await Vault.getByKey('mailer')
		const decrypted = decrypt(config.phrase, mailer.value)
		const { host, port, user, pass, secure } = JSON.parse(decrypted)

		transporter = nodemailer.createTransport({
			host, port, secure,
			auth: { user, pass }
		})
	}
	else {
		transporter = { sendMail: () => {
			return (global.jestRuntime !== true) ? 
				Promise.reject(new HttpServerError('Not Vault service configure to get nodemailer transporter configuration')) : 
				Promise.resolve(true) 
		} }
	}

	const sendEmail = ({ from, to, subject, text, html }) => {
		return transporter.sendMail({
			from: from || sender,
			to, subject, text, html
		})
	}

	return {
		sendEmail
	}
}