"use client";

import { useRef, useState } from "react";

import { locations } from "@/data/locations";

type FormState = {
  name: string;
  email: string;
  phone: string;
  preferredLocation: string;
  message: string;
  website: string;
};

const INITIAL_FORM_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  preferredLocation: "",
  message: "",
  website: "",
};

export default function CareersApplicationForm() {
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const resumeFile = resumeInputRef.current?.files?.[0];

      if (!resumeFile) {
        setStatus("error");
        setErrorMessage("Please attach your resume (PDF or DOCX).");
        return;
      }

      const payload = new FormData();
      payload.set("name", formState.name);
      payload.set("email", formState.email);
      payload.set("phone", formState.phone);
      payload.set("preferredLocation", formState.preferredLocation);
      payload.set("message", formState.message);
      payload.set("website", formState.website);
      payload.set("resume", resumeFile);

      const response = await fetch("/api/careers", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setStatus("error");
        setErrorMessage(data.message ?? "Unable to submit application.");
        return;
      }

      setStatus("success");
      setFormState(INITIAL_FORM_STATE);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }
    } catch {
      setStatus("error");
      setErrorMessage("Unable to submit application. Please try again.");
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-white/80">
          Name
          <input
            required
            type="text"
            name="name"
            value={formState.name}
            onChange={(event) =>
              setFormState((current) => ({ ...current, name: event.target.value }))
            }
            className="brand-input mt-2 px-3 py-2 text-sm"
            placeholder="Your full name"
          />
        </label>

        <label className="text-sm text-white/80">
          Email
          <input
            required
            type="email"
            name="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({ ...current, email: event.target.value }))
            }
            className="brand-input mt-2 px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </label>

        <label className="text-sm text-white/80">
          Phone Number
          <input
            required
            type="tel"
            name="phone"
            value={formState.phone}
            onChange={(event) =>
              setFormState((current) => ({ ...current, phone: event.target.value }))
            }
            className="brand-input mt-2 px-3 py-2 text-sm"
            placeholder="(619) 000-0000"
          />
        </label>

        <label className="text-sm text-white/80">
          Location
          <select
            required
            name="preferredLocation"
            value={formState.preferredLocation}
            onChange={(event) =>
              setFormState((current) => ({ ...current, preferredLocation: event.target.value }))
            }
            className="brand-input brand-select mt-2 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select location
            </option>
            {locations.map((location) => (
              <option key={location.slug} value={location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="text-sm text-white/80">
        Resume (PDF or DOCX)
        <input
          ref={resumeInputRef}
          required
          type="file"
          name="resume"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="brand-input mt-2 px-3 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-yellow file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
        />
      </label>

      <label className="text-sm text-white/80">
        Message (optional)
        <textarea
          name="message"
          value={formState.message}
          onChange={(event) =>
            setFormState((current) => ({ ...current, message: event.target.value }))
          }
          className="brand-input mt-2 min-h-28 px-3 py-2 text-sm"
          placeholder="Optional note to hiring team."
        />
      </label>

      <label className="sr-only" aria-hidden="true">
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formState.website}
          onChange={(event) =>
            setFormState((current) => ({ ...current, website: event.target.value }))
          }
          className="hidden"
        />
      </label>

      <button type="submit" disabled={isSubmitting} className="brand-btn px-5 py-2 text-sm">
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </button>

      {status === "success" && (
        <p role="status" className="text-sm font-medium text-emerald-300">
          Application submitted successfully.
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-red-300">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
