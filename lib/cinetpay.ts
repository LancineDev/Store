import "server-only";

export interface CreateCinetPayPaymentParams {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
}

export interface CreateCinetPayPaymentResult {
  payment_url: string;
  status: string;
  transaction_id: string;
}

const CINETPAY_API_URL = "https://api-checkout.cinetpay.com/v2/payment";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function createCinetPayPayment({
  amount,
  orderId,
  customerName,
  customerEmail,
}: CreateCinetPayPaymentParams): Promise<CreateCinetPayPaymentResult> {
  const apiKey = getRequiredEnv("CINETPAY_API_KEY");
  const siteId = getRequiredEnv("CINETPAY_SITE_ID");
  const nextAuthUrl = getRequiredEnv("NEXTAUTH_URL").replace(/\/$/, "");

  const payload = {
    apikey: apiKey,
    site_id: siteId,
    transaction_id: orderId,
    amount,
    currency: "XOF",
    description: `Paiement commande ${orderId}`,
    customer_name: customerName,
    customer_email: customerEmail,
    notify_url: `${nextAuthUrl}/api/webhooks/cinetpay`,
    return_url: `${nextAuthUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}`,
    cancel_url: `${nextAuthUrl}/checkout/cancel?orderId=${encodeURIComponent(orderId)}`,
  };

  const response = await fetch(CINETPAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`CinetPay request failed with status ${response.status}: ${bodyText}`);
  }

  const data = await response.json();

  if (!data || !data.data || !data.data.payment_url) {
    throw new Error(`Unexpected CinetPay response: ${JSON.stringify(data)}`);
  }

  return {
    payment_url: data.data.payment_url,
    status: data.status || "UNKNOWN",
    transaction_id: data.data.payment_id || orderId,
  };
}
