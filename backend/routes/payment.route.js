import { protectRoute } from "../middleware/protectRoute.js";
import express from 'express'
import { checkPayment, getkey, paymentVerification, subscriptionsController } from "../controllers/sunstription.controller.js";

const router = express.Router();

router.post("/subscription", protectRoute ,subscriptionsController)
router.get("/getkey", protectRoute ,getkey)
router.post("/paymentverification", paymentVerification);
router.get("/check-payment",protectRoute, checkPayment);


export default router;