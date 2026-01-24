import axios from "axios";
import API_BASE_URL from "../config/api";

const API_URL = `${API_BASE_URL}/api/payos`;

export const PayOSService = {
  createPayment: async (paymentData) => {
    try {
      const response = await axios.post(`${API_URL}/create`, {
        orderCode: paymentData.orderCode,
        amount: paymentData.amount,
        description: paymentData.description,
        returnUrl: paymentData.returnUrl,
        cancelUrl: paymentData.cancelUrl,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating PayOS payment:", error);
      throw error;
    }
  },

  verifyPayment: async (orderCode) => {
    try {
      const response = await axios.post(`${API_URL}/status`, {
        orderCode: orderCode,
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying PayOS payment:", error);
      throw error;
    }
  },
};
