'use client';

import { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle2, Trash2, Clock, MessageSquare } from 'lucide-react';

interface ContactMessageItem {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [selected, setSelected] = useState<ContactMessageItem | null>(null);
  const [notice, setNotice] = useState('');

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data?.messages) {
        setMessages(data.messages);
        if (selected) {
          const refreshed = data.messages.find((m: ContactMessageItem) => m._id === selected._id);
          setSelected(refreshed || null);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));
        if (selected?._id === id) setSelected({ ...selected, status });
        setNotice(`Message marked as ${status}.`);
        setTimeout(() => setNotice(''), 2500);
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Delete this contact message permanently?')) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (selected?._id === id) setSelected(null);
        setNotice('Message deleted.');
        setTimeout(() => setNotice(''), 2500);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);
  const newCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#123C2F]">
            Contact Messages
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Customer inquiries submitted from the storefront Contact page ({messages.length} total, {newCount} new).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'new', 'read', 'replied'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors border ${
                filter === tab
                  ? 'bg-[#123C2F] text-white border-[#123C2F]'
                  : 'bg-white text-[#333333] border-[#D9D9D4] hover:bg-[#E9EDE7]'
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            type="button"
            onClick={loadMessages}
            className="p-2 bg-white border border-[#D9D9D4] hover:bg-[#E9EDE7] rounded-md text-[#123C2F]"
            title="Refresh messages"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-md bg-[#E9EDE7] border border-[#123C2F]/20 text-[#123C2F] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-[#D9D9D4] rounded-lg p-12 text-center text-xs text-[#666666]">
          Loading contact messages...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#D9D9D4] rounded-lg p-12 text-center space-y-2">
          <MessageSquare className="w-8 h-8 text-[#123C2F]/40 mx-auto" />
          <p className="text-sm font-medium text-[#123C2F]">No contact messages found</p>
          <p className="text-xs text-[#666666]">
            Inquiries submitted via /contact will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Messages List */}
          <div className="lg:col-span-5 bg-white border border-[#D9D9D4] rounded-lg divide-y divide-[#D9D9D4] overflow-hidden">
            {filtered.map((msg) => {
              const isSelected = selected?._id === msg._id;
              return (
                <button
                  key={msg._id}
                  type="button"
                  onClick={() => {
                    setSelected(msg);
                    if (msg.status === 'new') updateStatus(msg._id, 'read');
                  }}
                  className={`w-full text-left p-4 transition-colors space-y-1.5 ${
                    isSelected ? 'bg-[#E9EDE7]/70' : 'hover:bg-[#FBF8F3]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#123C2F] truncate">
                      {msg.fullName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded shrink-0 ${
                        msg.status === 'new'
                          ? 'bg-[#123C2F] text-white'
                          : msg.status === 'replied'
                          ? 'bg-[#E9EDE7] text-[#123C2F]'
                          : 'bg-[#FBF8F3] text-[#666666] border border-[#D9D9D4]'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#333333] truncate">{msg.subject}</p>
                  <p className="text-xs text-[#666666] line-clamp-2">{msg.message}</p>
                  <p className="text-[11px] text-[#666666] flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Message Detail */}
          <div className="lg:col-span-7 bg-white border border-[#D9D9D4] rounded-lg p-5 sm:p-6">
            {selected ? (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#D9D9D4] pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-[#123C2F]">{selected.subject}</h2>
                    <p className="text-xs text-[#333333]">
                      From <strong>{selected.fullName}</strong> ({selected.email})
                    </p>
                    <p className="text-[11px] text-[#666666]">
                      Received: {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                      onClick={() => updateStatus(selected._id, 'replied')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#123C2F] hover:bg-[#0D2E24] text-white text-xs font-medium rounded-md transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => deleteMessage(selected._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md border border-[#D9D9D4]"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#FBF8F3] border border-[#D9D9D4] rounded-md p-4 text-sm text-[#333333] whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#D9D9D4]">
                  <span className="text-xs text-[#666666] mr-1">Set status:</span>
                  {(['new', 'read', 'replied'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateStatus(selected._id, st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize border transition-colors ${
                        selected.status === st
                          ? 'bg-[#123C2F] text-white border-[#123C2F]'
                          : 'bg-white text-[#333333] border-[#D9D9D4] hover:bg-[#E9EDE7]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#666666]">
                Select a message from the left to read its details and update its status.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

