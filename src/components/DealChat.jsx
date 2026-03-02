import React, { useState } from 'react';

export function DealChat({ messages = [], currentUserId, onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText('');
  };

  return (
    <div className="deal-chat">
      <div className="deal-chat__thread">
        {messages.length === 0 && (
          <div className="deal-chat__empty">Ще немає повідомлень по цій угоді.</div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`deal-chat__message ${
              m.system
                ? 'deal-chat__message--system'
                : m.authorId === currentUserId
                  ? 'deal-chat__message--mine'
                  : 'deal-chat__message--their'
            }`}
          >
            {!m.system && (
              <div className="deal-chat__author">{m.authorId}</div>
            )}
            <div className="deal-chat__text">{m.text}</div>
            <div className="deal-chat__time">{m.createdAt}</div>
          </div>
        ))}
      </div>

      <div className="deal-chat__input">
        <input
          type="text"
          placeholder="Повідомлення по угоді..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button type="button" className="primary-button primary-button--small" onClick={handleSend}>
          Надіслати
        </button>
      </div>
    </div>
  );
}

