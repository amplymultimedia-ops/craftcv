import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverLetterEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function toHtml(text: string): string {
  if (text.startsWith("<")) return text;
  return text
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const QUICK_ACTIONS = [
  { label: "Shorter", instruction: "Make this shorter" },
  { label: "Longer", instruction: "Make this longer" },
  { label: "More formal", instruction: "Make this more formal" },
  { label: "More casual", instruction: "Make this more casual" },
  { label: "Fix grammar", instruction: "Fix grammar and spelling" },
];

export function CoverLetterEditor({
  content,
  onChange,
  placeholder = "Start writing your cover letter…",
}: CoverLetterEditorProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:float-left before:text-muted-foreground/50 before:pointer-events-none before:h-0",
      }),
    ],
    content: toHtml(content),
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 py-5 font-serif text-[12pt] leading-[1.75] text-gray-900",
      },
    },
  });

  useEffect(() => {
    if (editor && !editor.isFocused) {
      editor.commands.setContent(toHtml(content));
    }
  }, [content, editor]);

  const runAi = async (instruction: string) => {
    if (!editor || aiLoading) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");
    if (!selectedText.trim()) return;

    setAiLoading(true);
    try {
      const result = await api.post<{ text: string }>("/api/generate/edit-text", {
        text: selectedText,
        instruction,
      });
      editor.chain().focus().insertContent(result.text).run();
    } catch {
      // silently fail — bubble menu will close
    } finally {
      setAiLoading(false);
      setCustomInstruction("");
    }
  };

  const handleCustomApply = () => {
    if (customInstruction.trim()) {
      runAi(customInstruction.trim());
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCustomApply();
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-white shadow-sm">
      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            editor?.isActive("bold") && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            editor?.isActive("italic") && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            editor?.isActive("underline") && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            editor?.isActive("bulletList") && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            editor?.isActive("orderedList") && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Bubble menu for AI editing */}
      {editor ? (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: ed, state }) => {
            const { from, to } = state.selection;
            return from !== to && !aiLoading;
          }}
        >
          <div className="flex flex-col gap-1.5 bg-gray-900 text-white rounded-xl shadow-xl px-3 py-2.5 max-w-[340px]">
            {aiLoading ? (
              <div className="flex items-center gap-2 px-1 py-0.5 text-sm text-gray-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Editing…</span>
              </div>
            ) : (
              <>
                {/* Quick action buttons */}
                <div className="flex flex-wrap gap-1">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => runAi(action.instruction)}
                      className="text-xs px-2 py-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-white whitespace-nowrap"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-700" />

                {/* Custom instruction */}
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <Input
                    ref={customInputRef}
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                    onKeyDown={handleCustomKeyDown}
                    placeholder="Custom instruction…"
                    className="h-6 text-xs bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-gray-500 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleCustomApply}
                    disabled={!customInstruction.trim()}
                    className="text-xs px-2 py-1 rounded-md bg-white text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap font-medium"
                  >
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>
        </BubbleMenu>
      ) : null}

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
