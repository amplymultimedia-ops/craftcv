import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";

interface TemplateGalleryProps {
  value: string;
  onChange: (templateId: string) => void;
}

export function TemplateGallery({ value, onChange }: TemplateGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onChange(template.id)}
          className={cn(
            "text-left rounded-lg border overflow-hidden transition-all hover:shadow-md",
            value === template.id
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-primary/40"
          )}
        >
          {/* Mini preview */}
          <div
            className="h-20 flex items-center justify-center"
            style={{ backgroundColor: template.accentColor + "14" }}
          >
            <div className="w-10 h-14 bg-white rounded shadow-sm flex flex-col p-1.5 gap-0.5">
              <div className="h-1 rounded-sm" style={{ backgroundColor: template.accentColor, width: "70%" }} />
              <div className="h-0.5 bg-gray-200 rounded-sm w-full" />
              <div className="h-0.5 bg-gray-200 rounded-sm w-4/5" />
              <div className="h-0.5 bg-gray-200 rounded-sm w-3/4 mt-0.5" />
              <div className="h-0.5 bg-gray-200 rounded-sm w-full" />
              <div className="h-0.5 bg-gray-200 rounded-sm w-2/3" />
            </div>
          </div>
          <div className="px-2.5 py-2 bg-card">
            <p className="text-xs font-medium text-foreground">{template.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{template.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
