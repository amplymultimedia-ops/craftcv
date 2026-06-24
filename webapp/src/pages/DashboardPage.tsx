import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { ResumeCard } from "@/components/dashboard/ResumeCard";
import { CoverLetterCard } from "@/components/dashboard/CoverLetterCard";
import { api } from "@/lib/api";
import { Resume, CoverLetter, EMPTY_RESUME_CONTENT } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Mail } from "lucide-react";
import { toast } from "sonner";
import { fetchSession } from "@/lib/session";

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<{ user?: { name?: string } } | null>(null);
  const [tab, setTab] = useState("resumes");

  useEffect(() => {
    fetchSession().then(setSession);
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: resumes = [], isLoading: resumesLoading } = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api.get<Resume[]>("/api/resumes"),
  });

  const { data: coverLetters = [], isLoading: clLoading } = useQuery({
    queryKey: ["cover-letters"],
    queryFn: () => api.get<CoverLetter[]>("/api/cover-letters"),
  });

  const createResumeMutation = useMutation({
    mutationFn: () =>
      api.post<Resume>("/api/resumes", {
        title: "Untitled Resume",
        templateId: "classic",
        content: EMPTY_RESUME_CONTENT,
      }),
    onSuccess: (resume) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      navigate(`/builder/${resume.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const duplicateResumeMutation = useMutation({
    mutationFn: (id: string) => api.post<Resume>(`/api/resumes/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("Resume duplicated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteCLMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/cover-letters/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-letters"] });
      toast.success("Cover letter deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-light text-foreground mb-1">
              {greeting}, {firstName}
            </h1>
            <p className="text-muted-foreground text-sm">
              {resumes.length === 0
                ? "Create your first resume to get started."
                : `You have ${resumes.length} resume${resumes.length !== 1 ? "s" : ""}.`}
            </p>
          </div>
          <Button
            onClick={() => createResumeMutation.mutate()}
            disabled={createResumeMutation.isPending}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {createResumeMutation.isPending ? "Creating…" : "New Resume"}
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="resumes" className="gap-2">
              <FileText className="w-3.5 h-3.5" />
              My Resumes
              {resumes.length > 0 && (
                <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {resumes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="cover-letters" className="gap-2">
              <Mail className="w-3.5 h-3.5" />
              Cover Letters
              {coverLetters.length > 0 && (
                <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {coverLetters.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes">
            {resumesLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display text-xl font-light text-foreground mb-2">No resumes yet</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Create your first resume and start tailoring it to job descriptions.
                </p>
                <Button onClick={() => createResumeMutation.mutate()} disabled={createResumeMutation.isPending} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create first resume
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resumes.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    onEdit={() => navigate(`/builder/${resume.id}`)}
                    onDelete={() => deleteResumeMutation.mutate(resume.id)}
                    onDuplicate={() => duplicateResumeMutation.mutate(resume.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cover-letters">
            {clLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : coverLetters.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-xl">
                <Mail className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-display text-xl font-light text-foreground mb-2">No cover letters yet</h3>
                <p className="text-muted-foreground text-sm">
                  Cover letters are generated from the Builder when you match against a job ad.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coverLetters.map((cl) => (
                  <CoverLetterCard
                    key={cl.id}
                    coverLetter={cl}
                    onDelete={() => deleteCLMutation.mutate(cl.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
