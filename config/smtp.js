require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);

module.exports = {
    sgMail,
    verifyMail: async (to, user, hash) => {
        try {
            const re = /\S+@\S+\.\S+/;
            if (re.test(to)){
                await sgMail.send({
                    from: 'support@runiv.in',
                    to: to,
                    templateId: 'd-a0358da784e6404ab74627ea514c8064',
                    dynamicTemplateData: {
                        first_name: user.name,
                        verify_link: `https://api.runiv.in/v1/auth/verify?token=${hash}`,
                    },
                    //replyTo: 'runiv.helper@gmail.com',
                });
            }
            else{
                console.log(`Invalid Email address. Mail not sent`);
            }
        } catch (error) {
            console.log(error);
        }
    },
    resetMail: async (to, user, token) => {
        try {
            const re = /\S+@\S+\.\S+/;
            if (re.test(to)){
                await sgMail.send({
                    from: 'support@runiv.in',
                    to: to,
                    templateId: 'd-665eda26fa624a8a9b5f847d4616449c',
                    dynamicTemplateData: {
                        first_name: user.name,
                        token: token,
                    },
                    //replyTo: 'runiv.helper@gmail.com',
                });
            }
            else{
                console.log(`Invalid Email address. Mail not sent`);
            }
        } catch (error) {
            console.log(error);
        }
    }
}