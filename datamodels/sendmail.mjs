import 'dotenv/config';
import  sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SETGRID_API);

const sendInvitationEmail = async (email, documentUrl, sender="") => {
    const msg = {
        to: email, // Recipient
        from: 'alexandra.berivoe@gmail.com', // Sender
        subject: `Invitation to Edit Document from ${sender}`,
        text: `You have been invited to edit the document at: ${documentUrl}`,
        html: `<strong>You have been invited to edit the document at: <a href="${documentUrl}">${documentUrl}</a></strong>`,
    };

    try {
        const response = await sgMail.send(msg);
        console.log('Email sent successfully:', response[0].statusCode); // Log the response status code
        return {
            success: true,
            statusCode: response[0].statusCode,
            message: 'Email sent successfully'
        };
    } catch (error) {
        console.error('Error sending email:', error.response.body); // Log the error details
        throw new Error(error.response.body.errors[0].message || 'Error sending email'); // Throw an error with a message
    }
};

export default sendInvitationEmail;
