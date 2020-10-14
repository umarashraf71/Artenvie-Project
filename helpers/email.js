const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'artenvieartgallery@gmail.com',
    pass: 'Pass@7222',
  },
});

// const mailOptions = {
// 	from: 'zeshan7061@gmail.com',
// 	to:
// 		'zeshan7061@gmail.com, omerashraf7222@gmail.com, goldenmaddy7222@gmail.com ',
// 	subject: 'Subject of your email',
// 	html: '<p>Your html here</p>',
// };

module.exports = function sendEmail(
  from = 'artenvieartgallery@gmail.com',
  to,
  subject,
  html
) {
  transporter.sendMail(
    {
      from,
      to,
      subject,
      html,
    },
    function (err, info) {
      if (err) console.log(err);
    }
  );
};

//console.log('Message sent: %s', info.messageId);
//console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
