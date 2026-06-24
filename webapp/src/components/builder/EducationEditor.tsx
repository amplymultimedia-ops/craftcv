import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Education } from "@/lib/types";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface EducationEditorProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

function newEducation(): Education {
  return {
    id: crypto.randomUUID(),
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
  };
}

export function EducationEditor({ education, onChange }: EducationEditorProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    const entry = newEducation();
    onChange([...education, entry]);
    setExpanded(entry.id);
  };

  const remove = (id: string) => onChange(education.filter((e) => e.id !== id));

  const update = (id: string, field: keyof Education, value: string) =>
    onChange(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground">Education</h3>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={add}>
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {education.map((edu) => (
          <div key={edu.id} className="border border-border rounded-md overflow-hidden">
            <div
              className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpanded(expanded === edu.id ? null : edu.id)}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {edu.institution || "New Education"}
                </p>
                {edu.degree && (
                  <p className="text-xs text-muted-foreground truncate">{edu.degree}{edu.field ? ` — ${edu.field}` : ""}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive/60 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); remove(edu.id); }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                {expanded === edu.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </div>
            {expanded === edu.id && (
              <div className="px-3 pb-3 pt-1 border-t border-border bg-muted/20 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Institution</Label>
                  <Input value={edu.institution} onChange={(e) => update(edu.id, "institution", e.target.value)} placeholder="MIT" className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Degree</Label>
                    <Input value={edu.degree} onChange={(e) => update(edu.id, "degree", e.target.value)} placeholder="B.Sc." className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Field of Study</Label>
                    <Input value={edu.field} onChange={(e) => update(edu.id, "field", e.target.value)} placeholder="Computer Science" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Start Year</Label>
                    <Input value={edu.startDate} onChange={(e) => update(edu.id, "startDate", e.target.value)} placeholder="2018" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Year</Label>
                    <Input value={edu.endDate} onChange={(e) => update(edu.id, "endDate", e.target.value)} placeholder="2022" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">GPA (optional)</Label>
                    <Input value={edu.gpa ?? ""} onChange={(e) => update(edu.id, "gpa", e.target.value)} placeholder="3.8" className="h-8 text-sm" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
