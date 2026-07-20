"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPaidReservationAction } from "@/lib/actions/reservation-action";
import { isPhoneNumberValid, PHONE_VALIDATION_MESSAGE, sanitizePhoneNumber } from "@/lib/phone-validation";
import { BANK_ACCOUNT_NUMBER_MESSAGE, ESEWA_ID_REQUIRED_MESSAGE, isBankAccountNumberValid, isEsewaIdValid, sanitizeBankAccountNumber } from "@/lib/payment-validation";

type PaymentMethod = "esewa" | "mobile_banking";
type IconName = "chevron" | "check" | "bank";

type PendingBooking = {
  restaurantId: string;
  restaurantName: string;
  cuisine: string;
  image: string;
  reservationDate: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  location: string;
  restaurantAddress: string;
  price: number;
  totalAmount: number;
};

const NEPAL_BANKS = ["Nabil Bank", "Global IME Bank", "NIC Asia Bank", "Nepal Investment Mega Bank", "Himalayan Bank", "Kumari Bank", "Siddhartha Bank"];

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  return <svg {...props}>
    {name === "chevron" && <path d="m9 18 6-6-6-6" />}
    {name === "check" && <path d="M20 6 9 17l-5-5" />}
    {name === "bank" && <><path d="m3 10 9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></>}
  </svg>;
}

export default function PaymentCheckoutPage() {
  const router = useRouter();
  const [booking] = useState<PendingBooking | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("mealnest_booking");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as PendingBooking;
    } catch {
      return null;
    }
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");
  const [mobileNumber, setMobileNumber] = useState("");
  const [esewaId, setEsewaId] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const submissionStarted = useRef(false);

  const paymentLabel = paymentMethod === "esewa" ? "eSewa" : "Mobile Banking";
  const bankAccountNumberIsValid = isBankAccountNumberValid(bankAccountNumber);

  function selectPaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method);
    setError("");
  }

  function validateDetails() {
    if (!booking) return "Booking details are missing. Please select a table again.";
    if (!isPhoneNumberValid(mobileNumber)) return PHONE_VALIDATION_MESSAGE;
    if (paymentMethod === "esewa" && !isEsewaIdValid(esewaId)) return ESEWA_ID_REQUIRED_MESSAGE;
    if (paymentMethod === "mobile_banking" && !bankName) return "Bank name is required.";
    if (paymentMethod === "mobile_banking" && !bankAccountNumberIsValid) return BANK_ACCOUNT_NUMBER_MESSAGE;
    return "";
  }

  function openConfirmation() {
    const validationError = validateDetails();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setConfirmationOpen(true);
  }

  async function confirmPayment() {
    if (!booking || submissionStarted.current) return;
    submissionStarted.current = true;
    setProcessing(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const response = await createPaidReservationAction({
        ...booking,
        paymentMethod,
        paymentStatus: "simulated_success",
        totalPaid: booking.totalAmount,
        customerPhone: mobileNumber.trim(),
        ...(paymentMethod === "esewa" ? { esewaId: esewaId.trim() } : { bankAccountNumber }),
      });
      const confirmedBooking = response.booking || response.data;
      if (!confirmedBooking?.bookingReference || !confirmedBooking.restaurantName) {
        throw new Error("The booking was created, but its confirmation details were not returned. Please check My Reservations before trying again.");
      }
      sessionStorage.setItem("confirmedBooking", JSON.stringify({
        ...confirmedBooking,
        emailSent: response.emailSent === true,
      }));
      sessionStorage.removeItem("mealnest_booking");
      router.push("/dashboard/user/booking-confirmation");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to process payment. Please try again.");
      setConfirmationOpen(false);
      setProcessing(false);
      submissionStarted.current = false;
    }
  }

  return <div className="payment-checkout-page">
    <main className="payment-checkout-main">
      <section className="payment-checkout-heading">
        <Link href="/dashboard/user" className="payment-checkout-back"><Icon name="chevron" size={18}/>Back to Dashboard</Link>
        <h1>Payment Method</h1>
        <p>Select your preferred payment method to complete the reservation.</p>
      </section>

      <div className="payment-checkout-content">
        <section className="payment-methods-selection">
          <h2>Choose Your Payment Option</h2>
          <div className="payment-option-grid">
            <button type="button" className={`payment-option-card ${paymentMethod === "esewa" ? "selected" : ""}`} onClick={() => selectPaymentMethod("esewa")}>
              <div className="payment-option-icon esewa-icon" aria-hidden="true">e</div>
              <div className="payment-option-copy"><h3>Pay via eSewa</h3><p>Use eSewa wallet</p></div>
              {paymentMethod === "esewa" && <span className="payment-selected-check"><Icon name="check" size={14}/></span>}
            </button>
            <button type="button" className={`payment-option-card ${paymentMethod === "mobile_banking" ? "selected" : ""}`} onClick={() => selectPaymentMethod("mobile_banking")}>
              <div className="payment-option-icon bank-icon"><Icon name="bank" size={28}/></div>
              <div className="payment-option-copy"><h3>Mobile Banking</h3><p>Pay through your bank account</p></div>
              {paymentMethod === "mobile_banking" && <span className="payment-selected-check"><Icon name="check" size={14}/></span>}
            </button>
          </div>
        </section>

        <section className="payment-details-card">
          <h2>Enter Payment Details</h2>
          <div className="payment-details-form">
            {paymentMethod === "esewa" ? <>
              <div className="form-group"><label htmlFor="esewa-mobile">eSewa Mobile Number</label><input id="esewa-mobile" type="tel" inputMode="numeric" maxLength={10} className={mobileNumber && !isPhoneNumberValid(mobileNumber) ? "phone-input-invalid" : ""} value={mobileNumber} onChange={(event) => { const phone = sanitizePhoneNumber(event.target.value); setMobileNumber(phone); if (isPhoneNumberValid(phone)) setError(""); }} placeholder="98XXXXXXXX" required/>{mobileNumber && !isPhoneNumberValid(mobileNumber) && <small className="phone-validation-error">{PHONE_VALIDATION_MESSAGE}</small>}</div>
              <div className="form-group"><label htmlFor="esewa-id">ESEWA ID</label><input id="esewa-id" type="text" value={esewaId} onChange={(event) => { setEsewaId(event.target.value); if (isEsewaIdValid(event.target.value)) setError(""); }} placeholder="Enter eSewa ID" required/></div>
            </> : <>
              <div className="form-group"><label htmlFor="bank-name">Bank Name</label><select id="bank-name" value={bankName} onChange={(event) => setBankName(event.target.value)} required><option value="">Select Bank</option>{NEPAL_BANKS.map((bank) => <option key={bank} value={bank}>{bank}</option>)}</select></div>
              <div className="form-group"><label htmlFor="bank-account-number">ACCOUNT NUMBER</label><input id="bank-account-number" type="text" inputMode="numeric" maxLength={16} value={bankAccountNumber} onChange={(event) => { const value = sanitizeBankAccountNumber(event.target.value); setBankAccountNumber(value); if (isBankAccountNumberValid(value)) setError(""); }} placeholder="Enter bank account number" required/></div>
              <div className="form-group"><label htmlFor="bank-mobile">Mobile Number</label><input id="bank-mobile" type="tel" inputMode="numeric" maxLength={10} className={mobileNumber && !isPhoneNumberValid(mobileNumber) ? "phone-input-invalid" : ""} value={mobileNumber} onChange={(event) => { const phone = sanitizePhoneNumber(event.target.value); setMobileNumber(phone); if (isPhoneNumberValid(phone)) setError(""); }} placeholder="98XXXXXXXX" required/>{mobileNumber && !isPhoneNumberValid(mobileNumber) && <small className="phone-validation-error">{PHONE_VALIDATION_MESSAGE}</small>}</div>
            </>}
          </div>

          <div className="payment-total">
            <div className="total-row"><span>Restaurant</span><span>{booking?.restaurantName || "Not selected"}</span></div>
            <div className="total-row"><span>Party Size</span><span>{booking ? `${booking.guests} Guest${booking.guests === 1 ? "" : "s"}` : "—"}</span></div>
            <div className="total-row final"><strong>Total Amount</strong><strong>Rs. {booking?.totalAmount?.toLocaleString() || "0"}</strong></div>
          </div>
          {error && <p className="form-message error">{error}</p>}
        </section>

        <div className="payment-actions">
          <Link href={booking ? `/dashboard/user/restaurants/${booking.restaurantId}` : "/dashboard/user"} className="cancel-button">CANCEL</Link>
          <button type="button" className="pay-button" onClick={openConfirmation} disabled={processing || !isPhoneNumberValid(mobileNumber)}>{paymentMethod === "esewa" ? "Pay via eSewa" : "Pay via Mobile Banking"}</button>
        </div>
      </div>
    </main>

    <footer className="customer-footer payment-checkout-footer"><div><h2>MealNest</h2><p>Premium dining logistics and reservations for the modern connoisseur.</p></div><nav aria-label="Platform links"><h3>Platform</h3><a href="#">About Us</a><a href="#">Press</a><a href="#">Careers</a></nav><nav aria-label="Support links"><h3>Support</h3><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Contact</a></nav><div><h3>Connect</h3><div className="social-row"><Icon name="check"/><Icon name="check"/><Icon name="check"/></div><p>&copy; 2024 MealNest. All rights reserved.</p></div></footer>

    {confirmationOpen && booking && <div className="payment-success-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-payment-title">
      <div className="payment-success-modal-content">
        <h2 id="confirm-payment-title">Confirm Payment</h2>
        <p>Do you want to proceed with this payment?</p>
        <div className="payment-total">
          <div className="total-row"><span>Restaurant</span><span>{booking.restaurantName}</span></div>
          <div className="total-row"><span>Date</span><span>{booking.date}</span></div>
          <div className="total-row"><span>Time</span><span>{booking.time}</span></div>
          <div className="total-row"><span>Party Size</span><span>{booking.guests}</span></div>
          <div className="total-row"><span>Payment Method</span><span>{paymentLabel}</span></div>
          <div className="total-row final"><strong>Total Amount</strong><strong>Rs. {booking.totalAmount.toLocaleString()}</strong></div>
        </div>
        <div className="payment-actions">
          <button type="button" className="cancel-button" onClick={() => setConfirmationOpen(false)} disabled={processing}>Cancel</button>
          <button type="button" className="pay-button" onClick={() => void confirmPayment()} disabled={processing}>{processing ? "Processing Payment..." : "Confirm and Pay"}</button>
        </div>
      </div>
    </div>}
  </div>;
}
