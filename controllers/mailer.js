import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import {createRequire} from 'module'
const require=createRequire(import.meta.url);
const dotenv=require('dotenv');
dotenv.config();


// https://ethereal.email/create
// let nodeConfig = {
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: ENV.EMAIL, // generated ethereal user
//         pass: ENV.PASSWORD, // generated ethereal password
//     }
// }

// let transporter = nodemailer.createTransport(nodeConfig);

// let MailGenerator = new Mailgen({
//     theme: "default",
//     product : {
//         name: "Mailgen",
//         link: 'https://mailgen.js/'
//     }
// })

// /** POST: http://localhost:8080/api/registerMail 
//  * @param: {
//   "username" : "example123",
//   "userEmail" : "admin123",
//   "text" : "",
//   "subject" : "",
// }
// */
// export const registerMail = async (req, res) => {
//     const { username, userEmail, text, subject } = req.body;
//     console.log(username)

//     // body of the email
//     var email = {
//         body : {
//             name: username,
//             intro : text || 'Welcome to Daily Tuition! We\'re very excited to have you on board.',
//             outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
//         }
//     }

//     var emailBody = MailGenerator.generate(email);

//     let message = {
//         from : ENV.EMAIL,
//         to: userEmail,
//         subject : subject || "Signup Successful",
//         // html : emailBody
//         text:'this is a testing mail from Prayansh',
//     }

//     // send mail
//     transporter.sendMail(message)
//         .then(() => {
//             return res.status(200).send({ msg: "You should receive an email from us."})
//         })
//         .catch(error => res.status(500).send({ error:error.message }))


// }




const Email="sainibanti269@gmail.com";
const pass="hfknoocfvgzpjzvl";

let nodeconfig={
    host :"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:Email,
        pass:pass,
    },
}


let transpoter=nodemailer.createTransport(nodeconfig)

let mailgenerator=new Mailgen({
    theme:"default",
    product:{
        name:"Mailgen",
        link:"https://mailgen.js"
    }
})

export const registerMail =async(req,res)=>{
    const {username,useremail,text,subject}=req.body;

    // var email={
    //     body:{
    //         name:username,
    //         intro:text||"welcome to prayansh pc",
    //         outro:"Need help"
    //     }
    // }

    var email = {
        body : {
            name: username,
            intro : text || ' ',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }

    console.log(useremail)

    var emailbody=mailgenerator.generate(email);
    let message={
        from:Email,
        to:useremail,
        subject:subject||"subject of mail",
        html : emailbody,
    }
    console.log('happy')

    transpoter.sendMail(message).then(()=>{
        return res.status(200).send({msg:"email recived"})
    }).catch(err=>res.status(500).send({err:err.message}))
    
}

