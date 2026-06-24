import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SkillsEditorProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}

export function SkillsEditor({ skills, onChange, placeholder = "Add skill…" }: SkillsEditorProps) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  const remove = (skill: string) => onChange(skills.filter((s) => s !== skill));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
    if (e.key === "Backspace" && input === "" && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-full font-body"
          >
            {skill}
            <button
              type="button"
              onClick={() => remove(skill)}
              className="hover:text-destructive transition-colors ml-0.5"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
      <p className="text-xs text-muted-foreground mt-1">Press Enter or comma to add</p>
    </div>
  );
}
