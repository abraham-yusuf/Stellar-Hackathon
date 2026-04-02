import type { Metadata } from "next";
import TryClient from "./TryClient";

export const metadata: Metadata = {
  title: "Try StellarSearch",
};

export default function TryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-20">
      <TryClient />
    </div>
  );
}
