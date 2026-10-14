import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

interface LegalSection {
  title: string;
  paragraphs: string[];
}

function LegalDocument({ title, introduction, sections }: {
  title: string;
  introduction: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">CraftCV home</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-primary">Last updated October 14, 2026</p>
        <h1 className="mt-2 font-display text-4xl font-light text-foreground">{title}</h1>
        <p className="mt-4 text-muted-foreground">{introduction}</p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-medium text-foreground">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-muted-foreground">{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export function PrivacyPage() {
  const sections: LegalSection[] = [
    {
      title: "Information stored in your account",
      paragraphs: [
        "CraftCV stores your email address and account details, along with resumes, cover letters, imported profile content, job-ad text, and subscription status records that you create in the product.",
        "The application stores this information in its configured database so it can display and update your work across sessions.",
      ],
    },
    {
      title: "AI and email services",
      paragraphs: [
        "When you request document parsing, job-ad analysis, resume tailoring, cover-letter writing, or text rewriting, the relevant content is sent to the AI provider configured for CraftCV. That provider may be OpenAI or an Ollama service. The provider's own handling rules apply to data it receives.",
        "CraftCV uses Resend to deliver account verification emails. Your email address and the sign-in link are provided to that email-delivery service.",
      ],
    },
    {
      title: "Account deletion",
      paragraphs: [
        "You can request deletion from Settings. A confirmed deletion removes your account and its associated resumes, cover letters, imported profile, job ads, subscription record, and sessions from the CraftCV database. Outstanding sign-in links expire after ten minutes.",
      ],
    },
    {
      title: "Browser storage and security",
      paragraphs: [
        "CraftCV stores a bearer session token in browser local storage and sends it with authenticated requests. Do not use a shared device without signing out.",
        "No online service can promise perfect security. Use an email address you control and contact the service operator if you see account activity you did not initiate.",
      ],
    },
  ];

  return (
    <LegalDocument
      title="Privacy"
      introduction="This page explains the data CraftCV handles to provide its resume and job-application tools."
      sections={sections}
    />
  );
}

export function TermsPage() {
  const sections: LegalSection[] = [
    {
      title: "Using CraftCV",
      paragraphs: [
        "You may use CraftCV to organize your career information, prepare resumes and cover letters, and analyze job descriptions. Keep access to your account secure and provide information you have the right to use.",
      ],
    },
    {
      title: "Your content and generated output",
      paragraphs: [
        "You remain responsible for the information you upload or enter. AI-generated and AI-edited content can be incomplete or inaccurate; review every document and correct it before sending it to an employer.",
        "CraftCV does not guarantee interviews, employment, or a particular result from using generated content.",
      ],
    },
    {
      title: "Acceptable use",
      paragraphs: [
        "Do not use the service to upload content you are not authorized to provide, interfere with the service, attempt to access another person's data, or use the product for unlawful activity.",
      ],
    },
    {
      title: "Service availability and account closure",
      paragraphs: [
        "The service and its features may change or become unavailable. You may close your account from Settings; closure permanently removes account-associated product data as described in the Privacy page.",
      ],
    },
  ];

  return (
    <LegalDocument
      title="Terms of use"
      introduction="These terms describe the basic conditions for using CraftCV's resume and job-application tools."
      sections={sections}
    />
  );
}