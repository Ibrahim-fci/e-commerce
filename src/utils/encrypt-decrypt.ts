require = require("esm")(module);
import bcrypt from "bcrypt";
let salt = bcrypt.genSaltSync(10);

const encryptText = async (pass: any) => {
  const hash = await bcrypt.hashSync(pass, salt);
  return hash;
};

//function to decrypt_password or ant text
const decryptText = async (pass: any, hash: any) => {
  const is_compared = await bcrypt.compareSync(pass, hash);
  return is_compared;
};

export { encryptText, decryptText };
