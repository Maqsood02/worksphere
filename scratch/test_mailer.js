import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'worksphere.ac.in@gmail.com',
    pass: 'mbtfgehiiejzwtzk'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('VERIFY ERROR:', error);
  } else {
    console.log('SERVER IS READY TO SEND MESSAGES');
    transporter.sendMail({
      from: '"WorkSphere Admin" <worksphere.ac.in@gmail.com>',
      to: 'maqsoodmd.ac.in@gmail.com',
      subject: 'Test Task Verification Mail',
      text: 'Testing SMTP connection directly from Node.js Nodemailer'
    }).then(info => {
      console.log('EMAIL SENT INFO:', info);
    }).catch(err => {
      console.error('SEND ERROR:', err);
    });
  }
});
