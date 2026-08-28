import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="markdown-body prose prose-lg max-w-none text-fg prose-headings:font-display prose-a:text-accent prose-code:font-mono">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
