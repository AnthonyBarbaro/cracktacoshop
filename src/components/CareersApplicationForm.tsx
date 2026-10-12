"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

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

const MAX_RESUME_BYTES = 10 * 1024 * 1024;

function getResumeError(file: File): string | null {
  if (file.size === 0) {
    return "Your resume is empty. Please choose a PDF or DOCX file.";
  }

  if (file.size > MAX_RESUME_BYTES) {
    return "Resume too large. Max file size is 10MB.";
  }

  if (!/\.(pdf|docx)$/i.test(file.name)) {
    return "Please choose a PDF or DOCX resume.";
  }

  return null;
}

export default function CareersApplicationForm() {
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleResumeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.setCustomValidity(file ? getResumeError(file) ?? "" : "");
    setStatus("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (status === "submitting") {
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const resumeFile = resumeInputRef.current?.files?.[0];

      if (!resumeFile) {
        setStatus("error");
        setErrorMessage("Please attach your resume (PDF or DOCX).");
        return;
      }

      const resumeError = getResumeError(resumeFile);
      if (resumeError) {
        setStatus("error");
        setErrorMessage(resumeError);
        resumeInputRef.current?.focus();
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
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmitting}>
      <p className="text-xs text-[#626b60]">All fields are required unless marked optional.</p>
      <fieldset disabled={isSubmitting} className="space-y-5 disabled:opacity-70">
        <legend className="sr-only">Your application</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-brand-green">
            Full name
            <input
              required
              type="text"
              name="name"
              autoComplete="name"
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({ ...current, name: event.target.value }))
              }
              className="brand-input mt-2 px-4 py-3 text-base sm:text-sm"
              placeholder="Your full name"
            />
          </label>

          <label className="block text-sm font-medium text-brand-green">
            Email address
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({ ...current, email: event.target.value }))
              }
              className="brand-input mt-2 px-4 py-3 text-base sm:text-sm"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-medium text-brand-green">
            Phone number
            <input
              required
              type="tel"
              name="phone"
              autoComplete="tel"
              value={formState.phone}
              onChange={(event) =>
                setFormState((current) => ({ ...current, phone: event.target.value }))
              }
              className="brand-input mt-2 px-4 py-3 text-base sm:text-sm"
              placeholder="(619) 000-0000"
            />
          </label>

          <label className="block text-sm font-medium text-brand-green">
            Preferred location
            <select
              required
              name="preferredLocation"
              value={formState.preferredLocation}
              onChange={(event) =>
                setFormState((current) => ({ ...current, preferredLocation: event.target.value }))
              }
              className="brand-input brand-select mt-2 px-4 py-3 text-base sm:text-sm"
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

        <label className="block text-sm font-medium text-brand-green">
          Resume (PDF or DOCX)
          <input
            ref={resumeInputRef}
            required
            type="file"
            name="resume"
            onChange={handleResumeChange}
            aria-describedby="careers-resume-help"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="brand-input mt-2 px-3 py-3 text-base file:mr-3 file:cursor-pointer file:border-0 file:bg-[#e6ebdf] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-green sm:text-sm"
          />
          <span id="careers-resume-help" className="mt-2 block text-xs font-normal text-[#626b60]">PDF or DOCX, up to 10MB.</span>
        </label>

        <label className="block text-sm font-medium text-brand-green">
          Message (optional)
          <textarea
            name="message"
            value={formState.message}
            onChange={(event) =>
              setFormState((current) => ({ ...current, message: event.target.value }))
            }
            className="brand-input mt-2 min-h-32 resize-y px-4 py-3 text-base sm:text-sm"
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

        <button type="submit" disabled={isSubmitting} className="brand-btn w-full px-5 py-3 text-sm sm:w-auto">
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </fieldset>

      {status === "success" && (
        <p role="status" className="text-sm font-medium text-brand-green">
          Application submitted successfully.
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-brand-red">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
