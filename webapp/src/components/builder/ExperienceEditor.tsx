import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Experience } from "@/lib/types";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface ExperienceEditorProps {
  experience: Experience[];
  onChange: (experience: Experience[]) => void;
}

function newExperience(): Experience {
  return {
    id: crypto.randomUUID(),
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    bullets: [],
  };
}

export function ExperienceEditor({ experience, onChange }: ExperienceEditorProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    const entry = newExperience();
    onChange([...experience, entry]);
    setExpanded(entry.id);
  };

  const remove = (id: string) => onChange(experience.filter((e) => e.id !== id));

  const update = (id: string, field: keyof Experience, value: unknown) =>
    onChange(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const updateBullets = (id: string, raw: string) => {
    const bullets = raw.split("\n").filter((b) => b.trim() !== "");
    update(id, "bullets", bullets);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground">Experience</h3>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={add}>
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {experience.map((exp) => (
          <div key={exp.id} className="border border-border rounded-md overflow-hidden">
            <div
              className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {exp.role || exp.company || "New Experience"}
                </p>
                {exp.company && exp.role && (
                  <p className="text-xs text-muted-foreground truncate">{exp.company}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive/60 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); remove(exp.id); }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                {expanded === exp.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            </div>
            {expanded === exp.id && (
              <div className="px-3 pb-3 pt-1 border-t border-border bg-muted/20 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Company</Label>
                    <Input value={exp.company} onChange={(e) => update(exp.id, "company", e.target.value)} placeholder="Acme Inc." className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Role</Label>
                    <Input value={exp.role} onChange={(e) => update(exp.id, "role", e.target.value)} placeholder="Senior Engineer" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <Input value={exp.startDate} onChange={(e) => update(exp.id, "startDate", e.target.value)} placeholder="Jan 2022" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <Input value={exp.endDate} onChange={(e) => update(exp.id, "endDate", e.target.value)} placeholder="Present" disabled={exp.current} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={exp.current ?? false}
                    onChange={(e) => { update(exp.id, "current", e.target.checked); if (e.target.checked) update(exp.id, "endDate", "Present"); }}
                    className="rounded border-border"
                  />
                  <Label htmlFor={`current-${exp.id}`} className="text-xs cursor-pointer">Current role</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea value={exp.description} onChange={(e) => update(exp.id, "description", e.target.value)} placeholder="Brief role overview…" rows={2} className="text-sm resize-none" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Bullet Points (one per line)</Label>
                  <Textarea
                    value={exp.bullets.join("\n")}
                    onChange={(e) => updateBullets(exp.id, e.target.value)}
                    placeholder={"Increased revenue by 30%...\nLed a team of 5 engineers..."}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
