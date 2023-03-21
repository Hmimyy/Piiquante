const fs = require('fs');
const Sauces = require('../models/Sauces');

exports.createSauce = (req, res, next) => {
  const saucesObject = JSON.parse(req.body.sauce)
  delete saucesObject._id
  const sauces = new Sauces({
    ...saucesObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [' '],
    usersDisliked: [' '],

  })

  sauces.save().then(
    () => {
      res.status(201).json({
        message: 'Sauce crée avec succés !'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        message: error.message
      })
    }
  )
}

exports.getOneSauce = (req, res, next) => {
  Sauces.findOne({
    _id: req.params.id
  }).then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        message: error.message
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  // Récupération dans la BD de la sauce qui correspond à l'id dans la requête    
  Sauces.findOne({ _id: req.params.id })
    .then(sauce => {
      // Vérification de l'existence de la sauce            
      if (!sauce) {
        return res.status(404).json({
          message: "La sauce n'existe pas !"
        });
      }
      // Vérification si utilisateur = créateur de la sauce            
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({
          message: 'Requête non autorisée !'
        });
      }
      // Vérification présence image dans la requête
      let sauceObj;
      if (req.file) {
        // Vérification si utilisateur cherche à modifier userId de la sauce
        if (JSON.parse(req.body.sauce).userId && JSON.parse(req.body.sauce).userId !== sauce.userId) { 
          console.log("vous n'avez pas le droit de modifier l'userId de cette sauce !!!")          
          return res.status(403).json({ message: 'Requête non autorisée !' }); }                // Suppression de l'ancienne image du dossier images
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, error => {
          if (error) throw error;
          console.log('Ancienne image effacée !');
        });
        // Traitement de l'objet avec nouvelle image
        sauceObj = {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        };
      } else {
        // Traitement de l'objet sans image
        sauceObj = { ...req.body };
      }
      // Mise à jour de la sauce            
      Sauces.updateOne({
        _id: req.params.id
      }, {
        ...sauceObj,
        _id: req.params.id
      })
        .then(() => res.status(200).json({
          message: 'Sauce modifiée avec succés !'
        }))
        .catch(error => res.status(400).json({
          message: error.message
        }));
    }).catch(error => {
      res.status(404).json({ message: error.message });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId !== req.auth.userId) {

        res.status(404).json({
          message: "Pas de sauce avec cet id"
        });
      }
      else {
        if (sauce.userId !== req.auth.userId) {
          res.status(403).json({
            message: "Action non autorisée ! "
          });
        }
        else {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Sauces.deleteOne({ _id: req.params.id })
              .then(
                () => {
                  res.status(200).json({
                    message: 'Sauce supprimée !'
                  });
                }
              ).catch(
                (error) => {
                  res.status(400).json({
                    error: error.message
                  });
                }
              );
          })
        }
      }

    }
    )
};

exports.getAllSauces = (req, res, next) => {

  Sauces.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    })

    .catch(
      (error) => {
        res.status(400).json({
          message: error.message
        });
      }
    )
};

exports.likeDislikeSauce = (req, res, next) => {
  const like = req.body.like;

  if (like === 1) { // option j'aime
    Sauces.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId }, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Vous aimez la sauce !' }))

      .catch(
        (error) => {
          res.status(400).json({
            message: error.message
          });
        })

  }
  else if (like === -1) { // option j'aime pas
    Sauces.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId }, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Vous n\'aimez pas la sauce !' }))
      .catch(
        (error) => {
          res.status(400).json({
            message: error.message
          });
        })

  }
  else {    //option annulation du j'aime ou / j'aime pas
    Sauces.findOne({ _id: req.params.id })
      .then(sauce => {
        if (sauce.usersLiked.indexOf(req.body.userId) !== -1) {
          Sauces.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId }, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Vous n\'aimez plus la sauce ! ' }))
            .catch(
              (error) => {
                res.status(400).json({
                  message: error.message
                });
              })
        }
        else if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
          Sauces.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId }, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Vous aimez la sauce de nouveau ! ' }))
            .catch(
              (error) => {
                res.status(400).json({
                  message: error.message
                });
              })
        }
      })
      .catch(
        (error) => {
          res.status(400).json({
            message: error.message
          });
        })
  }
};