'use client';

import { useState, useEffect } from 'react';
import { GuestMessage } from '@/types';

const INITIAL_MESSAGES: GuestMessage[] = [
  {
    id: 'msg-1',
    author: '게임 테크니컬 아티스트 협회',
    targetStudent: '김민준',
    message: '지브러쉬 조형 디테일과 디지털 브론즈 질감의 깊이가 인상적입니다. 차세대 디지털 아티스트로서의 성장을 응원합니다.',
    createdAt: '2026.09.21',
  },
  {
    id: 'msg-2',
    author: '현대 가상미술 큐레이터',
    targetStudent: '전체 졸업생',
    message: '단순한 게임 데모를 넘어 디지털 조각과 공간의 고유한 예술성을 진지하게 탐구한 훌륭한 비엔날레 기획전입니다.',
    createdAt: '2026.09.20',
  },
];

export default function GuestbookSection() {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [author, setAuthor] = useState('');
  const [targetStudent, setTargetStudent] = useState('');
  const [messageText, setMessageText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('induk_guestbook_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages(INITIAL_MESSAGES);
      }
    } else {
      setMessages(INITIAL_MESSAGES);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !messageText.trim()) return;

    const newMsg: GuestMessage = {
      id: `msg-${Date.now()}`,
      author: author.trim(),
      targetStudent: targetStudent.trim() || undefined,
      message: messageText.trim(),
      createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    };

    const updated = [newMsg, ...messages];
    setMessages(updated);
    localStorage.setItem('induk_guestbook_messages', JSON.stringify(updated));

    setAuthor('');
    setTargetStudent('');
    setMessageText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="guestbook" className="relative w-full py-32 bg-[#070709] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="border-b border-white/10 pb-12 mb-16">
          <span className="text-xs font-mono tracking-[0.3em] text-[#c5a880] uppercase">
            REGISTRY &bull; SIGNATURE LEDGER
          </span>
          <h2 className="serif-title text-3xl sm:text-5xl text-[#f4f4f6] font-normal tracking-tight mt-2">
            전시 방명록 (Visitor Registry)
          </h2>
          <p className="text-sm text-zinc-400 font-light mt-2">
            본 전시에 동행해 주신 관람객 및 학술 관계자 여러분의 기록을 남겨주십시오.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-4 p-8 rounded-xl bg-[#0e0e12] border border-white/5 h-fit">
            <h3 className="serif-title text-lg text-white font-normal mb-6">방명록 작성</h3>

            {submitted && (
              <div className="mb-4 text-xs font-mono text-[#c5a880] border border-[#c5a880]/30 p-3 rounded">
                서명이 정상적으로 등록되었습니다. 감사합니다.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div>
                <label className="block font-mono text-zinc-500 mb-1.5 uppercase tracking-wider">성함 / 소속</label>
                <input
                  type="text"
                  required
                  placeholder="홍길동 (큐레이터 / 학부모)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-white/10 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block font-mono text-zinc-500 mb-1.5 uppercase tracking-wider">응원 아티스트 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 김민준 작가, 디지털 조각 파트"
                  value={targetStudent}
                  onChange={(e) => setTargetStudent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-white/10 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block font-mono text-zinc-500 mb-1.5 uppercase tracking-wider">방명록 메시지</label>
                <textarea
                  required
                  rows={4}
                  placeholder="전시 소감 및 졸업 축하 메시지를 남겨주세요."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-black/60 border border-white/10 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a880] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded bg-white text-black font-mono font-medium tracking-wider uppercase hover:bg-zinc-200 transition-colors"
              >
                SIGN REGISTRY
              </button>
            </form>
          </div>

          {/* Registry Ledger Feed */}
          <div className="lg:col-span-8 space-y-4 max-h-[580px] overflow-y-auto pr-3">
            {messages.map((msg) => (
              <div key={msg.id} className="p-6 rounded-lg bg-[#0e0e12] border border-white/5">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white text-sm">{msg.author}</span>
                    {msg.targetStudent && (
                      <span className="text-[10px] font-mono text-[#c5a880] tracking-wider">
                        TO. {msg.targetStudent}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-600">{msg.createdAt}</span>
                </div>
                <p className="text-xs text-zinc-400 font-light leading-relaxed whitespace-pre-line">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
