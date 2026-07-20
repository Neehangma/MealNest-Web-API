"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { isPhoneNumberValid, PHONE_VALIDATION_MESSAGE, sanitizePhoneNumber } from "@/lib/phone-validation";
import { BANK_ACCOUNT_NUMBER_MESSAGE, ESEWA_ID_REQUIRED_MESSAGE, isBankAccountNumberValid, isEsewaIdValid, maskBankAccountNumber, sanitizeBankAccountNumber } from "@/lib/payment-validation";

type AddPaymentMethodType = "esewa" | "mobile_banking";
type AddedPaymentMethod = {
  id: string;
  type: AddPaymentMethodType;
  mobileNumber: string;
  esewaId?: string;
  bankName?: string;
  bankAccountNumber?: string;
  isDefault: boolean;
};
type IconName = "card" | "bank" | "trash" | "check" | "chevron";

const NEPAL_BANKS = ["Nabil Bank", "Global IME Bank", "NIC Asia Bank", "Nepal Investment Mega Bank", "Himalayan Bank", "Kumari Bank", "Siddhartha Bank"];
const maskMobileNumber = (number: string) => `${number.slice(0, 2)}******${number.slice(-2)}`;

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  return <svg {...props}>
    {name === "card" && <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></>}
    {name === "bank" && <><path d="m3 10 9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></>}
    {name === "trash" && <><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></>}
    {name === "check" && <path d="M20 6 9 17l-5-5"/>}
    {name === "chevron" && <path d="m9 18 6-6-6-6"/>}
  </svg>;
}

export default function PaymentMethodsClient() {
  const [selectedType, setSelectedType] = useState<AddPaymentMethodType>("esewa");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [addedMethods, setAddedMethods] = useState<AddedPaymentMethod[]>([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [esewaId, setEsewaId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  const selectMethod = (type: AddPaymentMethodType) => {
    setSelectedType(type);
    setShowAddForm(true);
    setFormMessage("");
    setMobileNumber("");
    setEsewaId("");
    setBankAccountNumber("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const submittedMobileNumber = String(data.get("mobileNumber") || "");
    if (!isPhoneNumberValid(submittedMobileNumber)) {
      setFormMessage(PHONE_VALIDATION_MESSAGE);
      return;
    }
    const submittedEsewaId = String(data.get("esewaId") || "").trim();
    const submittedBankAccountNumber = String(data.get("bankAccountNumber") || "");
    if (selectedType === "esewa" && !isEsewaIdValid(submittedEsewaId)) {
      setFormMessage(ESEWA_ID_REQUIRED_MESSAGE);
      return;
    }
    if (selectedType === "mobile_banking" && !isBankAccountNumberValid(submittedBankAccountNumber)) {
      setFormMessage(BANK_ACCOUNT_NUMBER_MESSAGE);
      return;
    }
    const method: AddedPaymentMethod = selectedType === "esewa"
      ? { id: globalThis.crypto?.randomUUID?.() || String(Date.now()), type: "esewa", mobileNumber: submittedMobileNumber, esewaId: submittedEsewaId, isDefault: addedMethods.length === 0 }
      : { id: globalThis.crypto?.randomUUID?.() || String(Date.now()), type: "mobile_banking", mobileNumber: submittedMobileNumber, bankName: String(data.get("bankName") || ""), bankAccountNumber: submittedBankAccountNumber, isDefault: addedMethods.length === 0 };
    setAddedMethods((methods) => [...methods, method]);
    setFormMessage(selectedType === "esewa" ? "eSewa account added." : "Linked bank account added.");
    event.currentTarget.reset();
    setMobileNumber("");
    setEsewaId("");
    setBankAccountNumber("");
  };

  const setDefaultMethod = (id: string) => setAddedMethods((methods) => methods.map((method) => ({ ...method, isDefault: method.id === id })));
  const removeMethod = (id: string) => setAddedMethods((methods) => {
    const removedMethod = methods.find((method) => method.id === id);
    const remainingMethods = methods.filter((method) => method.id !== id);

    if (removedMethod?.isDefault && remainingMethods.length > 0) {
      return remainingMethods.map((method, index) => ({
        ...method,
        isDefault: index === 0,
      }));
    }

    return remainingMethods;
  });

  return <div className="payment-methods-page">
    <main className="payment-methods-main">
      <section className="payment-methods-heading">
        <Link href="/dashboard/user" className="payment-methods-back"><Icon name="chevron" size={18}/>Back to Dashboard</Link>
        <h1>Payment Methods</h1>
        <p>Manage your payment methods for quick and easy reservations.</p>
      </section>

      <div className="payment-methods-content">
        <section className="payment-method-choice">
          <h2>Choose Your Payment Option</h2>
          <div className="payment-option-grid">
            <button type="button" className={`payment-option-card ${selectedType === "esewa" ? "selected" : ""}`} onClick={() => selectMethod("esewa")}>
              <div className="payment-option-icon esewa-icon" aria-hidden="true">e</div>
              <div className="payment-option-copy"><h3>Pay via eSewa</h3><p>Use eSewa wallet</p></div>
              {selectedType === "esewa" && <span className="payment-selected-check"><Icon name="check" size={14}/></span>}
            </button>
            <button type="button" className={`payment-option-card ${selectedType === "mobile_banking" ? "selected" : ""}`} onClick={() => selectMethod("mobile_banking")}>
              <div className="payment-option-icon bank-icon"><Icon name="bank" size={28}/></div>
              <div className="payment-option-copy"><h3>Linked Bank Account</h3><p>Pay instantly via bank account</p></div>
              {selectedType === "mobile_banking" && <span className="payment-selected-check"><Icon name="check" size={14}/></span>}
            </button>
          </div>
        </section>

        {showAddForm && <div className="payment-methods-form-card">
          <h3>{selectedType === "esewa" ? "Add eSewa Account" : "Add Linked Bank Account"}</h3>
          <form className="payment-methods-form" onSubmit={handleSubmit}>
            {selectedType === "esewa" ? <>
              <label><span>eSewa Mobile Number</span><input name="mobileNumber" type="tel" inputMode="numeric" maxLength={10} className={mobileNumber && !isPhoneNumberValid(mobileNumber) ? "phone-input-invalid" : ""} value={mobileNumber} onChange={(event) => { const phone = sanitizePhoneNumber(event.target.value); setMobileNumber(phone); if (isPhoneNumberValid(phone)) setFormMessage(""); }} placeholder="98XXXXXXXX" required/>{mobileNumber && !isPhoneNumberValid(mobileNumber) && <small className="phone-validation-error">{PHONE_VALIDATION_MESSAGE}</small>}</label>
              <label><span>ESEWA ID</span><input name="esewaId" type="text" value={esewaId} onChange={(event) => { setEsewaId(event.target.value); if (isEsewaIdValid(event.target.value)) setFormMessage(""); }} placeholder="Enter eSewa ID" required/></label>
              <button type="submit" className="payment-methods-submit-button" disabled={!isPhoneNumberValid(mobileNumber)}>Add eSewa Account</button>
            </> : <>
              <label><span>Bank Name</span><select name="bankName" required><option value="">Select Bank</option>{NEPAL_BANKS.map((bank) => <option key={bank} value={bank}>{bank}</option>)}</select></label>
              <label><span>ACCOUNT NUMBER</span><input name="bankAccountNumber" type="text" inputMode="numeric" maxLength={16} value={bankAccountNumber} onChange={(event) => { const value = sanitizeBankAccountNumber(event.target.value); setBankAccountNumber(value); if (isBankAccountNumberValid(value)) setFormMessage(""); }} placeholder="Enter bank account number" required/></label>
              <label><span>Mobile Number</span><input name="mobileNumber" type="tel" inputMode="numeric" maxLength={10} className={mobileNumber && !isPhoneNumberValid(mobileNumber) ? "phone-input-invalid" : ""} value={mobileNumber} onChange={(event) => { const phone = sanitizePhoneNumber(event.target.value); setMobileNumber(phone); if (isPhoneNumberValid(phone)) setFormMessage(""); }} placeholder="98XXXXXXXX" required/>{mobileNumber && !isPhoneNumberValid(mobileNumber) && <small className="phone-validation-error">{PHONE_VALIDATION_MESSAGE}</small>}</label>
              <button type="submit" className="payment-methods-submit-button" disabled={!isPhoneNumberValid(mobileNumber)}>Add Linked Bank Account</button>
            </>}
            {formMessage && <p className="form-message">{formMessage}</p>}
          </form>
        </div>}

        {addedMethods.length > 0 && <div className="payment-methods-list">
          {addedMethods.map((method) => <div key={method.id} className={`payment-method-card ${method.isDefault ? "default" : ""}`}>
            <div className="payment-method-icon"><Icon name={method.type === "esewa" ? "card" : "bank"} size={32}/></div>
            <div className="payment-method-info">
              <div className="payment-method-header"><h3>{method.type === "esewa" ? "eSewa" : "Linked Bank Account"}</h3>{method.isDefault && <span className="payment-method-badge">Default</span>}</div>
              {method.type === "esewa" ? <><p>Mobile Number: {maskMobileNumber(method.mobileNumber)}</p><p>eSewa ID: {method.esewaId}</p></> : <><p>{method.bankName}</p><p>Account Number: {maskBankAccountNumber(method.bankAccountNumber || "")}</p><p>Mobile: {maskMobileNumber(method.mobileNumber)}</p></>}
            </div>
            <div className="payment-method-actions">
              {!method.isDefault && <button type="button" className="payment-method-action-button" onClick={() => setDefaultMethod(method.id)}><Icon name="check" size={16}/>Set Default</button>}
              <button type="button" className="payment-method-action-button danger" onClick={() => removeMethod(method.id)}><Icon name="trash" size={16}/>Remove</button>
            </div>
          </div>)}
        </div>}

      </div>
    </main>

    <footer className="customer-footer payment-methods-footer"><div><h2>MealNest</h2><p>Premium dining logistics and reservations for the modern connoisseur.</p></div><nav aria-label="Platform links"><h3>Platform</h3><a href="#">About Us</a><a href="#">Press</a><a href="#">Careers</a></nav><nav aria-label="Support links"><h3>Support</h3><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Contact</a></nav><div><h3>Connect</h3><div className="social-row"><Icon name="card"/><Icon name="card"/><Icon name="card"/></div><p>&copy; 2024 MealNest. All rights reserved.</p></div></footer>
  </div>;
}
