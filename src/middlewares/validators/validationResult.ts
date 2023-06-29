import { validationResult } from "express-validator";

const validatorMiddeleware = (req: any, res: any, nex: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  nex();
};

export default validatorMiddeleware;
