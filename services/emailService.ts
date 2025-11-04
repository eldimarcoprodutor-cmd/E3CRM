interface EmailPayload {
    to: string;
    subject: string;
    body: string;
}

/**
 * Simulates sending an email via an API.
 * In a real application, this would use a service like SendGrid, Mailgun, or AWS SES.
 * @param payload The email data.
 * @returns A promise that resolves with the success status.
 */
export const sendEmail = async (payload: EmailPayload): Promise<{ success: boolean }> => {
    console.log("--- SIMULATING EMAIL SEND ---");
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log("Body:", payload.body);
    console.log("-----------------------------");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a successful API call
    return { success: true };
};
