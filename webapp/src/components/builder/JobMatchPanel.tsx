import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { ParsedJobAd, ResumeContent, ToneOfVoice, CoverLetter, Resume } from "@/lib/types";
import { ToneSelector } from "./ToneSelector";
import { Loader2, Sparkles, FileSearch, Link, FileText, Mail } from "lucide-react";
import { toast } from "sonner";

interface JobMatchPanelProps {
  resumeId: string;
  currentContent: ResumeContent;
  currentTone: ToneOfVoice;
  onToneChange: (tone: ToneOfVoice) => void;
  onContentUpdate: (content: ResumeContent) => void;
}

export function JobMatchPanel({
  resumeId,
  currentContent,
  currentTone,
  onToneChange,
  onContentUpdate,
}: JobMatchPanelProps) {
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [parsed, setParsed] = useState<ParsedJobAd | null>(null);
  const [parsing, setParsing] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<CoverLetter | null>(null);

  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    setFetchingUrl(true);
    try {
      const result = await api.post<ParsedJobAd>("/api/job-ad/parse", { url: jobUrl.trim() });
      setParsed(result);
      if (result.rawText) setJobText(result.rawText);
      toast.success("Job ad fetched and parsed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch job ad");
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleParse = async () => {
    if (!jobText.trim()) {
      toast.error("Please paste a job description");
      return;
    }
    setParsing(true);
    try {
      const result = await api.post<ParsedJobAd>("/api/job-ad/parse", { text: jobText });
      setParsed(result);
      toast.success("Job ad parsed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse job ad");
    } finally {
      setParsing(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!parsed) {
      toast.error("Parse a job ad first");
      return;
    }
    setGeneratingResume(true);
    try {
      const result = await api.post<Resume>("/api/generate/resume", {
        resumeId,
        jobAdText: parsed.rawText || jobText,
        toneOfVoice: currentTone,
      });
      onContentUpdate(result.content);
      toast.success("CV tailored to the job description!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate CV");
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!parsed) {
      toast.error("Parse a job ad first");
      return;
    }
    setGeneratingCoverLetter(true);
    try {
      const result = await api.post<CoverLetter>("/api/generate/cover-letter", {
        resumeId,
        jobAdText: parsed.rawText || jobText,
        toneOfVoice: currentTone,
      });
      setGeneratedCoverLetter(result);
      toast.success("Cover letter generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Input tabs */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Job Description
        </Label>
        <Tabs defaultValue="paste">
          <TabsList className="w-full mb-3">
            <TabsTrigger value="paste" className="flex-1 gap-1.5 text-xs">
              <FileText className="w-3 h-3" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1 gap-1.5 text-xs">
              <Link className="w-3 h-3" />
              From URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-0 space-y-2">
            <Textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the full job description here — responsibilities, requirements, company culture…"
              rows={8}
              className="text-sm resize-none"
            />
            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={handleParse}
              disabled={parsing || !jobText.trim()}
            >
              {parsing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileSearch className="w-4 h-4" />
              )}
              {parsing ? "Parsing…" : "Parse Job Ad"}
            </Button>
          </TabsContent>

          <TabsContent value="url" className="mt-0 space-y-2">
            <div className="flex gap-2">
              <Input
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://company.com/jobs/role-name"
                className="text-sm flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFetchUrl();
                }}
              />
              <Button
                variant="outline"
                onClick={handleFetchUrl}
                disabled={fetchingUrl || !jobUrl.trim()}
                className="gap-1.5 whitespace-nowrap text-xs"
              >
                {fetchingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSearch className="w-3.5 h-3.5" />}
                {fetchingUrl ? "Fetching…" : "Fetch"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a job posting URL and we'll extract the description automatically.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Parsed result */}
      {parsed && (
        <div className="rounded-lg border border-border bg-accent/20 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                Parsed Role
              </p>
              <p className="text-sm font-semibold text-foreground">{parsed.title}</p>
              {parsed.company && (
                <p className="text-xs text-muted-foreground">{parsed.company}</p>
              )}
            </div>
            <Badge variant="secondary" className="text-[10px] flex-shrink-0">
              Ready
            </Badge>
          </div>

          {parsed.keywords.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Keywords
              </p>
              <div className="flex flex-wrap gap-1">
                {parsed.keywords.slice(0, 14).map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-[10px] h-5">
                    {kw}
                  </Badge>
                ))}
                {parsed.keywords.length > 14 && (
                  <Badge variant="outline" className="text-[10px] h-5">
                    +{parsed.keywords.length - 14} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {parsed.requirements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Key Requirements
              </p>
              <ul className="space-y-0.5">
                {parsed.requirements.slice(0, 5).map((r, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground flex items-start gap-1.5"
                  >
                    <span className="text-primary mt-0.5 flex-shrink-0">·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tone selector */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Tone of Voice
        </Label>
        <ToneSelector value={currentTone} onChange={onToneChange} />
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <Button
          className="w-full gap-2"
          onClick={handleGenerateResume}
          disabled={generatingResume || !parsed}
        >
          {generatingResume ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generatingResume ? "Tailoring CV…" : "Generate Tailored CV"}
        </Button>

        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={handleGenerateCoverLetter}
          disabled={generatingCoverLetter || !parsed}
        >
          {generatingCoverLetter ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          {generatingCoverLetter ? "Writing Cover Letter…" : "Generate Cover Letter"}
        </Button>
      </div>

      {!parsed && (
        <p className="text-xs text-center text-muted-foreground pb-1">
          Parse a job ad first, then generate your tailored CV or cover letter.
        </p>
      )}

      {/* Generated cover letter preview */}
      {generatedCoverLetter && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">{generatedCoverLetter.title}</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
            {generatedCoverLetter.content}
          </p>
          <p className="text-[10px] text-primary">
            Saved to Cover Letters in your dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
