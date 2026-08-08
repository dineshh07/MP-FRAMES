export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                error: "Amount is required"
            });
        }

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return res.status(500).json({
                error: "Razorpay environment variables are missing"
            });
        }

        const auth = Buffer
            .from(`${keyId}:${keySecret}`)
            .toString("base64");

        const response = await fetch(
            "https://api.razorpay.com/v1/orders",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Basic ${auth}`
                },
                body: JSON.stringify({
                    amount: Math.round(Number(amount) * 100),
                    currency: "INR",
                    receipt: `mpframes_${Date.now()}`
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

       return res.status(200).json({
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    keyId: keyId
});

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to create Razorpay order"
        });
    }
}
