export const withScope = scope => (req, res, next) => { 
	req.scope = scope; next() 
}