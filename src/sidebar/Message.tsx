import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message as MessageType } from '../shared/types';
import { BRAND_ORANGE } from '../shared/constants';

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-sm text-white"
          style={{ backgroundColor: BRAND_ORANGE }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* MiniMe message bubble */}
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: BRAND_ORANGE }}
        >
          M
        </div>

        {/* Content */}
        <div
          className={`max-w-[90%] px-3 py-2 rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-100 text-sm text-gray-800 ${
            message.streaming ? 'streaming-cursor' : ''
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ children, className }) {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return (
                    <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs my-1">
                      <code>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code className="bg-gray-100 rounded px-1 py-0.5 text-xs font-mono">
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-1 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-1 space-y-0.5">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-1 space-y-0.5">{children}</ol>;
              },
              strong({ children }) {
                return <strong className="font-semibold">{children}</strong>;
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* KB sources */}
      {message.sources && message.sources.length > 0 && !message.streaming && (
        <div className="ml-7 flex items-center gap-1 text-xs text-gray-400">
          <span>📎</span>
          <span>{message.sources.join(', ')}</span>
        </div>
      )}
    </div>
  );
}
