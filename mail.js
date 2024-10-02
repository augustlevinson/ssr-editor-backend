const sgMail = require('@sendgrid/mail')

const mail = {
    sendEmail: async function sendEmail(body) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: body.recipient,
            from: process.env.SENDGRID_SENDER, // vår verifierade sender
            subject: `${body.sender} har bjudit in dig att redigera "${body.docTitle}"`,
            text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        }
        sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((e) => {
            console.error(e)
        })
    },

};

module.exports = mail;