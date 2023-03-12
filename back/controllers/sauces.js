const fs = require('fs');
const Sauces = require('../models/Sauces');

exports.createSauce = (req, res, next) => {
  const saucesObject = JSON.parse(req.body.sauce)
  delete saucesObject._id
  const sauces = new Sauces({
    ...saucesObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  
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
  const saucesObject = req.file 
    ? {
      ...JSON.parse(req.body.sauces), 
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }
    : {...req.body}
 
  Sauces.updateOne({_id: req.params.id}, {...saucesObject, _id: req.params.id}).then(
    () => {
      res.status(201).json({
        message: 'Sauce modifiée avec succés!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        message: error.message
      });
    }
  );
};

exports.deleteSauce = (req, res, next) => {
    Sauces.findOne({ _id: req.params.id }).then(
        (sauce) => {
            if (!sauce) {
               
                res.status(404).json({
                    message: "Pas de sauce avec cet id"
                });
            }
            else {
              if (sauce.userId !== req.auth.userId) {
                res.status(403).json({
                    message : "Action non autorisée ! "
                });
            }
            else{
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
    }
  ).catch(
    (error) => {
      res.status(400).json({
        message: error.message
      });
    }
  );
};