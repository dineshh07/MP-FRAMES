import crypto from "crypto";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                error: "Missing payment details"
            });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature =
            crypto
                .createHmac("sha256", secret)
                .update(body)
                .digest("hex");

        const isValid =
            expectedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({
                success: false,
                error: "Payment verification failed"
            });
        }

        return res.status(200).json({
            success: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            error: "Verification server error"
        });
    }
}
