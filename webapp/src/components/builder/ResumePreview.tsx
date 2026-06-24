import { ResumeContent } from "@/lib/types";
import { Template } from "@/lib/templates";

interface ResumePreviewProps {
  content: ResumeContent;
  template: Template;
}

export function ResumePreview({ content, template }: ResumePreviewProps) {
  const style = template.style;

  if (style === "sidebar" || style === "executive" || style === "tech") {
    return <TwoColumnPreview content={content} template={template} />;
  }

  return <SingleColumnPreview content={content} template={template} />;
}

// ─── Single-column layouts ────────────────────────────────────────────────────

function SingleColumnPreview({ content, template }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, skills, certifications, languages } = content;
  const { style, accentColor: accent } = template;

  const isElegant = style === "elegant";
  const isCompact = style === "compact";
  const isBold = style === "bold";
  const isCreative = style === "creative";
  const isModern = style === "modern";
  const isMinimal = style === "minimal";

  const baseFontSize = isCompact ? "9px" : "10.5px";
  const fontFamily = isElegant
    ? "'Garamond', 'Georgia', serif"
    : isBold || isCreative
    ? "'Arial Black', 'Arial', sans-serif"
    : "Arial, Helvetica, sans-serif";

  return (
    <div
      data-print-area
      style={{
        fontFamily,
        fontSize: baseFontSize,
        lineHeight: isCompact ? 1.35 : 1.5,
        color: "#1a1a1a",
        backgroundColor: "#fff",
        padding: isCompact ? "20px 22px" : "28px 32px",
        minHeight: "297mm",
      }}
    >
      {/* ── BOLD header ── */}
      {isBold && (
        <div style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: 900,
                  color: "#111",
                  lineHeight: 1,
                  letterSpacing: "-1.5px",
                  textTransform: "uppercase",
                }}
              >
                {personalInfo.name || "Your Name"}
              </div>
              {personalInfo.title && (
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: accent,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    marginTop: "6px",
                  }}
                >
                  {personalInfo.title}
                </div>
              )}
            </div>
            {personalInfo.photo ? (
              <img
                src={personalInfo.photo}
                alt={personalInfo.name || "Profile"}
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  marginLeft: "16px",
                }}
              />
            ) : null}
          </div>
          <div
            style={{
              height: "4px",
              backgroundColor: accent,
              margin: "12px 0",
              width: "100%",
            }}
          />
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "9px", color: "#555" }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            {personalInfo.website && <span>{personalInfo.website}</span>}
          </div>
        </div>
      )}

      {/* ── CREATIVE header ── */}
      {isCreative && (
        <div style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0", marginBottom: "8px" }}>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: accent,
                    lineHeight: 1,
                    letterSpacing: "-1px",
                    textTransform: "uppercase",
                  }}
                >
                  {(personalInfo.name || "Your Name").split(" ")[0]}
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 300,
                    color: "#111",
                    lineHeight: 1,
                    letterSpacing: "-1px",
                    textTransform: "uppercase",
                    marginLeft: "8px",
                  }}
                >
                  {(personalInfo.name || "Your Name").split(" ").slice(1).join(" ")}
                </div>
              </div>
              {personalInfo.title && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "#666",
                    fontWeight: 400,
                    textTransform: "uppercase",
                    letterSpacing: "2.5px",
                    marginBottom: "10px",
                  }}
                >
                  {personalInfo.title}
                </div>
              )}
            </div>
            {personalInfo.photo ? (
              <img
                src={personalInfo.photo}
                alt={personalInfo.name || "Profile"}
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  marginLeft: "16px",
                }}
              />
            ) : null}
          </div>
          <div
            style={{
              height: "2px",
              backgroundImage: `linear-gradient(to right, ${accent}, transparent)`,
              marginBottom: "10px",
            }}
          />
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "8.5px", color: "#666" }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          </div>
        </div>
      )}

      {/* ── ELEGANT header ── */}
      {isElegant && (
        <div style={{ textAlign: "center", marginBottom: "20px", paddingBottom: "14px" }}>
          {personalInfo.photo ? (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
              <img
                src={personalInfo.photo}
                alt={personalInfo.name || "Profile"}
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
          ) : null}
          <div
            style={{
              fontSize: "26px",
              fontWeight: 400,
              color: "#111",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontFamily: "'Garamond', 'Georgia', serif",
            }}
          >
            {personalInfo.name || "Your Name"}
          </div>
          {personalInfo.title && (
            <div
              style={{
                fontSize: "9.5px",
                color: accent,
                marginTop: "4px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                fontStyle: "italic",
              }}
            >
              {personalInfo.title}
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "18px",
              marginTop: "10px",
              fontSize: "8.5px",
              color: "#666",
            }}
          >
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "14px",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: accent + "60" }} />
            <div style={{ fontSize: "12px", color: accent }}>✦</div>
            <div style={{ flex: 1, height: "1px", backgroundColor: accent + "60" }} />
          </div>
        </div>
      )}

      {/* ── MODERN / MINIMAL / CLASSIC / COMPACT header ── */}
      {(isModern || isMinimal || style === "classic" || isCompact) && (
        <div style={{ marginBottom: isCompact ? "12px" : "18px" }}>
          {isModern && (
            <div style={{ height: "3px", backgroundColor: accent, marginBottom: "14px", borderRadius: "2px" }} />
          )}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: isCompact ? "20px" : isModern ? "26px" : "24px",
                  fontWeight: 700,
                  color: "#111",
                  letterSpacing: isModern ? "-0.5px" : "0",
                }}
              >
                {personalInfo.name || "Your Name"}
              </div>
              {personalInfo.title && (
                <div
                  style={{
                    fontSize: "10.5px",
                    color: isMinimal ? "#888" : accent,
                    fontWeight: isModern ? 600 : 400,
                    marginTop: "2px",
                    letterSpacing: isMinimal ? "1px" : "0",
                    textTransform: isMinimal ? "uppercase" : "none",
                  }}
                >
                  {personalInfo.title}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  fontSize: "8.5px",
                  color: "#777",
                  marginTop: isMinimal ? "8px" : "5px",
                }}
              >
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.location && <span>{personalInfo.location}</span>}
                {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                {personalInfo.website && <span>{personalInfo.website}</span>}
              </div>
            </div>
            {personalInfo.photo ? (
              <img
                src={personalInfo.photo}
                alt={personalInfo.name || "Profile"}
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  marginLeft: "16px",
                }}
              />
            ) : null}
          </div>
          {style === "classic" && (
            <div
              style={{ borderBottom: `1.5px solid ${accent}`, marginTop: "10px", opacity: 0.7 }}
            />
          )}
          {isMinimal && (
            <div style={{ borderBottom: "1px solid #e5e5e5", marginTop: "14px" }} />
          )}
        </div>
      )}

      {/* ── BODY SECTIONS ── */}

      {summary && (
        <SectionBlock title="Summary" style={style} accent={accent}>
          <p style={{ color: "#444", fontSize: isCompact ? "9px" : "10px", lineHeight: 1.55 }}>{summary}</p>
        </SectionBlock>
      )}

      {experience.length > 0 && (
        <SectionBlock title="Experience" style={style} accent={accent}>
          {experience.map((exp, i) => (
            <div key={exp.id} style={{ marginBottom: i < experience.length - 1 ? (isCompact ? "8px" : "12px") : 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: isCompact ? "9.5px" : "11px", color: "#111" }}>
                  {exp.role}
                </div>
                <div style={{ fontSize: "8.5px", color: "#888", whiteSpace: "nowrap" }}>
                  {exp.startDate}{exp.endDate ? ` — ${exp.current ? "Present" : exp.endDate}` : ""}
                </div>
              </div>
              <div
                style={{
                  fontSize: "9.5px",
                  color: isModern || isCreative || isBold ? accent : "#555",
                  fontWeight: 500,
                  marginTop: "1px",
                }}
              >
                {exp.company}
              </div>
              {exp.description && (
                <p style={{ fontSize: "9.5px", color: "#555", marginTop: "3px", lineHeight: 1.45 }}>
                  {exp.description}
                </p>
              )}
              {exp.bullets.length > 0 && (
                <ul style={{ marginTop: "4px", paddingLeft: "12px", listStyleType: "disc" }}>
                  {exp.bullets.map((b, bi) => (
                    <li key={bi} style={{ fontSize: "9px", color: "#444", marginBottom: "2px", lineHeight: 1.4 }}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </SectionBlock>
      )}

      {education.length > 0 && (
        <SectionBlock title="Education" style={style} accent={accent}>
          {education.map((edu, i) => (
            <div key={edu.id} style={{ marginBottom: i < education.length - 1 ? "8px" : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontWeight: 700, fontSize: "10.5px", color: "#111" }}>{edu.institution}</div>
                <div style={{ fontSize: "8.5px", color: "#888" }}>
                  {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}
                </div>
              </div>
              <div style={{ fontSize: "9.5px", color: "#555" }}>
                {edu.degree}{edu.field ? `, ${edu.field}` : ""}
              </div>
              {edu.gpa && (
                <div style={{ fontSize: "8.5px", color: "#888" }}>GPA: {edu.gpa}</div>
              )}
            </div>
          ))}
        </SectionBlock>
      )}

      {skills.length > 0 && (
        <SectionBlock title="Skills" style={style} accent={accent}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {skills.map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: "8.5px",
                  backgroundColor:
                    isMinimal
                      ? "#f3f4f6"
                      : isElegant
                      ? "transparent"
                      : accent + "20",
                  color: isMinimal ? "#374151" : isElegant ? accent : accent,
                  padding: isElegant ? "1px 0" : "2px 8px",
                  borderRadius: isMinimal ? "2px" : "20px",
                  fontWeight: 500,
                  border: isElegant ? "none" : "none",
                  marginRight: isElegant ? "8px" : "0",
                }}
              >
                {isElegant ? `· ${skill}` : skill}
              </span>
            ))}
          </div>
        </SectionBlock>
      )}

      {certifications.length > 0 && (
        <SectionBlock title="Certifications" style={style} accent={accent}>
          <ul style={{ paddingLeft: "12px", listStyleType: "disc" }}>
            {certifications.map((c, i) => (
              <li key={i} style={{ fontSize: "9.5px", color: "#444", marginBottom: "2px" }}>{c}</li>
            ))}
          </ul>
        </SectionBlock>
      )}

      {languages && languages.length > 0 && (
        <SectionBlock title="Languages" style={style} accent={accent}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {languages.map((lang) => (
              <span
                key={lang}
                style={{
                  fontSize: "8.5px",
                  backgroundColor: accent + "20",
                  color: accent,
                  padding: "2px 8px",
                  borderRadius: "20px",
                  fontWeight: 500,
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        </SectionBlock>
      )}
    </div>
  );
}

// ─── Section heading component ────────────────────────────────────────────────

function SectionBlock({
  title,
  style,
  accent,
  children,
}: {
  title: string;
  style: string;
  accent: string;
  children: React.ReactNode;
}) {
  const headingStyle: React.CSSProperties = (() => {
    switch (style) {
      case "modern":
        return {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        };
      case "minimal":
        return {
          fontSize: "8px",
          fontWeight: 600,
          color: "#bbb",
          textTransform: "uppercase" as const,
          letterSpacing: "2.5px",
          marginBottom: "8px",
          paddingBottom: "4px",
          borderBottom: "1px solid #ececec",
        };
      case "elegant":
        return {
          textAlign: "center" as const,
          marginBottom: "10px",
        };
      case "bold":
      case "creative":
        return {
          fontSize: "9px",
          fontWeight: 800,
          color: accent,
          textTransform: "uppercase" as const,
          letterSpacing: "2px",
          marginBottom: "8px",
          paddingBottom: "4px",
          borderBottom: `2px solid ${accent}`,
        };
      case "compact":
        return {
          fontSize: "8px",
          fontWeight: 700,
          color: "#333",
          textTransform: "uppercase" as const,
          letterSpacing: "1px",
          marginBottom: "5px",
          paddingBottom: "2px",
          borderBottom: `1px solid #ddd`,
        };
      default:
        return {
          fontSize: "9.5px",
          fontWeight: 700,
          color: "#111",
          textTransform: "uppercase" as const,
          letterSpacing: "0.8px",
          borderBottom: `1px solid #ddd`,
          paddingBottom: "3px",
          marginBottom: "8px",
        };
    }
  })();

  return (
    <div style={{ marginBottom: style === "compact" ? "10px" : "16px" }}>
      {style === "modern" ? (
        <div style={headingStyle}>
          <div
            style={{
              height: "14px",
              width: "3px",
              backgroundColor: accent,
              borderRadius: "2px",
            }}
          />
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: accent,
              textTransform: "uppercase",
              letterSpacing: "1.2px",
            }}
          >
            {title}
          </span>
        </div>
      ) : style === "elegant" ? (
        <div style={headingStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: accent + "40" }} />
            <span
              style={{
                fontSize: "9px",
                fontFamily: "'Garamond', 'Georgia', serif",
                fontStyle: "italic",
                color: accent,
                letterSpacing: "2px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: accent + "40" }} />
          </div>
        </div>
      ) : (
        <div style={headingStyle}>{title}</div>
      )}
      {children}
    </div>
  );
}

// ─── Two-column layouts ───────────────────────────────────────────────────────

function TwoColumnPreview({ content, template }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, skills, certifications, languages } = content;
  const { style, accentColor: accent } = template;

  const isSidebar = style === "sidebar";
  const isTech = style === "tech";
  const isExecutive = style === "executive";

  const sidebarBg = isSidebar ? accent : isTech ? "#0f172a" : isExecutive ? "#1e1b4b" : "#1e293b";
  const sidebarText = "#fff";
  const sidebarMuted = "rgba(255,255,255,0.55)";
  const mainAccent = isTech ? "#38bdf8" : isExecutive ? "#a78bfa" : accent;

  return (
    <div
      data-print-area
      style={{
        display: "flex",
        minHeight: "297mm",
        backgroundColor: "#fff",
        fontFamily: isTech ? "'Courier New', 'Consolas', monospace" : "Arial, Helvetica, sans-serif",
        fontSize: "10px",
        color: "#1a1a1a",
      }}
    >
      {/* ── SIDEBAR ── */}
      <div
        style={{
          width: isTech ? "34%" : "32%",
          backgroundColor: sidebarBg,
          padding: "28px 16px",
          color: sidebarText,
          flexShrink: 0,
        }}
      >
        {/* Name & title in sidebar */}
        <div style={{ marginBottom: "22px" }}>
          {personalInfo.photo ? (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <img
                src={personalInfo.photo}
                alt={personalInfo.name || "Profile"}
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              />
            </div>
          ) : null}
          <div
            style={{
              fontSize: isTech ? "14px" : "16px",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: isTech ? "0" : "-0.3px",
            }}
          >
            {personalInfo.name || "Your Name"}
          </div>
          {personalInfo.title && (
            <div
              style={{
                fontSize: "8.5px",
                color: isTech ? mainAccent : "rgba(255,255,255,0.65)",
                marginTop: "4px",
                fontWeight: isTech ? 400 : 500,
                letterSpacing: isTech ? "0.5px" : "0",
                lineHeight: 1.4,
              }}
            >
              {personalInfo.title}
            </div>
          )}
        </div>

        {/* Contact */}
        <SidebarSection label="Contact" muted={sidebarMuted} accent={mainAccent}>
          {[
            personalInfo.email,
            personalInfo.phone,
            personalInfo.location,
            personalInfo.linkedin,
            personalInfo.website,
          ]
            .filter(Boolean)
            .map((val, i) => (
              <div
                key={i}
                style={{ fontSize: "8px", color: sidebarText, marginBottom: "3px", wordBreak: "break-all", lineHeight: 1.4 }}
              >
                {val}
              </div>
            ))}
        </SidebarSection>

        {/* Skills */}
        {skills.length > 0 && (
          <SidebarSection label="Skills" muted={sidebarMuted} accent={mainAccent}>
            {skills.map((skill) => (
              <div
                key={skill}
                style={{
                  fontSize: "8px",
                  color: sidebarText,
                  padding: "2px 0",
                  borderBottom: `1px solid rgba(255,255,255,0.08)`,
                  lineHeight: 1.5,
                }}
              >
                {isTech ? `> ${skill}` : skill}
              </div>
            ))}
          </SidebarSection>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <SidebarSection label="Languages" muted={sidebarMuted} accent={mainAccent}>
            {languages.map((lang) => (
              <div key={lang} style={{ fontSize: "8px", color: sidebarText, marginBottom: "2px" }}>
                {lang}
              </div>
            ))}
          </SidebarSection>
        )}

        {/* Certifications in sidebar */}
        {certifications.length > 0 && (
          <SidebarSection label="Certifications" muted={sidebarMuted} accent={mainAccent}>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: "8px", color: sidebarText, marginBottom: "3px", lineHeight: 1.4 }}>
                {c}
              </div>
            ))}
          </SidebarSection>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: "28px 22px", minWidth: 0 }}>
        {summary && (
          <div style={{ marginBottom: "16px" }}>
            <TwoColSectionHead label="Summary" accent={mainAccent} style={style} />
            <p style={{ fontSize: "9.5px", color: "#444", lineHeight: 1.55 }}>{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <TwoColSectionHead label="Experience" accent={mainAccent} style={style} />
            {experience.map((exp, i) => (
              <div key={exp.id} style={{ marginBottom: i < experience.length - 1 ? "12px" : 0 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
                >
                  <div style={{ fontWeight: 700, fontSize: "10.5px", color: "#111" }}>{exp.role}</div>
                  <div style={{ fontSize: "8.5px", color: "#888", whiteSpace: "nowrap", marginLeft: "8px" }}>
                    {exp.startDate}{exp.endDate ? ` — ${exp.current ? "Present" : exp.endDate}` : ""}
                  </div>
                </div>
                <div style={{ fontSize: "9px", color: mainAccent, fontWeight: 500 }}>{exp.company}</div>
                {exp.description && (
                  <p style={{ fontSize: "9px", color: "#555", marginTop: "2px", lineHeight: 1.45 }}>
                    {exp.description}
                  </p>
                )}
                {exp.bullets.map((b, bi) => (
                  <div key={bi} style={{ fontSize: "9px", color: "#444", paddingLeft: "10px", lineHeight: 1.4 }}>
                    • {b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <TwoColSectionHead label="Education" accent={mainAccent} style={style} />
            {education.map((edu, i) => (
              <div key={edu.id} style={{ marginBottom: i < education.length - 1 ? "8px" : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontWeight: 700, fontSize: "10.5px", color: "#111" }}>{edu.institution}</div>
                  <div style={{ fontSize: "8.5px", color: "#888" }}>
                    {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}
                  </div>
                </div>
                <div style={{ fontSize: "9.5px", color: "#555" }}>
                  {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                </div>
                {edu.gpa && <div style={{ fontSize: "8.5px", color: "#888" }}>GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarSection({
  label,
  muted,
  accent,
  children,
}: {
  label: string;
  muted: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          fontSize: "7.5px",
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "1.5px",
          color: muted,
          marginBottom: "7px",
          paddingBottom: "4px",
          borderBottom: `1px solid rgba(255,255,255,0.12)`,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function TwoColSectionHead({ label, accent, style }: { label: string; accent: string; style: string }) {
  const isTech = style === "tech";
  return (
    <div
      style={{
        fontSize: isTech ? "8.5px" : "9px",
        fontWeight: 700,
        color: accent,
        textTransform: "uppercase" as const,
        letterSpacing: isTech ? "1.5px" : "1px",
        borderBottom: `1.5px solid ${accent}`,
        paddingBottom: "3px",
        marginBottom: "9px",
        fontFamily: isTech ? "'Courier New', monospace" : "inherit",
      }}
    >
      {isTech ? `// ${label}` : label}
    </div>
  );
}
