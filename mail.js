const sgMail = require('@sendgrid/mail')

const mail = {
    sendEmail: async function sendEmail(body) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
            to: body.recipient,
            from: process.env.SENDGRID_SENDER,
            subject: `${body.sender} har bjudit in dig att redigera "${body.title}"`,
            text: 'and easy to do anywhere, even with Node.js',
            html: `<p>Du har blivit inbjudan att redigera ${body.title} i SSR Editor.</p>
                    <a href="${body.url}">Acceptera inbjudan</a>
                    <p>Vänligen</p>
                    <p><i>SSR Editor</i></p>`,
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