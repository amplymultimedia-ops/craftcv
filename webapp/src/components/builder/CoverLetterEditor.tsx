import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { DOMSerializer } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Link2,
  Maximize2,
  Minimize2,
  Italic,
  Unlink,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Undo2,
  Redo2,
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
  { label: "Rewrite", instruction: "Rewrite this selected text for clarity while preserving the meaning and tone" },
  { label: "Shorter", instruction: "Make this shorter" },
  { label: "Longer", instruction: "Make this longer" },
  { label: "More formal", instruction: "Make this more formal" },
  { label: "More casual", instruction: "Make this more casual" },
  { label: "Fix grammar", instruction: "Fix grammar and spelling" },
];

function getSelectedHtml(ed: NonNullable<ReturnType<typeof useEditor>>): string {
  const fragment = ed.state.selection.content().content;
  const serializer = DOMSerializer.fromSchema(ed.schema);
  const container = document.createElement("div");
  container.appendChild(serializer.serializeFragment(fragment));
  return container.innerHTML;
}

export function CoverLetterEditor({
  content,
  onChange,
  placeholder = "Start writing your cover letter…",
}: CoverLetterEditorProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const getEditorClass = (expanded: boolean) =>
    cn(
      "prose prose-sm max-w-none focus:outline-none px-6 py-5 font-serif text-[12pt] leading-[1.75] text-gray-900",
      expanded ? "min-h-[70vh]" : "min-h-[400px]"
    );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
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
        class: getEditorClass(false),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          class: getEditorClass(isExpanded),
        },
      },
    });
  }, [editor, isExpanded]);

  useEffect(() => {
    if (editor && !editor.isFocused) {
      editor.commands.setContent(toHtml(content));
    }
  }, [content, editor]);

  const runAi = async (instruction: string) => {
    if (!editor || aiLoading) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, "\n\n");
    const selectedHtml = getSelectedHtml(editor);
    if (!selectedText.trim() && !selectedHtml.trim()) return;

    const selectedRange = { from, to };

    setAiLoading(true);
    try {
      const result = await api.post<{ text: string }>("/api/generate/edit-text", {
        text: selectedHtml || selectedText,
        instruction,
      });
      editor
        .chain()
        .focus()
        .insertContentAt(selectedRange, result.text)
        .run();
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

  const openLinkEditor = () => {
    if (!editor) return;
    const currentHref = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(currentHref ?? "");
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  };

  const applyLink = () => {
    if (!editor) return;

    const sanitized = linkUrl.trim();
    if (!sanitized) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    const href = sanitized.startsWith("http://") || sanitized.startsWith("https://")
      ? sanitized
      : `https://${sanitized}`;

    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setShowLinkInput(false);
  };

  const onLinkInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyLink();
    if (e.key === "Escape") setShowLinkInput(false);
  };

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px]"
          onClick={() => setIsExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "rounded-lg border border-border overflow-hidden bg-white shadow-sm",
          isExpanded && "fixed inset-6 z-50 flex flex-col"
        )}
      >
      {/* Formatting toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40">
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
            "h-7 px-2 text-xs",
            editor?.isActive("heading", { level: 2 }) && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs",
            editor?.isActive("heading", { level: 3 }) && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-7 px-2 text-xs", editor?.isActive("link") && "bg-accent text-accent-foreground")}
          onClick={openLinkEditor}
          title="Add or edit link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}
          title="Remove link"
        >
          <Unlink className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            editor?.isActive({ textAlign: "left" }) && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          title="Align left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            editor?.isActive({ textAlign: "center" }) && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          title="Align center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 w-7 p-0",
            editor?.isActive({ textAlign: "right" }) && "bg-accent text-accent-foreground"
          )}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          title="Align right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear formatting"
        >
          <Eraser className="w-3.5 h-3.5" />
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
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor?.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => editor?.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </Button>
        <div className="ml-auto" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1 text-xs"
          onClick={() => setIsExpanded((v) => !v)}
          title={isExpanded ? "Collapse editor" : "Expand editor"}
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              Collapse
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              Expand
            </>
          )}
        </Button>

        {showLinkInput && (
          <div className="flex items-center gap-1.5 ml-2 w-full sm:w-auto sm:min-w-[320px]">
            <Input
              ref={linkInputRef}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={onLinkInputKeyDown}
              placeholder="Paste URL (example.com)"
              className="h-7 text-xs"
            />
            <Button type="button" size="sm" className="h-7 text-xs" onClick={applyLink}>
              Apply
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setShowLinkInput(false)}
            >
              Cancel
            </Button>
          </div>
        )}
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
      <div className={cn(isExpanded && "flex-1 overflow-y-auto")}>
        <EditorContent editor={editor} />
      </div>
      </div>
    </>
  );
}
