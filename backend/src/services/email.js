import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send notification emails to pod members about a new LinkedIn post
 * @param {Object} poster - The member who posted
 * @param {string} poster.name - Poster's name
 * @param {Array} recipients - Array of member objects to notify
 * @param {string} linkedinUrl - URL to the LinkedIn post
 * @param {string} note - Optional note from the poster
 */
export async function sendPostNotification(poster, recipients, linkedinUrl, note) {
  const emailPromises = recipients.map(async (recipient) => {
    const noteSection = note
      ? `\n"${note}"\n`
      : '';

    const emailBody = `Hey ${recipient.name}!

${poster.name} just published a new LinkedIn post and could use your support.
${noteSection}
Engage now: ${linkedinUrl}

The first 30-60 minutes matter most for reach. A quick comment or reaction makes a big difference!

- EngagePod`;

    try {
      const { data, error } = await resend.emails.send({
        from: 'EngagePod <onboarding@resend.dev>',
        to: recipient.email,
        subject: `${poster.name} just posted on LinkedIn`,
        text: emailBody,
      });

      if (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        return { success: false, email: recipient.email, error };
      }

      return { success: true, email: recipient.email, id: data.id };
    } catch (err) {
      console.error(`Error sending email to ${recipient.email}:`, err);
      return { success: false, email: recipient.email, error: err.message };
    }
  });

  const results = await Promise.all(emailPromises);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    total: recipients.length,
    successful,
    failed,
    results
  };
}
