import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonalInfo } from "@/lib/types";
import { Camera, X } from "lucide-react";

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onChange: (field: keyof PersonalInfo, value: string) => void;
}

function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 160;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        // crop to square from center
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PersonalInfoForm({ personalInfo, onChange }: PersonalInfoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await resizeToBase64(file);
    onChange("photo", base64);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("photo", "");
  };

  return (
    <div className="space-y-4">
      {/* Photo upload widget */}
      <div className="flex justify-center">
        <div className="relative">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            aria-label="Upload profile photo"
          >
            {personalInfo.photo ? (
              <img
                src={personalInfo.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-6 h-6 text-gray-400" />
            )}
          </button>
          {personalInfo.photo ? (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-700 hover:bg-gray-900 text-white flex items-center justify-center transition-colors focus:outline-none"
              aria-label="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Grid fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Full Name</Label>
          <Input
            value={personalInfo.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Jane Smith"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Job Title</Label>
          <Input
            value={personalInfo.title ?? ""}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="Software Engineer"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input
            value={personalInfo.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="jane@example.com"
            type="email"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Phone</Label>
          <Input
            value={personalInfo.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+1 234 567 8900"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Location</Label>
          <Input
            value={personalInfo.location}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="New York, NY"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">LinkedIn</Label>
          <Input
            value={personalInfo.linkedin ?? ""}
            onChange={(e) => onChange("linkedin", e.target.value)}
            placeholder="linkedin.com/in/jane"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Website</Label>
          <Input
            value={personalInfo.website ?? ""}
            onChange={(e) => onChange("website", e.target.value)}
            placeholder="janesmith.dev"
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
