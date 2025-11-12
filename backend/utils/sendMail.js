// const nodemailer = require("nodemailer")

// const sendEmail = async (userEmail, sub, msg) => {
//     const transport = nodemailer.createTransport({
//         host: process.env.NODEMAILER_HOST,
//         port: process.env.NODEMAILER_PORT,
//         sender: true,
//         secure: true,
//         auth: {
//             user: process.env.EMAIL_ID,
//             pass: process.env.APP_PASS
//         },
//         socketTimeout: 60000,
//     })
//     try {
//         console.log(userEmail)
//         const info = await transport.sendMail({
//             from: `"CodeDev"<${process.env.EMAIL_ID}>`,
//             to: userEmail,
//             subject: sub,
//             html: msg
//         })
//         console.log("Msg send: ", info.messageId)
//         return true
//     } catch (error) {
//         console.log(error)
//         return false;
//     }
// }

// module.exports = sendEmail






























const nodemailer = require("nodemailer");

const sendEmail = async (recipientEmail, subject, message, company) => {
    let email = process.env.EMAIL_ID;
    let appPass = process.env.APP_PASS;

    console.log("email company", company)

    let userEmail;
    let userAppPass;

    if (company?.nodemailerCredential.email && company?.nodemailerCredential.appPassword) {
        const decryptData = await company?.decryptCredentials()
        userEmail = decryptData.email
        userAppPass = decryptData.appPassword
    }

    if (userEmail && userAppPass) {
        // Create transport with user credentials
        const testTransport = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: process.env.NODEMAILER_PORT,
            secure: true,
            auth: {
                user: userEmail,
                pass: userAppPass,
            },
        });

        try {
            await testTransport.verify(); // Verify user credentials
            console.log("User-provided email and app password verified.");
            email = userEmail;
            appPass = userAppPass;
        } catch (error) {
            console.log("Invalid user credentials, falling back to .env credentials.");
        }
    }

    // Create transport with verified credentials
    const transport = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        secure: true,
        auth: {
            user: email,
            pass: appPass,
        },
        socketTimeout: 60000,
    });

    try {
        console.log("Sending email to:", recipientEmail);
        const info = await transport.sendMail({
            from: `"${(company)? company.name : 'CodeDev'}" <${email}>`,
            to: recipientEmail,
            subject: subject,
            html: message,
        });
        console.log("Message sent: ", info.messageId);
        return true;
    } catch (error) {
        console.log("Error sending email:", error);
        return false;
    }
};

module.exports = sendEmail;
