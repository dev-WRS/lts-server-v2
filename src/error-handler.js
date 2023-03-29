export class HttpServerError extends Error {
	constructor (message) {
		super(message)
		// Ensure the name of this error is the same as the class name
		this.name = this.constructor.name
		// This clips the constructor invocation from the stack trace.
		// It's not absolutely essential, but it does make the stack trace a little nicer.
		//  @see Node.js reference (bottom)
		Error.captureStackTrace(this, this.constructor)
	}
}

export class HttpBadRequestError extends HttpServerError {
	constructor (message) {
		super(message)
		this.statusCode = 400
	}
}

export class HttpUnauthorizedError extends HttpServerError {
	constructor (message) {
		super(message)
		this.statusCode = 401
	}
}

export class HttpValidationError extends HttpServerError {
	constructor (errors) {
		const message = 'Validation failed'
		super(message)
		this.statusCode = 400
		this.errors = errors
	}
}

export const errorHandler = (error, req, res, next) => {
	const { name, message, errors } = error
	let { code, statusCode } = error

	if (name === 'JsonWebTokenError' || name === 'TokenExpiredError') {
		statusCode = 401
	}
	
	statusCode = statusCode || 500
	code = code || 1000
	return res.status(statusCode).json((errors) ? {
		code, message, errors
	} : {
		code, message
	})
}