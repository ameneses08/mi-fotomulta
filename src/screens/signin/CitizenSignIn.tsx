import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Fingerprint } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { MOCK_SIGN_IN } from "@/data/mockData";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPES,
  maskDocument,
  validateCode,
  validateDocument,
  type DocumentType,
} from "@/lib/signIn";

export function CitizenSignIn() {
  const navigate = useNavigate();
  const [type, setType] = useState<DocumentType>(MOCK_SIGN_IN.citizenDocumentType);
  const [document, setDocument] = useState<string>(MOCK_SIGN_IN.citizenDocument);
  const [code, setCode] = useState<string>(MOCK_SIGN_IN.citizenCode);
  const [step, setStep] = useState<"document" | "code">("document");
  const [error, setError] = useState("");
  const enter = () => void navigate({ to: "/citizen" });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const problem = step === "document" ? validateDocument(type, document) : validateCode(code);
    setError(problem ?? "");
    if (problem) return;
    if (step === "document") setStep("code");
    else enter();
  };

  return (
    <div className="grid gap-5">
      <Button className="h-12 w-full" onClick={enter}>
        <Fingerprint size={18} aria-hidden="true" />
        Continue with Cédula Digital
      </Button>
      <p className="divider-text">or sign in with your document</p>
      <form className="grid gap-4" onSubmit={submit} noValidate>
        {step === "document" ? (
          <>
            <label className="form-field mt-0">
              Document type
              <select
                value={type}
                onChange={(e) => setType(DOCUMENT_TYPES.find((t) => t === e.target.value) ?? "CC")}
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {DOCUMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field mt-0">
              Document number
              <input
                inputMode="numeric"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
              />
            </label>
          </>
        ) : (
          <label className="form-field mt-0">
            6-digit code sent by SMS to the phone linked to {maskDocument(document)}
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
        )}
        {error && (
          <p className="error-text mt-0" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" variant="outline" className="h-12 w-full">
          {step === "document" ? "Send me a code" : "Verify and continue"}
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
