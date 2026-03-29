"use client";

import { useState } from "react";

export default function SmartBondInput() {
  const [input, setInput] = useState("");
  const [numbers, setNumbers] = useState<string[]>([]);

  // Bangla → English
  const convert = (text: string) => {
    const map: Record<string, string> = {
      "০": "0",
      "১": "1",
      "২": "2",
      "৩": "3",
      "৪": "4",
      "৫": "5",
      "৬": "6",
      "৭": "7",
      "৮": "8",
      "৯": "9",
    };
    return text.replace(/[০-৯]/g, (d) => map[d]);
  };

  // Extract numbers from messy text
  const extractNumbers = (text: string) => {
    return text
      .replace(/[^\d০-৯]/g, " ") // remove everything except numbers
      .split(/\s+/) // split by space
      .map(convert) // convert Bangla → English
      .filter((n) => n.length >= 5); // keep valid numbers
  };

  const handleExtract = () => {
    const result = extractNumbers(input);
    setNumbers(result);
  };

  const handleSave = async () => {
    // 👉 send to your backend API
    await fetch("/api/bonds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numbers }),
    });

    alert("Saved!");
  };

  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="text-lg font-semibold">Add Prize Bonds</h2>

      <textarea
        className="w-full border p-2 rounded"
        rows={5}
        placeholder="Paste your numbers here (Bangla বা English)..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleExtract}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Extract Numbers
      </button>

      <div>
        <p>Found: {numbers.length}</p>
        <div className="text-sm max-h-40 overflow-auto border p-2">
          {numbers.join(", ")}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Save All
      </button>
    </div>
  );
}
