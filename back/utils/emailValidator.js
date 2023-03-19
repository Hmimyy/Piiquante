const validator = require('validator'); 


const isEmailValid = email => (validator.isEmail(email));

module.exports= {isEmailValid};