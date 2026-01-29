import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email for notifications (defaults to your email)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'josh@handcraftedcopy.com';

/**
 * Send notification emails to pod members about a new LinkedIn post
 * @param {Object} poster - The member who posted
 * @param {string} poster.name - Poster's name
 * @param {Array} recipients - Array of member objects to notify
 * @param {string} linkedinUrl - URL to the LinkedIn post
 * @param {string} note - Optional note from the poster
 */
export async function sendPostNotification(poster, recipients, linkedinUrl, note) {
  const results = [];

  for (const recipient of recipients) {
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
        from: 'EngagePod <hello@send.morebetterclients.com>',
        to: recipient.email,
        subject: `Support ${poster.name}'s new LinkedIn post`,
        text: emailBody,
      });

      if (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        results.push({ success: false, email: recipient.email, error });
      } else {
        results.push({ success: true, email: recipient.email, id: data.id });
      }
    } catch (err) {
      console.error(`Error sending email to ${recipient.email}:`, err);
      results.push({ success: false, email: recipient.email, error: err.message });
    }

    // Delay between sends to avoid Resend rate limit (2 req/sec)
    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    total: recipients.length,
    successful,
    failed,
    results
  };
}

/**
 * Send notification to admin when a new member registers
 * @param {Object} member - The new member
 * @param {string} member.name - Member's name
 * @param {string} member.email - Member's email
 */
export async function sendAdminNewMemberNotification(member) {
  const emailBody = `New member joined EngagePod!

Name: ${member.name}
Email: ${member.email}

- EngagePod`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'EngagePod <hello@send.morebetterclients.com>',
      to: ADMIN_EMAIL,
      subject: `New EngagePod member: ${member.name}`,
      text: emailBody,
    });

    if (error) {
      console.error('Failed to send admin notification:', error);
      return { success: false, error };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error('Error sending admin notification:', err);
    return { success: false, error: err.message };
  }
}
