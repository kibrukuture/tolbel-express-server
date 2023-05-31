import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// verification mail sender
export default async function sendAccountVerificationSMS(code, url, name) {
  try {
    //transport obj
    let transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      port: 465,
      secure: true,
      auth: {
        user: process.env.TRANSPORTER_AUTH_MAIL,
        pass: process.env.TRANSPORTER_AUTH_PASS,
      },
    });

    // send sms code
    let info = await transporter.sendMail({
      from: '"tolbel" <admin@tolbel.com>',
      to: 'kibrukuture@gmail.com',
      subject: 'tolbel Account Verification',
      // text: 'Hello world?', // plain text body
      html: smsHtml(code, url, name),
    });

    return {
      status: 'ok',
      code: 200,
      to: info.accepted[0],
      from: info.envelope.from,
      messageId: info.messageId,
    };
  } catch (e) {
    // failed to send smsb
    return {
      message: e.message,
      code: e.responseCode,
      status: 'error',
    };
  }
}

(async () => {
  let res = await sendAccountVerificationSMS('456 358', 'hello world', 'James');

  console.log(res);
})('456 358', 'hello world', 'James');

function smsHtml(code = '456 358', url = 'tolbel.com/sigup', name) {
  return `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inconsolata&display=swap" rel="stylesheet">
      <title>Account Verification | tolbel</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          margin: 0;
          padding: 0;
       font-family: 'Inconsolata', monospace;
          font-size:1.3rem;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 40px;
          background-color: #f5f5f5;
        }
        h1 {
          color: #333;
          margin-top: 0;
        }
        p {
          color: #555;
        }
        #sms-code{
          font-size:1.5rem;
          font-weight:bolder;
          display:flex;
          align-items:center;
          justify-content:center;
         padding:1.5rem;

        }
        #verif-btn {
          display: inline-block;
          padding: 10px 20px;
          background-color: teal;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
        #kind-regards{
          padding:20px 0;
        }
        .bottom{
          color:gray;
        }
        #client-name{
          color:gray;
          font-weight:bolder;

        }
      </style>
    </head>
  <body>
      <div class="container">
        <h1>tolbel Account Verification</h1>
        <p id="client-name">Hello ${name},</p>
        <p>We are thrilled to welcome you to tolbel Messaging App! As a valued user, we want to ensure that your experience with our app is seamless and secure. This email serves as confirmation of the SMS verification process.</p>
        <p id='sms-code'><strong>Code:</strong> ${code}</p>
        <p><a style="display: inline-block; padding: 10px 20px; background-color: teal; color: white; text-decoration: none; border-radius: 4px;" href="${url}"  >Click here to verify your account</a></p>
        <p>If you haven't received the SMS code, please use the provided link to verify your account directly. Alternatively, you can enter the SMS code manually in the app.</p>
        <p  >Again, we extend a warm welcome to you as a new member of tolbel Messaging App. We look forward to seeing you connect and communicate with friends, family, and colleagues using our platform.</p>
        <p  id="kind-regards">Cheers,</p>
        <p class='bottom'>Kibru Kuture<br>Creator @tolbel<br>tolbel Messaging App</p>
      </div>
  </body>
  </html>
      `;
}
