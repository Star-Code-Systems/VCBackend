var _ = require('lodash');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
dotenv.config({ path: './.env' });

const nodemailer = require('nodemailer');

// Crea un nuevo objeto OAuth2
const myOAuth2Client = new OAuth2(
    "127834167321-e5ndlkr6o1579h34j0hn693a4q9mgdqc.apps.googleusercontent.com", // Identificador del cliente (Client ID)
    "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", // Secreto del cliente (Client Secret)
    'https://developers.google.com/oauthplayground' // URI de redireccionamiento
);

// Configura las credenciales del cliente OAuth2, que incluyen un token de actualización (refresh token)
myOAuth2Client.setCredentials({
    refresh_token: "1//04k1s7cdpoTauCgYIARAAGAQSNwF-L9IrrfK5qNlbS8yKblSxuJCg1e74oEbsK68ikuLxHz6Sn6a1q4JR0bWp9LDFACCNSN88IxU",// Token de actualización (refresh token)
});

const accessToken = myOAuth2Client.getAccessToken();

var config = {
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: 'alanrazo2000@gmail.com',
        clientId: "127834167321-e5ndlkr6o1579h34j0hn693a4q9mgdqc.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: "1//04k1s7cdpoTauCgYIARAAGAQSNwF-L9IrrfK5qNlbS8yKblSxuJCg1e74oEbsK68ikuLxHz6Sn6a1q4JR0bWp9LDFACCNSN88IxU",
        accessToken: accessToken, //access token variable we defined earlier
        
    },
}

var transporter = nodemailer.createTransport(config);

var defaultMail = {
    from: 'alanrazo2000@hotmail.com',
    text: 'test test'
}

const send = (to, subject, html) => {
    mail = _.merge({html}, defaultMail, to);

    transporter.sendMail(mail, (error, info) => {
        if (error) return console.log(error);
        console.log('mail sent', info.response);
    })
}

module.exports = {
    send
}