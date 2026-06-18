const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    console.log('authenticateToken middleware reached'); // 新增日志
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('Token from header:', token); // 新增日志

    if (token == null) {
        console.log('Token not found, returning 401'); // 新增日志
        return res.sendStatus(401); 
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('JWT verification failed:', err.message, ', returning 403'); // 新增日志
            return res.sendStatus(403);
        }
        console.log('JWT verified successfully, user:', user); // 新增日志
        req.user = user;
        next();
    });
}
module.exports = authenticateToken;