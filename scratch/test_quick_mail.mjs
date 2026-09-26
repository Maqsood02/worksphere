import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'worksphere.ac.in@gmail.com', pass: 'ebkuthdantiiwqzf' }
});

async function main() {
  const info = await transporter.sendMail({
    from: '"WorkSphere Test" <worksphere.ac.in@gmail.com>',
    to: 'maqsoodmd.ac.in@gmail.com',
    subject: 'WorkSphere SMTP Test',
    text: 'Test mail from node'
  });
  console.log('SEND SUCCESS:', info.messageId);
}

main().catch(console.error);
