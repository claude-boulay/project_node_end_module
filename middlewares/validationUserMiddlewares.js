import zod from 'zod';

export const validUser =(req, res, next) => {
    let userSchema;

    if(req.url=="/register"){
      userSchema = zod.object({
        pseudo: zod.string().min(3).max(20),
        email: zod.string().email(),
        password: zod.string().regex(new RegExp(".*[A-Z].*"), "One uppercase character")
        .regex(new RegExp(".*[a-z].*"), "One lowercase character")
        .regex(new RegExp(".*\\d.*"), "One number")
        .regex(
          new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
          "One special character"
        )
        .min(8, "Must be at least 8 characters in length"),
        role: zod.string().min(3).max(20).optional(),
      });
    }

    if(req.method=="PUT"){
      userSchema = zod.object({
        pseudo: zod.string().min(3).max(20).optional(),
        email: zod.string().email().optional(),
        password: zod.string().regex(new RegExp(".*[A-Z].*"), "One uppercase character")
        .regex(new RegExp(".*[a-z].*"), "One lowercase character")
        .regex(new RegExp(".*\\d.*"), "One number")
        .regex(
          new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
          "One special character"
        )
        .min(8, "Must be at least 8 characters in length").optional(),
        role: zod.string().min(3).max(20).optional(),
      });
    }

    if(req.method=="PUT" || req.url=="/register"){
      try{
        userSchema.parse(req.body);  
      }catch(err){
        res.status(400).send(err.message);
        res.end();
      }
    } 
    next();
  }