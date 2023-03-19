const passwordValidator = require('password-validator');


const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)                         // Minimum de 8 caractères    
.is().max(50)                       // Maximum de 100 caractères
.has().lowercase()                   // Doit contenir des minuscules
.has().uppercase(1)                  // Doit contenir au moins 1 majuscule
.has().digits(2)                     // Doit contenir au moins 2 chiffres
.has().symbols(1)                    // Doit contenir au moins un caractères spécial
.has().not().spaces()                // Should not have spaces


const isPasswordValid = password => (passwordSchema.validate(password));

const validatorMessages = password => {

    let messages="";

    const probleme = passwordSchema.validate(password, {details:true});

    probleme.forEach(element => {
        messages += element.message + " / ";
    });
  return messages;
}

module.exports = {isPasswordValid,validatorMessages};