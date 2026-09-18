"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";

import SiteIcon from "@/components/SiteIcon";
import { locations } from "@/data/locations";
import { findNearestLocationFromBrowser } from "@/lib/nearest-location";
import { findNearestLocationFromZipCode } from "@/lib/zip-location";

type Props = {
  onNearestLocation: (slug: string | null) => void;
};

type SearchMode = "current" | "zip";
type Feedback = { type: "error" | "success"; message: string };

export default function StoreLocationSearch({ onNearestLocation }: Props): ReactElement {
  const [zipCode, setZipCode] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const isSearching = searchMode !== null;

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  const handleSearch = async (mode: SearchMode): Promise<void> => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setSearchMode(mode);
    setFeedback(null);
    onNearestLocation(null);

    const result = mode === "current"
      ? await findNearestLocationFromBrowser(locations)
      : await findNearestLocationFromZipCode(zipCode, locations, controller.signal);

    if (controller.signal.aborted) {
      return;
    }

    setSearchMode(null);

    if (!result.ok) {
      const messages = {
        "invalid-zip": "Enter a valid 5-digit ZIP code.",
        "not-found": "We could not find that ZIP code. Check it and try again.",
        "permission-denied": "Location access is blocked. Allow it in your browser or enter a ZIP code.",
        unsupported: "Location services are unavailable. Enter a ZIP code instead.",
        timeout: "The search timed out. Try again or choose a store below.",
        unavailable: "We could not find your nearest store. Try again or choose a store below.",
        "no-match": "No nearby store was found. Choose a store below.",
        cancelled: "The search was cancelled. Try again or choose a store below.",
      };
      setFeedback({ type: "error", message: messages[result.reason] });
      return;
    }

    const nearestLocation = locations.find((location) => location.slug === result.slug);
    onNearestLocation(result.slug);
    setFeedback({
      type: "success",
      message: nearestLocation
        ? `Closest store: ${nearestLocation.name}. Select a store below.`
        : "Closest store shown first. Select a store below.",
    });
  };

  return (
    <div className="border-b border-black/15 py-4">
      <button
        type="button"
        onClick={() => handleSearch("current")}
        disabled={isSearching}
        className="brand-btn-directions w-full px-4 py-3 text-sm disabled:opacity-50"
      >
        <SiteIcon name="pin" className="h-4 w-4 shrink-0" />
        {searchMode === "current" ? "Finding nearest…" : "Use current location"}
      </button>

      <form onSubmit={(event) => {
        event.preventDefault();
        void handleSearch("zip");
      }} className="mt-4">
        <label htmlFor="store-search-zip" className="block text-xs font-bold text-neutral-600">
          Or enter ZIP code
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="store-search-zip"
            name="zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{5}"
            maxLength={5}
            required
            title="Enter a 5-digit ZIP code"
            placeholder="ZIP code"
            value={zipCode}
            onChange={(event) => setZipCode(event.target.value)}
            disabled={isSearching}
            className="brand-input min-w-0 flex-1 px-3 py-2 text-base disabled:opacity-50"
          />
          <button type="submit" disabled={isSearching} className="brand-btn shrink-0 px-4 py-2 text-sm disabled:opacity-50">
            {searchMode === "zip" ? "Finding…" : "Find"}
          </button>
        </div>
      </form>

      {feedback && (
        <p role={feedback.type === "error" ? "alert" : "status"} className={`mt-3 text-xs ${feedback.type === "error" ? "text-brand-red" : "text-brand-green"}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}
