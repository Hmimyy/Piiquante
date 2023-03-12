const express = require('express')
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix+".png")
    }
})
const upload = multer({ storage: storage })


const app = express()

app.post('/profile', upload.single('avatar'), function (req, res, next) {
 
 
  res.send('ok, done')
})

app.post('/photos/upload', upload.array('photos', 12), function (req, res, next) {
  
})

const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
app.post('/cool-profile', cpUpload, function (req, res, next) {
 
})

app.listen(3000)