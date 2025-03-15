export const SAMPLE_PARTNERSHIP_EMAIL = `<div style="font-family: Arial, sans-serif; padding: 10px; line-height: 1.6;">
  <p>Hi {{businessName}},</p>
  <p>I hope you're doing well.</p>
  <p>I'm reaching out to invite you to an exclusive partnership opportunity as we prepare to launch Broadcastly, our powerful WhatsApp broadcasting platform built to help businesses drive engagement, automate messaging, and scale their marketing efforts.</p>
  <p>As we finalize our product launch, we're opening up partnership slots for select marketing agencies to be part of our growth. This is your chance to offer a game-changing WhatsApp marketing tool to your clients while earning commissions on every sale.</p>
  <p><strong>Why Partner with Us?</strong></p>
  <ul>
    <li>✅ Monetize Your Network – Earn recurring commissions on every client you refer.</li>
    <li>✅ Early Access to a Cutting-Edge WhatsApp Tool – Be among the first agencies to offer this solution.</li>
    <li>✅ Co-Branded Sales Materials & Full Support – We equip you with everything needed to sell and onboard clients smoothly.</li>
    <li>✅ Launch Advantage – Get in early and establish yourself as a WhatsApp marketing expert.</li>
  </ul>
  <p><strong>How It Works:</strong></p>
  <ol>
    <li>1️⃣ You introduce Broadcastly to your clients.</li>
    <li>2️⃣ Clients sign up via your referral link or direct sales.</li>
    <li>3️⃣ You earn commissions on their subscriptions (up to 30% per client).</li>
    <li>4️⃣ We handle training, onboarding, and support for your clients.</li>
  </ol>
  <p><strong>Exclusive Pre-Launch Partner Benefits:</strong></p>
  <ul>
    <li>🔹 Higher Commission Tiers – Early partners get priority rates on commissions.</li>
    <li>🔹 Early Access & Insights – Test the platform before the official launch.</li>
    <li>🔹 Co-Marketing & Exposure – Be featured as one of our pioneering agency partners.</li>
  </ul>
  <p>Would you be open to a quick call this week to explore how we can work together? Let me know a time that works for you!</p>
  <p>Looking forward to partnering with you!</p>
  <p>Best,<br>
  {{businessName}}<br>
  Founder, Broadcastly<br>
  business@broadcastly.io<br>
  www.broadcastly.io</p>
</div>`

export const SAMPLE_WELCOME_EMAIL = `<div style="font-family: Arial, sans-serif; padding: 10px; line-height: 1.6;">
  <p>Welcome, {{businessName}}!</p>
  <p>Thank you for joining our platform. We're excited to have you on board!</p>
  <p>Here are a few things you can do to get started:</p>
  <ul>
    <li>Complete your profile</li>
    <li>Explore our features</li>
    <li>Connect with other users</li>
  </ul>
  <p>If you have any questions, feel free to reach out to our support team.</p>
  <p>Best regards,<br>
  The Team</p>
</div>`

export const SAMPLE_NEWSLETTER = `<div style="font-family: Arial, sans-serif; padding: 10px; line-height: 1.6;">
  <p>Hello {{businessName}},</p>
  <p>Here's your monthly newsletter with the latest updates:</p>
  <h2 style="color: #4a5568; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Latest News</h2>
  <p>We've launched several new features this month that we're excited to share with you:</p>
  <ul>
    <li>Enhanced reporting dashboard</li>
    <li>New integration options</li>
    <li>Improved user interface</li>
  </ul>
  <h2 style="color: #4a5568; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Upcoming Events</h2>
  <p>Join us for our upcoming webinar on best practices for email marketing.</p>
  <p>Date: June 15, 2023<br>
  Time: 2:00 PM EST</p>
  <p>We hope to see you there!</p>
  <p>Best regards,<br>
  The Marketing Team</p>
</div>`

export const EMAIL_TEMPLATES = [
    {
        name: "Partnership Invitation",
        subject: "Exclusive Partnership Opportunity – Earn Commissions with WhatsApp Broadcasting",
        content:
            "Hi {{businessName}}, I hope you're doing well. I'm reaching out to invite you to an exclusive partnership opportunity...",
        html: SAMPLE_PARTNERSHIP_EMAIL,
    },
    {
        name: "Welcome Email",
        subject: "Welcome to Our Platform, {{businessName}}!",
        content: "Welcome, {{businessName}}! Thank you for joining our platform. We're excited to have you on board!",
        html: SAMPLE_WELCOME_EMAIL,
    },
    {
        name: "Monthly Newsletter",
        subject: "{{businessName}} - Your Monthly Newsletter",
        content: "Hello {{businessName}}, Here's your monthly newsletter with the latest updates...",
        html: SAMPLE_NEWSLETTER,
    },
]

