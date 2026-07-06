const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendBookingConfirmationEmail = async ({
    email,
    customerName,
    restaurantName,
    reservationDate,
    reservationTime,
    guests,
    tableNumber,
    paymentMethod,
    totalAmount,
    reservationId,
}) => {

    const mailOptions = {
        from: `"MealNest" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Booking Confirmation - MealNest",
        html: `
        <div style="font-family:Arial;padding:20px">

            <h2 style="color:#9c5a1a">
                Thank you for your booking!
            </h2>

            <p>Hello <strong>${customerName}</strong>,</p>

            <p>Your reservation has been confirmed.</p>

            <table>

            <tr>
                <td><strong>Restaurant:</strong></td>
                <td>${restaurantName}</td>
            </tr>

            <tr>
                <td><strong>Reservation ID:</strong></td>
                <td>${reservationId}</td>
            </tr>

            <tr>
                <td><strong>Date:</strong></td>
                <td>${reservationDate}</td>
            </tr>

            <tr>
                <td><strong>Time:</strong></td>
                <td>${reservationTime}</td>
            </tr>

            <tr>
                <td><strong>Guests:</strong></td>
                <td>${guests}</td>
            </tr>

            <tr>
                <td><strong>Table:</strong></td>
                <td>${tableNumber}</td>
            </tr>

            <tr>
                <td><strong>Payment:</strong></td>
                <td>${paymentMethod}</td>
            </tr>

            <tr>
                <td><strong>Total:</strong></td>
                <td>NPR ${totalAmount}</td>
            </tr>

            </table>

            <br>

            <p>
            We look forward to serving you.
            </p>

            <h3>MealNest Team</h3>

        </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendBookingConfirmationEmail
};