import { useState, useRef } from "react";
import { ResumeContent } from "@/lib/types";
import { tokenStore } from "@/lib/session";
import { Loader2, ChevronDown, ChevronUp, Upload } from "lucide-react";

interface LinkedInImportProps {
  onImport: (content: ResumeContent) => void;
}

export function LinkedInImport({ onImport }: LinkedInImportProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = tokenStore.get();
      const res = await fetch("/api/profile/parse-document", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Failed to parse");
      const content: ResumeContent = json.data.content;
      onImport(content);
      setSuccess(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  return (
    <div
      className="rounded-lg border border-blue-100 bg-blue-50/60 overflow-hidden"
      style={{ marginBottom: "0" }}
    >
      {/* Header button */}
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setSuccess(false);
          setError(null);
        }}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-blue-50 transition-colors"
      >
        {/* LinkedIn "in" logo */}
        <div
          className="flex items-center justify-center rounded text-white text-[10px] font-bold flex-shrink-0"
          style={{
            width: "18px",
            height: "18px",
            backgroundColor: "#0077B5",
            fontFamily: "Arial, sans-serif",
          }}
        >
          in
        </div>
        <span className="text-xs font-medium text-blue-900 flex-1">
          {success ? "Profile imported!" : "Import from LinkedIn PDF"}
        </span>
        {success ? null : open ? (
          <ChevronUp className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        )}
      </button>

      {/* Inline panel */}
      {open ? (
        <div className="px-3 pb-3 border-t border-blue-100 bg-white/70">
          <ol className="text-xs text-blue-800/80 mt-2.5 mb-3 leading-relaxed space-y-1 list-decimal list-inside">
            <li>Navigate to the profile you want to save.</li>
            <li>Below the profile photo and headline, click <strong>More</strong> or <strong>Resources</strong>.</li>
            <li>Select <strong>Save to PDF</strong> from the dropdown.</li>
            <li>Upload the downloaded PDF file here.</li>
          </ol>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={[
              "relative flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed py-4 px-3 cursor-pointer transition-colors",
              dragging
                ? "border-blue-400 bg-blue-50"
                : "border-blue-200 hover:border-blue-300 hover:bg-blue-50/50",
              loading ? "pointer-events-none opacity-70" : "",
            ].join(" ")}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-xs text-blue-600">Parsing your profile…</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-700 font-medium">
                  Click or drag PDF here
                </span>
                <span className="text-[10px] text-blue-400">Accepts .pdf only</span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          {error ? (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
