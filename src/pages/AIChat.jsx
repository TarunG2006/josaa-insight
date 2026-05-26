import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Sparkles } from 'lucide-react';
import { askGemini, PREDEFINED_PROMPTS } from '../services/gemini';

export default function AIChat() {
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('OPEN');
  const [gender, setGender] = useState('Gender-Neutral');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your JoSAA Counseling Assistant. Tell me your rank and I'll help you navigate college choices, branches, and strategy. You can also use the quick prompts below!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(1, -1); // exclude system + latest
      const reply = await askGemini(userText, { rank, category, gender }, history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${err.message}. Please check your Gemini API key in the .env file.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line.startsWith('* ') || line.startsWith('- ')
          ? <span>• {line.slice(2)}</span>
          : line.startsWith('**') && line.endsWith('**')
          ? <strong>{line.slice(2, -2)}</strong>
          : line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px', height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>
          AI Counseling Assistant
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Powered by Gemini — get personalized college and branch recommendations
        </p>
      </div>

      {/* Profile row */}
      <div className="card p-4 mb-4" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Sparkles size={16} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginRight: 4 }}>Your Profile:</span>
        <input type="number" placeholder="CRL Rank" value={rank} onChange={e => setRank(e.target.value)} style={{ width: 130 }} />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 140 }}>
          {['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS'].map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={gender} onChange={e => setGender(e.target.value)} style={{ width: 180 }}>
          <option>Gender-Neutral</option>
          <option>Female-only (including Supernumerary)</option>
        </select>
      </div>

      {/* Chat area */}
      <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, marginBottom: 16,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'assistant' ? 'var(--primary)' : 'var(--bg)',
                border: msg.role === 'user' ? '1.5px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {msg.role === 'assistant'
                  ? <Bot size={16} color="#fff" />
                  : <User size={16} color="var(--text-secondary)" />}
              </div>
              <div style={{
                maxWidth: '72%',
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                padding: '11px 15px',
                fontSize: 13.5,
                lineHeight: 1.65,
              }}>
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={16} color="#fff" />
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: '4px 16px 16px 16px', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader size={14} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PREDEFINED_PROMPTS.map(({ label, text }) => (
            <button
              key={label}
              onClick={() => sendMessage(text)}
              disabled={loading}
              style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 999, padding: '5px 12px', fontSize: 12,
                fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Ask about colleges, branches, strategy…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
            disabled={loading}
          />
          <button
            className="btn-primary"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}