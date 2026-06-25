"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const UPI_REGEX = /^[\w.\-+]+@[\w]+$/;

function validateUpiId(value: string): string {
  if (!value.trim()) return "UPI ID is required to proceed.";
  if (!UPI_REGEX.test(value.trim()))
    return "Enter a valid UPI ID (e.g. name@okaxis, name@ybl).";
  return "";
}

function validateCard(num: string, expiry: string, cvv: string): string {
  const stripped = num.replace(/\s/g, "");
  if (!stripped) return "Card number is required.";
  if (stripped.length < 13 || stripped.length > 19 || !/^\d+$/.test(stripped))
    return "Enter a valid card number (13–19 digits).";
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Expiry must be MM/YY.";
  if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3–4 digits.";
  return "";
}

/* ── Main component ──────────────────────────────────────────────────────── */
function MockCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("transactionId") || "TXN_MOCK";
  const amount = searchParams.get("amount") || "9999";
  const tier = searchParams.get("tier") || "1 Year";

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [success, setSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"upi" | "card" | "netbanking">("upi");

  // UPI state
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [upiTouched, setUpiTouched] = useState(false);

  // Card state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardError, setCardError] = useState("");

  // NetBanking state
  const [selectedBank, setSelectedBank] = useState("");
  const [bankError, setBankError] = useState("");

  // Derived: is the current method valid?
  const isFormValid = (() => {
    if (selectedMethod === "upi") return UPI_REGEX.test(upiId.trim());
    if (selectedMethod === "card") return validateCard(cardNumber, cardExpiry, cardCvv) === "";
    if (selectedMethod === "netbanking") return selectedBank !== "";
    return false;
  })();

  const stages = [
    "Initiating secure transaction...",
    "Contacting your payment provider...",
    "Authorizing payment...",
    "Confirming with PG V4Stay...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && loadingStage < stages.length) {
      interval = setInterval(() => {
        setLoadingStage((prev) => {
          if (prev + 1 >= stages.length) {
            clearInterval(interval);
            handlePaymentCompletion();
            return prev + 1;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, loadingStage]);

  const handlePayClick = (e: React.FormEvent) => {
    e.preventDefault();

    // Re-validate on submit attempt
    if (selectedMethod === "upi") {
      const err = validateUpiId(upiId);
      setUpiError(err);
      setUpiTouched(true);
      if (err) return;
    }
    if (selectedMethod === "card") {
      const err = validateCard(cardNumber, cardExpiry, cardCvv);
      setCardError(err);
      if (err) return;
    }
    if (selectedMethod === "netbanking" && !selectedBank) {
      setBankError("Please select a bank to continue.");
      return;
    }

    setLoading(true);
    setLoadingStage(0);
  };

  const handlePaymentCompletion = async () => {
    try {
      const res = await fetch("/api/payments/phonepe-callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Mock-Secret": transactionId, // echoed back as the callback secret
        },
        body: JSON.stringify({
          transactionId,
          tier,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(data.redirectUrl || "/payments/status?transactionId=" + transactionId);
        }, 1200);
      } else {
        alert("Payment verification failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Payment communication failed.");
      setLoading(false);
    }
  };

  // Shared input style
  const inputStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #cbd5e0",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
  };

  const errorStyle: React.CSSProperties = {
    color: "#e53e3e",
    fontSize: "0.78rem",
    marginTop: "0.25rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f3f8",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* PhonePe Header Branding */}
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "#5f259f",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          padding: "1.5rem",
          color: "white",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "white",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "#5f259f",
                fontSize: "1.5rem",
              }}
            >
              Pe
            </div>
            <div>
              <h1 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 700 }}>PhonePe Gateway</h1>
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Secure Checkout</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", opacity: 0.8, display: "block" }}>Amount to Pay</span>
            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>₹{Number(amount).toLocaleString()}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
            opacity: 0.9,
          }}
        >
          <div>
            <span>Merchant: </span>
            <strong style={{ color: "#00e676" }}>PG V4Stay</strong>
          </div>
          <div>
            <span>ID: </span>
            <span style={{ fontSize: "0.7rem" }}>{transactionId.slice(0, 20)}…</span>
          </div>
        </div>
      </div>

      {/* Checkout Body */}
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "white",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          padding: "2rem",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 1rem",
              textAlign: "center",
            }}
          >
            {success ? (
              <>
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    backgroundColor: "#00e676",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "2.5rem",
                    marginBottom: "1.5rem",
                    boxShadow: "0 0 20px rgba(0, 230, 118, 0.4)",
                    animation: "pulse 1.5s infinite",
                  }}
                >
                  ✓
                </div>
                <h3 style={{ color: "#1a202c", margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
                  Payment Successful!
                </h3>
                <p style={{ color: "#718096", margin: 0, fontSize: "0.9rem" }}>
                  Verifying and activating your dashboard…
                </p>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #5f259f",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "1.5rem",
                  }}
                />
                <h3 style={{ color: "#1a202c", margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>
                  Processing Payment
                </h3>
                <p style={{ color: "#5f259f", margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>
                  {stages[Math.min(loadingStage, stages.length - 1)]}
                </p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handlePayClick} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }} noValidate>
            {/* Payment method tabs */}
            <div
              style={{
                display: "flex",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {(["upi", "card", "netbanking"] as const).map((method, idx) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSelectedMethod(method)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "none",
                    borderLeft: idx > 0 ? "1px solid #e2e8f0" : "none",
                    backgroundColor: selectedMethod === method ? "#f3ebfa" : "white",
                    color: selectedMethod === method ? "#5f259f" : "#4a5568",
                    fontWeight: selectedMethod === method ? 700 : 500,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    transition: "all 0.2s",
                  }}
                >
                  {method === "upi" ? "UPI / QR" : method === "card" ? "Card" : "NetBanking"}
                </button>
              ))}
            </div>

            {/* UPI Tab */}
            {selectedMethod === "upi" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    border: "1px solid #edf2f7",
                    padding: "1rem",
                    borderRadius: "8px",
                    backgroundColor: "#fafafb",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "#4a5568", display: "block", marginBottom: "0.75rem" }}>
                    Scan QR code using any UPI App (PhonePe, GPay, Paytm)
                  </span>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=9652172595@axl&pn=PG%20V4Stay&am=${amount}&cu=INR`}
                    alt="Scan to Pay"
                    style={{ margin: "0 auto", display: "block", borderRadius: "4px" }}
                  />
                </div>

                {/* UPI ID input — REQUIRED + validated */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "#4a5568", fontWeight: 600 }}>
                    Or Enter UPI ID <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="username@okaxis"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      if (upiTouched) setUpiError(validateUpiId(e.target.value));
                    }}
                    onBlur={() => {
                      setUpiTouched(true);
                      setUpiError(validateUpiId(upiId));
                    }}
                    style={{
                      ...inputStyle,
                      borderColor: upiError && upiTouched ? "#e53e3e" : "#cbd5e0",
                    }}
                  />
                  {upiError && upiTouched && (
                    <span style={errorStyle}>{upiError}</span>
                  )}
                  {!upiError && upiTouched && upiId && (
                    <span style={{ color: "#38a169", fontSize: "0.78rem", marginTop: "0.25rem" }}>
                      ✓ UPI ID looks valid
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Card Tab */}
            {selectedMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.8rem", color: "#4a5568", fontWeight: 600 }}>
                    Card Number <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(e.target.value);
                      setCardError(validateCard(e.target.value, cardExpiry, cardCvv));
                    }}
                    maxLength={19}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "#4a5568", fontWeight: 600 }}>
                      Expiry <span style={{ color: "#e53e3e" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(e.target.value);
                        setCardError(validateCard(cardNumber, e.target.value, cardCvv));
                      }}
                      maxLength={5}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "#4a5568", fontWeight: 600 }}>
                      CVV <span style={{ color: "#e53e3e" }}>*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="***"
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value);
                        setCardError(validateCard(cardNumber, cardExpiry, e.target.value));
                      }}
                      maxLength={4}
                      style={inputStyle}
                    />
                  </div>
                </div>
                {cardError && (
                  <span style={errorStyle}>{cardError}</span>
                )}
              </div>
            )}

            {/* NetBanking Tab */}
            {selectedMethod === "netbanking" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#4a5568", display: "block" }}>
                  Select from Popular Banks: <span style={{ color: "#e53e3e" }}>*</span>
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                  {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => (
                    <label
                      key={bank}
                      style={{
                        border: `1px solid ${selectedBank === bank ? "#5f259f" : "#cbd5e0"}`,
                        backgroundColor: selectedBank === bank ? "#f3ebfa" : "white",
                        padding: "0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontWeight: 500,
                        color: "#2d3748",
                      }}
                    >
                      <input
                        type="radio"
                        name="bank"
                        value={bank}
                        checked={selectedBank === bank}
                        onChange={() => {
                          setSelectedBank(bank);
                          setBankError("");
                        }}
                      />
                      {bank}
                    </label>
                  ))}
                </div>
                {bankError && <span style={errorStyle}>{bankError}</span>}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                disabled={!isFormValid}
                title={!isFormValid ? "Please fill in the required payment details above" : ""}
                style={{
                  backgroundColor: isFormValid ? "#5f259f" : "#b794d4",
                  color: "white",
                  padding: "1rem",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: isFormValid ? "pointer" : "not-allowed",
                  boxShadow: isFormValid ? "0 4px 6px -1px rgba(95, 37, 159, 0.2)" : "none",
                  transition: "all 0.2s",
                  opacity: isFormValid ? 1 : 0.65,
                }}
              >
                {isFormValid
                  ? `Pay ₹${Number(amount).toLocaleString()}`
                  : "Enter Payment Details to Continue"}
              </button>

              {!isFormValid && (
                <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#718096", margin: 0 }}>
                  {selectedMethod === "upi"
                    ? "Please enter a valid UPI ID (e.g. name@okaxis) to enable payment."
                    : selectedMethod === "card"
                    ? "Please fill in all card details to enable payment."
                    : "Please select a bank to enable payment."}
                </p>
              )}

              <button
                type="button"
                onClick={() => router.push("/onboarding/subscription")}
                style={{
                  backgroundColor: "transparent",
                  color: "#718096",
                  padding: "0.75rem",
                  border: "1px solid #cbd5e0",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Cancel &amp; Go Back
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

export default function PhonePeMockCheckout() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f4f3f8",
          }}
        >
          <div style={{ color: "#5f259f", fontWeight: 600 }}>Loading Checkout...</div>
        </div>
      }
    >
      <MockCheckoutContent />
    </Suspense>
  );
}
