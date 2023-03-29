import { Router } from 'express'
import { validationResult } from 'express-validator'

import { HttpValidationError } from './error-handler.js'

export const validatorRequest = validators => {
	const validator = new Router()
    
	validator.use(validators)
	return [validator, (req, res, next) => {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			throw new HttpValidationError(errors.array())
		}
		next()
	}]
}

export * from 'express-validator'