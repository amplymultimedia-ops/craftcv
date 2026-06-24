import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CoverLetter } from "@/lib/types";
import { MoreHorizontal, Trash2, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CoverLetterCardProps {
  coverLetter: CoverLetter;
  onDelete: () => void;
}

export function CoverLetterCard({ coverLetter, onDelete }: CoverLetterCardProps) {
  const updatedAt = formatDistanceToNow(new Date(coverLetter.updatedAt), { addSuffix: true });
  const preview = coverLetter.content.slice(0, 120).trim();

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <div className="h-32 bg-accent/30 flex items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-3.5 h-3.5 text-accent-foreground/60" />
            <div className="h-1.5 bg-accent-foreground/20 rounded w-20" />
          </div>
          <div className="space-y-1">
            <div className="h-1.5 bg-accent-foreground/15 rounded w-full" />
            <div className="h-1.5 bg-accent-foreground/15 rounded w-5/6" />
            <div className="h-1.5 bg-accent-foreground/15 rounded w-4/5" />
          </div>
        </div>
      </div>

      <div className="p-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-body font-medium text-sm text-foreground truncate">{coverLetter.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{preview}</p>
          <p className="text-xs text-muted-foreground mt-1">Edited {updatedAt}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
  );
}
