export async function sendResendEmail(to: string, subject: string, body: string): Promise<void> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to,
      subject,
      html: `<p>${body}</p>`
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error('Failed to send email: ' + error);
  }
}
