const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {isPasswordValid,validatorMessages} = require('../utils/passwordValidator');
const {isEmailValid} = require('../utils/emailValidator');


exports.signup = (req, res, next) => {
   
    // Vérification de la validité de l'email    
    if (!isEmailValid(req.body.email))
     { return res.status(400).json({message: 'adresse email non valide !'});  }
    // Vérification de la validité du mot de passe
     if (!isPasswordValid(req.body.password))
    { return res.status(400).json({ message: validatorMessages(req.body.password)});  }

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({//créer un nouvel utilisateur
            email: req.body.email,
            password: hash
            });
            user.save()
            .then(hash => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ message: error.message }));
        })
        .catch(error => res.status(500).json({ message: error.message }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                return res.status(401).json({ message: 'Mot de passe incorrect !' });
                }
                res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    process.env.TOKEN,
                    { expiresIn: '24h' }
                )
                });
            })
            .catch(error => res.status(500).json({ message: error.message }));
        })
        .catch(error => res.status(500).json({ message: error.message }));
};