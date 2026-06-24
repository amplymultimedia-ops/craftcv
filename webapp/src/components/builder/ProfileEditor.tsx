import { Textarea } from "@/components/ui/textarea";
import { ResumeContent, PersonalInfo } from "@/lib/types";
import { ExperienceEditor } from "./ExperienceEditor";
import { EducationEditor } from "./EducationEditor";
import { SkillsEditor } from "./SkillsEditor";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { LinkedInImport } from "./LinkedInImport";

interface ProfileEditorProps {
  content: ResumeContent;
  onChange: (content: ResumeContent) => void;
}

export function ProfileEditor({ content, onChange }: ProfileEditorProps) {
  const { personalInfo } = content;

  const updatePersonal = (field: keyof PersonalInfo, value: string) => {
    onChange({
      ...content,
      personalInfo: { ...personalInfo, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <LinkedInImport onImport={(importedContent) => onChange(importedContent)} />

      <section>
        <h3 className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">Personal Info</h3>
        <PersonalInfoForm personalInfo={personalInfo} onChange={updatePersonal} />
      </section>

      <section>
        <h3 className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">Professional Summary</h3>
        <Textarea
          value={content.summary}
          onChange={(e) => onChange({ ...content, summary: e.target.value })}
          placeholder="A concise overview of your professional background and key strengths…"
          rows={4}
          className="text-sm resize-none"
        />
      </section>

      <ExperienceEditor
        experience={content.experience}
        onChange={(experience) => onChange({ ...content, experience })}
      />

      <EducationEditor
        education={content.education}
        onChange={(education) => onChange({ ...content, education })}
      />

      <SkillsEditor
        skills={content.skills}
        onChange={(skills) => onChange({ ...content, skills })}
      />

      <section>
        <h3 className="font-body font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3">Certifications</h3>
        <SkillsEditor
          skills={content.certifications}
          onChange={(certifications) => onChange({ ...content, certifications })}
          placeholder="Add certification…"
        />
      </section>
    </div>
  );
}
