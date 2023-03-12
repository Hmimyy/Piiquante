const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN);
        const userId = decodedToken.userId;
        req.auth = {userId}
       
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Utisateur non valide !';
        } else {
            next();
        }
    } catch(error) {
        res.status(401).json({
            message:error.message | 'Requête invalide !'
        });
    }
};