const sgMail = require('@sendgrid/mail')

const mail = {
    sendEmail: async function sendEmail() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const msg = {
        to: 'caas23@student.bth.se', // Change to your recipient
        from: 'aule23@student.bth.se', // Change to your verified sender
        subject: 'Sending with SendGrid is Funky',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        }
        sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
    },

};

module.exports = mail;