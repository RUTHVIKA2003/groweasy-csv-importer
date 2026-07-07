"use client";

import { useState } from "react";
import UploadStep from "@/components/UploadStep";
import PreviewStep from "@/components/PreviewStep";
import ResultsStep from "@/components/ResultsStep";
import { UploadResponse, ProcessResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type Step = "upload" | "preview" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [results, setResults] = useState<ProcessResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleUpload = async (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Upload failed");
      }

      const data: UploadResponse = await response.json();
      setUploadData(data);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleConfirm = async () => {
    if (!uploadData) return;

    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      // Simulate progress while waiting for AI
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 800);

      const response = await fetch(`${API_URL}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: uploadData.allRecords,
          headers: uploadData.headers,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Processing failed");
      }

      const data: ProcessResponse = await response.json();
      setResults(data);
      setProgress(100);
      setTimeout(() => {
        setStep("results");
        setIsProcessing(false);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setUploadData(null);
    setResults(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                GrowEasy CSV Importer
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Step Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <StepIndicator
                  number={1}
                  label="Upload"
                  active={step === "upload"}
                  completed={step !== "upload"}
                />
                <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />
                <StepIndicator
                  number={2}
                  label="Preview"
                  active={step === "preview"}
                  completed={step === "results"}
                />
                <div className="w-6 h-px bg-gray-300 dark:bg-gray-600" />
                <StepIndicator
                  number={3}
                  label="Results"
                  active={step === "results"}
                  completed={false}
                />
              </div>
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {step === "upload" && <UploadStep onUpload={handleUpload} />}

          {step === "preview" && uploadData && (
            <PreviewStep
              data={uploadData}
              onConfirm={handleConfirm}
              onBack={handleReset}
              isProcessing={isProcessing}
              progress={progress}
            />
          )}

          {step === "results" && results && (
            <ResultsStep data={results} onReset={handleReset} />
          )}
        </main>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          active
            ? "bg-emerald-500 text-white"
            : completed
              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
        }`}
      >
        {completed ? "✓" : number}
      </div>
      <span
        className={`${
          active
            ? "text-gray-900 dark:text-white font-medium"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
