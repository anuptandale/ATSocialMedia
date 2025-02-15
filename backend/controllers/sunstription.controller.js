import Razorpay from "razorpay";
import crypto from 'crypto'
import { Payment } from "../models/payment.model.js";
export const subscriptionsController = async (req, res)=>{
    // try {
        const razorpay = new Razorpay({
            key_id:process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const {userId, amount} = req.body;
        console.log(req.body);
        const options = {
            amount: 999*100,
            currency:"INR",
            receipt:"receipt_order_1",
        };

        const subscription = await razorpay.orders.create(options);
        console.log(subscription)
        return res.status(200).json(subscription);
   
}

export const paymentVerification = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
      const userId = req.query.userId;
  console.log(userId, razorpay_order_id, razorpay_payment_id, razorpay_signature);
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
  
    const isAuthentic = expectedSignature === razorpay_signature;
   
    if (isAuthentic) {
      //Database comes here
  
      await Payment.create({
        userId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
  
      res.redirect(
        `http://localhost:3000/`
      );
    } else {
      res.status(400).json({
        success: false,
      });
    }
  };

  export const getkey = (req, res)=>{
    res.status(200).json({ key: process.env.RAZORPAY_KEY_SECRET })
  }


export const checkPayment = async(req, res)=>{
  try {
    const userId = req.query.userId; // Extract user ID from token (assuming JWT)
    const payment = await Payment.findOne({ userId });
    console.log(payment)
    if (payment) {
        return res.json({ isSubscribed: true });
    } else {
        return res.json({ isSubscribed: false });
    }
} catch (error) {
    return res.status(500).json({ message: "Server error", error });
}
}