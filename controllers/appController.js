import UserModel from '../model/User.model.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';

/** middleware for verify user */
export async function verifyUser(req, res, next){
    try {
        
        const { username } = req.method == "GET" ? req.query : req.body;
        console.log(username)

        // check the user existance
        let exist = await UserModel.findOne({ username });
        if(!exist) return res.status(404).send({ error : "Can't find User!"});
        next();

    } catch (error) {
        return res.status(404).send({ error: "Authentication Error"});
    }
}


/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req,res){

    ///my code

    try {
        const data=req.body;

        //check username is exist or not
       let userbyusername=await UserModel.findOne({username:data.username})
       if(userbyusername)
       {
        res.status(401).send('username is already exist')
        return;
        }

       //cehck for email
        let userbyemail=await UserModel.findOne({email:data.email})
       if(userbyemail)
       {
        res.status(401).send('email is already exist')
        console.log(userbyemail)
        return;
       }

       //hash password and set hashpassword to password
        let haspass=await bcrypt.hash(data.password,10);
       if(!haspass)
       {
        res.status(500).send({
        error : "Enable to hashed password"
        })
        return;
       }
       data.password=haspass

       //create objct of user and save
        const user=new UserModel(data);
        const save=await user.save();


    //send responce
        res.status(201).send({msg:"successfully registered"})
       } catch (error) {
            if(error.name=='ValidationError')
                res.status(401).send({message:'data is not valid',error:error.message})
            else
            res.status(500).send({msg:'Internal Server Error',errormsg:error.message});
       }

}


/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req,res){
   
    const { username, password } = req.body;

    //my code
    try {
       const user=await UserModel.findOne({username:username})
       if(!user)
       {
        res.status(402).send('user not found');
        return;
       }
       const ans=await bcrypt.compare(password,user.password);
       if(!ans)
       {
        res.status(401).send('password not match')
        return;
       }
       const token = jwt.sign({
           userId: user._id,
           username : user.username
         }, ENV.JWT_SECRET , { expiresIn : "24h"});


         res.status(200).send({msg:"successfully login",token:token})
       
        
    } catch (error) {

        res.status(500).json('Internal server error')
        
    }

}


/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req,res){
    
    try{
        const user_name=req.params.username;
        if(!user_name)
        {
            res.status(402).send({message:'Enter the username'})
            return;
        }
        let user=await UserModel.findOne({username:user_name})
        if(!user)
        {
            res.status(402).send({message:'User not exist with this username'})
            return;
        }
      const {password,...userdata}=user
        res.status(201).send(userdata)
    }catch (error) {
       
        res.status(500).send({msg:'Internal Server Error',err:error.message});
       }

}


/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req,res){
   
    //my code

    try {

        const username=req.body.username;
       let user =await UserModel.findOne({username:username})
       if(!user)
       {
        res.status(401).send('user not exist')
        return;
        }
        const updatedinfo=await UserModel.updateOne({username:username},req.body);
        if(updatedinfo.modifiedCount!=0)
        {
        res.status(201).send({message:"successfully updated"})
        return;
        }
        res.status(201).send("already updated")
        
    } catch (error) {
        if(error.name==='MongoError'&&error.code===11000)
        {
            res.status(401).send({message:'data is not valid',error:error.message})
            return
        }
        res.status(500).send('Internal Server Error');
       }  
    }


/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req,res){
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false})
    res.status(201).send({ code: req.app.locals.OTP })
}


/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req,res){
    const { code } = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ msg: 'Verify Successsfully!'})
    }
    return res.status(400).send({ error: "Invalid OTP"});
}


// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req,res){
    console.log(req.app.locals.resetSession)
   if(req.app.locals.resetSession){
        return res.status(201).send({ flag : req.app.locals.resetSession})
   }
   return res.status(440).send({error : "Session expired!"})
}


// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req,res){
   

    try {
        if(!req.app.locals.resetSession) return res.status(440).send({error : "Session expired!"});
        const {username,password}=req.body;

       const hashpass=await bcrypt.hash(password,10);
       if(!hashpass)
       {
        res.status(400).send({error : "Enable to hashed password"})
        return;
       }
       const updateinfo= await UserModel.updateOne({username:username},{password:hashpass})
       req.app.locals.resetSession = false;
       res.status(201).send('password successfully reset')
       

    } catch (error) {
        if(error.name==='MongoError'||error.code==='E11000')
        {
            res.status(401).send({message:'data is not valid',error:error.message})
        }
        res.status(500).send({error:error.message});
       }  
    }



