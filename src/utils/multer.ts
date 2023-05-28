import multer from "multer";
import path from "path";

//Setting storage engine
const profileStorageEngine = multer.diskStorage({
  destination: "./public/images/profiles",
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

const checkFileType = function (file: any, cb: any) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/; //check extension names

  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};

//initializing  multer
const profileUpload = multer({
  storage: profileStorageEngine,
  //   limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

//Setting storage engine
const productStorageEngine = multer.diskStorage({
  destination: "./public/images/products",
  filename: (req: any, file: any, cb: any) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

//initializing  multer
const productUpload = multer({
  storage: productStorageEngine,
  //   limits: { fileSize: 10000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

export { profileUpload, productUpload };
