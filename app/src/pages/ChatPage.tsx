import { useEffect, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function ChatPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { convId } = useParams();

  const iframeSrc = useMemo(() => {
    if (convId) {
      return `/chat-app/index.html?conv=${encodeURIComponent(convId)}`;
    }
    return '/chat-app/index.html';
  }, [convId]);

  useEffect(() => {
    // Adjust iframe height to fill viewport minus header
    const adjustHeight = () => {
      if (iframeRef.current) {
        const headerHeight = 64;
        iframeRef.current.style.height = `${window.innerHeight - headerHeight}px`;
      }
    };

    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-900 hover:text-pink-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Powrót do strony głównej</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Lyra Chat</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Chat iframe */}
      <div className="pt-16">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full border-0"
          title="Lyra Chat"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
