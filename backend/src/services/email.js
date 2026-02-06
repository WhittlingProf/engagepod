const BREVO_API_KEY = process.env.BREVO_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'josh@handcraftedcopy.com';

const SENDER = { name: 'EngagePod', email: 'hello@send.morebetterclients.com' };

async function sendEmail(to, subject, textContent) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: to }],
      subject,
      textContent,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Brevo API error: ${res.status}`);
  }

  return data;
}

/**
 * Send notification emails to pod members about a new LinkedIn post
 */
export async function sendPostNotification(poster, recipients, linkedinUrl, note) {
  const results = [];

  for (const recipient of recipients) {
    const noteSection = note ? `\n"${note}"\n` : '';

    const emailBody = `Hey ${recipient.name}!

${poster.name} just published a new LinkedIn post and could use your support.
${noteSection}
Engage now: ${linkedinUrl}

The first 30-60 minutes matter most for reach. A quick comment or reaction makes a big difference!

- EngagePod`;

    try {
      const data = await sendEmail(
        recipient.email,
        `Support ${poster.name}'s new LinkedIn post`,
        emailBody
      );
      results.push({ success: true, email: recipient.email, id: data.messageId });
    } catch (err) {
      console.error(`Failed to send to ${recipient.email}:`, err.message);
      results.push({ success: false, email: recipient.email, error: err.message });
    }

    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  return { total: recipients.length, successful, failed, results };
}

/**
 * Send an email to all active pod members
 */
export async function sendBroadcastEmail(recipients, subject, message) {
  const results = [];

  for (const recipient of recipients) {
    const emailBody = `Hey ${recipient.name}!\n\n${message}\n\n- EngagePod`;

    try {
      const data = await sendEmail(recipient.email, subject, emailBody);
      results.push({ success: true, email: recipient.email, id: data.messageId });
    } catch (err) {
      console.error(`Failed to send to ${recipient.email}:`, err.message);
      results.push({ success: false, email: recipient.email, error: err.message });
    }

    if (recipients.indexOf(recipient) < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  return { total: recipients.length, successful, failed, results };
}

export async function sendAdminNewMemberNotification(member) {
  const emailBody = `New member joined EngagePod!

Name: ${member.name}
Email: ${member.email}

- EngagePod`;

  try {
    const data = await sendEmail(
      ADMIN_EMAIL,
      `New EngagePod member: ${member.name}`,
      emailBody
    );
    return { success: true, id: data.messageId };
  } catch (err) {
    console.error('Error sending admin notification:', err.message);
    return { success: false, error: err.message };
  }
}
