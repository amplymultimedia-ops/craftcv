import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Resume, ResumeContent, ToneOfVoice, EMPTY_RESUME_CONTENT } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { ProfileEditor } from "@/components/builder/ProfileEditor";
import { JobMatchPanel } from "@/components/builder/JobMatchPanel";
import { CoverLetterPanel } from "@/components/builder/CoverLetterPanel";
import { TemplateGallery } from "@/components/builder/TemplateGallery";
import { ToneSelector } from "@/components/builder/ToneSelector";
import { ResumePreview } from "@/components/builder/ResumePreview";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Download, ArrowLeft, Save, CheckCheck, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [content, setContent] = useState<ResumeContent>(EMPTY_RESUME_CONTENT);
  const [templateId, setTemplateId] = useState("classic");
  const [tone, setTone] = useState<ToneOfVoice>("professional");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [title, setTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [coverLetterHtml, setCoverLetterHtml] = useState<string>("");
  const [includeCoverLetter, setIncludeCoverLetter] = useState<boolean>(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  const { data: resume, isLoading } = useQuery({
    queryKey: ["resume", id],
    queryFn: () => api.get<Resume>(`/api/resumes/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (resume && isFirstLoad.current) {
      setContent(resume.content ?? EMPTY_RESUME_CONTENT);
      setTemplateId(resume.templateId ?? "classic");
      setTone((resume.toneOfVoice as ToneOfVoice) ?? "professional");
      setTitle(resume.title ?? "");
      isFirstLoad.current = false;
    }
  }, [resume]);

  const saveMutation = useMutation({
    mutationFn: (data: { content: ResumeContent; templateId: string; toneOfVoice: ToneOfVoice }) =>
      api.put<Resume>(`/api/resumes/${id}`, data),
    onSuccess: () => {
      setSaveStatus("saved");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      setTimeout(() => setSaveStatus("idle"), 2000);
    },
    onError: (err: Error) => {
      setSaveStatus("idle");
      toast.error(err.message);
    },
  });

  const triggerSave = useCallback(
    (c: ResumeContent, tId: string, t: ToneOfVoice) => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      setSaveStatus("saving");
      autoSaveTimer.current = setTimeout(() => {
        saveMutation.mutate({ content: c, templateId: tId, toneOfVoice: t });
      }, 2000);
    },
    [saveMutation]
  );

  const handleContentChange = (newContent: ResumeContent) => {
    setContent(newContent);
    if (!isFirstLoad.current) triggerSave(newContent, templateId, tone);
  };

  const handleTemplateChange = (newTemplateId: string) => {
    setTemplateId(newTemplateId);
    if (!isFirstLoad.current) triggerSave(content, newTemplateId, tone);
  };

  const handleToneChange = (newTone: ToneOfVoice) => {
    setTone(newTone);
    if (!isFirstLoad.current) triggerSave(content, templateId, newTone);
  };

  const titleMutation = useMutation({
    mutationFn: (newTitle: string) =>
      api.put<Resume>(`/api/resumes/${id}`, { title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resume", id] });
    },
    onError: () => toast.error("Failed to rename"),
  });

  const handleTitleBlur = () => {
    setEditingTitle(false);
    const trimmed = title.trim() || "Untitled Resume";
    setTitle(trimmed);
    if (trimmed !== resume?.title) titleMutation.mutate(trimmed);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") titleInputRef.current?.blur();
    if (e.key === "Escape") {
      setTitle(resume?.title ?? "");
      setEditingTitle(false);
    }
  };

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.select();
  }, [editingTitle]);

  const openPrintWindow = (pages: string[]) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${content.personalInfo.name || "Resume"}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body { margin: 0; padding: 0; background: white; }
    .print-page {
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      position: relative;
    }
    .print-page:last-child { page-break-after: auto; break-after: auto; }
  </style>
</head>
<body>
  ${pages.map((html) => `<div class="print-page">${html}</div>`).join("\n")}
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`);
    win.document.close();
  };

  const buildResumePageHtml = (): string => {
    const el = document.querySelector(".printable-area");
    return el ? el.innerHTML : "";
  };

  const buildCoverLetterPageHtml = (): string => {
    const { style, accentColor: accent } = template;
    const fontFamily =
      style === "elegant"
        ? "'Garamond', 'Georgia', serif"
        : style === "bold" || style === "creative"
        ? "'Arial Black', 'Arial', sans-serif"
        : "Arial, Helvetica, sans-serif";
    const { personalInfo } = content;
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const contactParts = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location,
      personalInfo.linkedin,
    ].filter(Boolean);

    return `<div style="
      font-family: ${fontFamily};
      font-size: 10.5px;
      line-height: 1.75;
      color: #1a1a1a;
      background: #fff;
      padding: 28px 32px;
      min-height: 297mm;
      width: 210mm;
    ">
      <div style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid ${accent};">
        <div style="font-size: 22px; font-weight: 700; color: #111; margin-bottom: 2px;">${personalInfo.name || ""}</div>
        ${personalInfo.title ? `<div style="font-size: 10.5px; color: ${accent}; margin-bottom: 4px;">${personalInfo.title}</div>` : ""}
        <div style="font-size: 9px; color: #555;">${contactParts.join(" &nbsp;·&nbsp; ")}</div>
      </div>
      <div style="font-size: 9.5px; color: #777; margin-bottom: 22px;">${today}</div>
      <div style="font-size: 10.5px; line-height: 1.75;">
        ${coverLetterHtml
          .replace(/<p>/g, '<p style="margin: 0 0 0.85em;">')
          .replace(/<ul>/g, '<ul style="margin: 0 0 0.85em; padding-left: 1.4em;">')
          .replace(/<ol>/g, '<ol style="margin: 0 0 0.85em; padding-left: 1.4em;">')
          .replace(/<li>/g, '<li style="margin-bottom: 0.2em;">')}
      </div>
    </div>`;
  };

  const handlePrint = () => {
    const resumeHtml = buildResumePageHtml();
    if (includeCoverLetter && coverLetterHtml) {
      openPrintWindow([resumeHtml, buildCoverLetterPageHtml()]);
    } else {
      openPrintWindow([resumeHtml]);
    }
  };

  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            {editingTitle ? (
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="h-6 text-sm font-medium px-1 py-0 border-0 border-b border-primary rounded-none shadow-none focus-visible:ring-0 w-[200px] bg-transparent"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                className="flex items-center gap-1 group text-sm font-medium text-foreground truncate max-w-[200px] hover:text-primary transition-colors"
              >
                <span className="truncate">{title || resume?.title || "Resume"}</span>
                <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Save className="w-3 h-3 animate-pulse" /> Saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCheck className="w-3 h-3 text-green-600" /> Saved
            </span>
          )}
          {coverLetterHtml && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCoverLetter}
                onChange={(e) => setIncludeCoverLetter(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-xs text-muted-foreground">Include cover letter</span>
            </label>
          )}
          <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={handlePrint}>
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left editor panel */}
        <div className="w-[400px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
          <Tabs defaultValue="profile" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="mx-3 mt-3 mb-0 flex-shrink-0 grid grid-cols-4">
              <TabsTrigger value="profile" className="text-xs">Profile</TabsTrigger>
              <TabsTrigger value="job-match" className="text-xs">Job Match</TabsTrigger>
              <TabsTrigger value="cover-letter" className="text-xs">Cover Letter</TabsTrigger>
              <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="flex-1 overflow-y-auto p-4 mt-0">
              <ProfileEditor content={content} onChange={handleContentChange} />
            </TabsContent>

            <TabsContent value="job-match" className="flex-1 overflow-y-auto p-4 mt-0">
              <JobMatchPanel
                resumeId={id ?? ""}
                currentContent={content}
                currentTone={tone}
                onToneChange={handleToneChange}
                onContentUpdate={handleContentChange}
              />
            </TabsContent>

            <TabsContent value="cover-letter" className="flex-1 overflow-y-auto p-4 mt-0">
              <CoverLetterPanel
                resumeId={id ?? ""}
                currentContent={content}
                currentTone={tone}
                onToneChange={handleToneChange}
                onCoverLetterChange={setCoverLetterHtml}
              />
            </TabsContent>

            <TabsContent value="design" className="flex-1 overflow-y-auto p-4 mt-0 space-y-6">
              <div>
                <h3 className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">Template</h3>
                <TemplateGallery value={templateId} onChange={handleTemplateChange} />
              </div>
              <div>
                <h3 className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">Tone of Voice</h3>
                <ToneSelector value={tone} onChange={handleToneChange} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right preview panel */}
        <div className="flex-1 overflow-y-auto bg-muted/30 flex items-start justify-center p-8">
          <div
            className="printable-area bg-white shadow-xl rounded-sm overflow-hidden"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            <ResumePreview content={content} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}
