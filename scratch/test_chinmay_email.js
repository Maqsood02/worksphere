import nodemailer from 'nodemailer';

async function testChinmayEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'worksphere.ac.in@gmail.com',
      pass: 'mbtfgehiiejzwtzk'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"WorkSphere Learning Curriculum" <worksphere.ac.in@gmail.com>',
      to: 'chinmaykv555@gmail.com',
      subject: '🎓 [WorkSphere] Learning Curriculum & Video Tutorial Assignment',
      html: `
        <div style="font-family: Arial, sans-serif; background: #0b0f19; color: #fff; padding: 30px; border-radius: 16px; max-width: 550px; margin: auto;">
          <h2 style="color: #38bdf8;">WorkSphere Learning Curriculum</h2>
          <p>Hello Chinmay K V,</p>
          <p>Your mentor has published a new learning curriculum module & video tutorial for your internship roadmap:</p>
          <div style="background: #131c2e; border-left: 4px solid #6366f1; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #a5b4fc; margin: 0 0 8px 0;">🎓 Convolutional Neural Networks (CNN) & Frontend Integration</h3>
            <p style="color: #cbd5e1; font-size: 13px; margin: 0;">Explore computer vision architectures, image preprocessing, and UI integrations.</p>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://worksphere-two.vercel.app/intern/dashboard" style="background: #6366f1; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; display: inline-block;">Open Intern Portal ↗</a>
          </div>
          <p style="font-size: 11px; color: #64748b; text-align: center;">WorkSphere Platform • worksphere.ac.in@gmail.com</p>
        </div>
      `
    });
    console.log('CHINMAY EMAIL DISPATCH RESULT:', info);
  } catch (err) {
    console.error('CHINMAY EMAIL ERROR:', err);
  }
}

testChinmayEmail();
