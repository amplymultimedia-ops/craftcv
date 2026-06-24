import { ToneOfVoice } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ToneSelectorProps {
  value: ToneOfVoice;
  onChange: (tone: ToneOfVoice) => void;
}

const TONES: { id: ToneOfVoice; label: string; desc: string }[] = [
  { id: "professional", label: "Professional", desc: "Formal, polished, authoritative" },
  { id: "confident", label: "Confident", desc: "Direct, assertive, results-driven" },
  { id: "human", label: "Human", desc: "Warm, approachable, genuine" },
  { id: "personal", label: "Personal", desc: "Story-driven, authentic, individual" },
  { id: "creative", label: "Creative", desc: "Dynamic, expressive, original" },
];

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="space-y-1.5">
      {TONES.map((tone) => (
        <button
          key={tone.id}
          type="button"
          onClick={() => onChange(tone.id)}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-md border transition-all text-sm",
            value === tone.id
              ? "border-primary bg-accent text-foreground"
              : "border-border bg-card hover:border-primary/40 hover:bg-muted/50 text-foreground"
          )}
        >
          <span className="font-medium block">{tone.label}</span>
          <span className="text-xs text-muted-foreground">{tone.desc}</span>
        </button>
      ))}
    </div>
  );
}
