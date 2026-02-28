import type { Message } from '../lib/types';

interface Props {
  message: Message | null;
  username: string;
}

export default function MessageCard({ message, username }: Props) {
  if (!message) return null;

  return (
    <div className="share-card-wrap">
      <div className="share-card" id="share-card-node">
        <div className="share-card-inner">
          {message.prompt && <p className="share-card-prompt">{message.prompt}</p>}
          <h2 className="share-card-text">{message.content}</h2>
          <div className="share-card-brand">
            <span className="share-card-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" width="24" height="24">
                <path d="M256 48C136.5 48 40 130.3 40 230c0 55.4 30 105 77 139.2l-17 68c-2.4 9.6 7.8 17.2 16 11.8l72-46.4c22 7.2 45.8 11 68 11.4h0c119.5 0 216-82.3 216-183S375.5 48 256 48z" fill="#1d1d1f"/>
                <text x="256" y="262" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="200" fill="white">S</text>
              </svg>
            </span>
            <span>sema.link/{username}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
