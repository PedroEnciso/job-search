import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY!,
});

export async function sendNewJobEmail(
  job_title: string,
  company_name: string,
  user_name: string,
  user_email: string
) {
  try {
    const message_result = await mg.messages.create("jobscout.pro", {
      from: "JobScout admin <no_reply@jobscout.pro>",
      to: [user_email, "ped.enciso@gmail.com"],
      subject: "New job match from JobScout",
      text: "Testing some Mailgun awesomness!",
      html: `<h1>We found a new job for you at ${company_name}!</h1><p>Hi ${user_name}, we found the position ${job_title} at ${company_name} for you! Feel free to head to their careers page and submit your application. Thank you for using JobScout and good luck with your application!</p><p>The JobScout team</p>`,
    });
    console.log("message sent, this is the result:", message_result);
  } catch (error) {
    console.log("Issue sending email", error);
  }
}
