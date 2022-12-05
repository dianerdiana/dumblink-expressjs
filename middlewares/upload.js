const multer = require('multer');

exports.image = (imageFile) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''));
    },
  });

  const fileFilter = (req, file, cb) => {
    if (file.filename === imageFile) {
      if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = {
          message: 'Only image files are allowed',
        };
        return cb(new Error('Only image files are allowed!'), false);
      }
    }
    cb(null, true);
  };

  const sizeInMb = 10;
  const maxSize = sizeInMb * 1000 * 1000;

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
    },
  }).single(imageFile);

  return (req, res, next) => {
    upload(req, res, function (error) {
      if (req.fileValidationError) {
        return res.status(400).send(req.fileValidationError);
      }

      if (!req.file && !error) {
        return res.status(400).send({
          message: 'Please select your image to upload',
        });
      }

      if (error) {
        if (error.code == 'LIMIT_FILE_SIZE') {
          return res.status(400).send({
            message: `Max file size is ${sizeInMb}Mb`,
          });
        }
        return res.status(400).send(error);
      }
      return next();
    });
  };
};
