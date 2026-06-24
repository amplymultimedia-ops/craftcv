import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { CoverLetter, ResumeContent, ToneOfVoice } from "@/lib/types";
import { ToneSelector } from "./ToneSelector";
import { CoverLetterEditor } from "./CoverLetterEditor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Save, CheckCheck, Mail } from "lucide-react";
import { toast } from "sonner";

interface CoverLetterPanelProps {
  resumeId: string;
  currentContent: ResumeContent;
  currentTone: ToneOfVoice;
  onToneChange: (tone: ToneOfVoice) => void;
  onCoverLetterChange?: (html: string) => void;
}

export function CoverLetterPanel({
  resumeId,
  currentContent,
  currentTone,
  onToneChange,
  onCoverLetterChange,
}: CoverLetterPanelProps) {
  const queryClient = useQueryClient();
  const [jobText, setJobText] = useState("");
  const [letterText, setLetterText] = useState("");
  const [letterId, setLetterId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: existingLetters } = useQuery({
    queryKey: ["cover-letters", resumeId],
    queryFn: () => api.get<CoverLetter[]>("/api/cover-letters"),
  });

  useEffect(() => {
    if (existingLetters) {
      const linked = existingLetters.find((cl) => cl.resumeId === resumeId);
      if (linked && !letterId) {
        setLetterId(linked.id);
        setLetterText(linked.content);
        onCoverLetterChange?.(linked.content);
      }
    }
  }, [existingLetters, resumeId, letterId, onCoverLetterChange]);

  const saveMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.put<CoverLetter>(`/api/cover-letters/${id}`, { content }),
    onSuccess: () => {
      setSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["cover-letters"] });
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: () => setSaveStatus("idle"),
  });

  const triggerAutoSave = useCallback(
    (id: string, text: string) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      setSaveStatus("saving");
      autoSaveTimer.current = setTimeout(() => {
        saveMutation.mutate({ id, content: text });
      }, 1500);
    },
    [saveMutation]
  );

  const handleEditorChange = (html: string) => {
    setLetterText(html);
    if (letterId) triggerAutoSave(letterId, html);
    onCoverLetterChange?.(html);
  };

  const handleGenerate = async () => {
    if (!jobText.trim()) {
      toast.error("Paste a job description first");
      return;
    }
    setGenerating(true);
    try {
      const result = await api.post<CoverLetter>("/api/generate/cover-letter", {
        resumeId,
        jobAdText: jobText,
        toneOfVoice: currentTone,
        ...(letterId ? { coverLetterId: letterId } : {}),
      });
      setLetterId(result.id);
      setLetterText(result.content);
      onCoverLetterChange?.(result.content);
      queryClient.invalidateQueries({ queryKey: ["cover-letters"] });
      toast.success("Cover letter generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tone */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Tone of Voice
        </Label>
        <ToneSelector value={currentTone} onChange={onToneChange} />
      </div>

      {/* Job description */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Job Description
        </Label>
        <Textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste the job description here to generate a tailored cover letter…"
          rows={6}
          className="text-sm resize-none"
        />
        <Button
          className="w-full gap-2 mt-2"
          onClick={handleGenerate}
          disabled={generating || !jobText.trim()}
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generating ? "Writing Cover Letter…" : "Generate Cover Letter"}
        </Button>
      </div>

      {/* Letter editor */}
      {letterText ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Cover Letter
            </Label>
            <div className="flex items-center gap-2">
              {saveStatus === "saving" && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Save className="w-3 h-3 animate-pulse" /> Saving…
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Select any text to edit it with AI, or use the toolbar to format.
          </p>
          <CoverLetterEditor
            content={letterText}
            onChange={handleEditorChange}
            placeholder="Your cover letter will appear here…"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 py-10 flex flex-col items-center gap-2 text-center px-4">
          <Mail className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No cover letter yet</p>
          <p className="text-xs text-muted-foreground/70">
            Paste a job description above and click Generate.
          </p>
        </div>
      )}
    </div>
  );
}
