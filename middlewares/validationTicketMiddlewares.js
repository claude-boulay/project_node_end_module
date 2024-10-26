import zod from 'zod';

export const validTicket=(req,res,next)=>{
    const ticketSchema = zod.object({
        trainId: zod.string(),
        class: zod.number(),
        price: zod.number()
    });
    try{
        let classe=parseInt(req.body.classe);
        if(validClasse(classe)){
            const data = ticketSchema.parse({trainId:req.body.trainId,class:classe,price:parseFloat(req.body.price)});
            next();
        }else{
             res.status(400).send({error:"Invalid class"})
        }
       
    }catch(error){
        res.status(400).json(error);
    }
}

function validClasse(classe){
    if(classe==1 || classe==2){
        return true;
    }else{
        return false;
    }
}