import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Resume } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ResumeCardProps {
  resume: Resume;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function ResumeCard({ resume, onEdit, onDelete, onDuplicate }: ResumeCardProps) {
  const template = TEMPLATES.find((t) => t.id === resume.templateId) ?? TEMPLATES[0];
  const updatedAt = formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true });

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200">
      {/* Preview thumbnail */}
      <div
        className="h-32 flex items-center justify-center relative cursor-pointer"
        style={{ backgroundColor: template.accentColor + "18" }}
        onClick={onEdit}
      >
        <div className="w-16 h-20 bg-white rounded shadow-md flex flex-col p-2 gap-1">
          <div className="h-1.5 rounded-sm" style={{ backgroundColor: template.accentColor, width: "60%" }} />
          <div className="h-1 bg-muted rounded-sm w-4/5" />
          <div className="h-px bg-muted/60 rounded-sm w-full mt-0.5" />
          <div className="h-1 bg-muted rounded-sm w-3/4" />
          <div className="h-1 bg-muted rounded-sm w-2/3" />
          <div className="h-px bg-muted/40 rounded-sm w-full mt-0.5" />
          <div className="h-1 bg-muted rounded-sm w-4/5" />
          <div className="h-1 bg-muted rounded-sm w-3/5" />
        </div>
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-body font-medium px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm border border-border/50 text-muted-foreground">
            {template.name}
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div className="p-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-body font-medium text-sm text-foreground truncate">{resume.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Edited {updatedAt}</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-3.5 h-3.5 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
