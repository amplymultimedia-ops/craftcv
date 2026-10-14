import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/layout/Navbar";
import { CoverLetterEditor } from "@/components/builder/CoverLetterEditor";
import { api } from "@/lib/api";
import { CoverLetter } from "@/lib/types";
import { toast } from "sonner";

export default function CoverLetterPage() {
  const { id = "" } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const initializedId = useRef("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: letter, isLoading, isError, error } = useQuery({
    queryKey: ["cover-letter", id],
    queryFn: () => api.get<CoverLetter>(`/api/cover-letters/${id}`),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (!letter || initializedId.current === letter.id) return;
    initializedId.current = letter.id;
    setTitle(letter.title);
    setContent(letter.content);
  }, [letter]);

  const updateMutation = useMutation({
    mutationFn: () => api.put<CoverLetter>(`/api/cover-letters/${id}`, {
      title: title.trim() || "Untitled Cover Letter",
      content,
    }),
    onSuccess: (updatedLetter) => {
      setTitle(updatedLetter.title);
      queryClient.setQueryData(["cover-letter", id], updatedLetter);
      queryClient.invalidateQueries({ queryKey: ["cover-letters"] });
      toast.success("Cover letter saved");
    },
    onError: (saveError: Error) => toast.error(saveError.message || "Unable to save cover letter"),
  });

  const isDirty = Boolean(letter && (title !== letter.title || content !== letter.content));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">Loading cover letter…</div>
        ) : isError || !letter ? (
          <div className="py-20 text-center">
            <h1 className="font-display text-2xl">Cover letter unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "This cover letter could not be found."}
            </p>
          </div>
        ) : (
          <>
            <header className="my-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Cover letter</p>
                <h1 className="mt-1 font-display text-3xl font-light">Edit letter</h1>
              </div>
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={!isDirty || updateMutation.isPending}
                className="gap-2"
              >
                {updateMutation.isPending ? <Save className="h-4 w-4 animate-pulse" /> : isDirty ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                {updateMutation.isPending ? "Saving…" : isDirty ? "Save changes" : "Saved"}
              </Button>
            </header>

            <div className="mb-4 space-y-2">
              <Label htmlFor="cover-letter-title">Title</Label>
              <Input
                id="cover-letter-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={160}
              />
            </div>
            <CoverLetterEditor
              content={content}
              onChange={setContent}
              placeholder="Write your cover letter…"
            />
          </>
        )}
      </main>
    </div>
  );
}