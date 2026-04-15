import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

/**
 * Rendu Markdown pour le contenu des leçons (titres, gras, listes, liens).
 * Le contenu est fourni par notre backend ; pas de HTML brut arbitraire.
 */
const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-6 border-b border-white/[0.08] pb-2 text-base font-semibold tracking-tight text-[#F9FAFB] first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 text-sm font-semibold text-[#E6EDF3] first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-relaxed text-[#E6EDF3]/90 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#F3F4F6]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-[#E6EDF3]/95">{children}</em>,
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1.5 text-sm text-[#E6EDF3]/88">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1.5 text-sm text-[#E6EDF3]/88">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-0.5 marker:text-[#E6EDF3]/50">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-[#60A5FA] underline underline-offset-2 hover:text-[#93C5FD]"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-5 border-white/10" />,
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-[#3B82F6]/50 pl-3 text-sm text-[#E6EDF3]/75 italic">
      {children}
    </blockquote>
  ),
};

export function LessonMarkdown({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
