import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me about plant diseases or upload an image." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
    setLoading(true);

    try {
      // Send message to backend API (change URL to your MCP endpoint)
      const response = await axios.post("http://localhost:8000/api/chat", {
        message: input,
      });

      // Add bot reply
      setMessages((msgs) => [...msgs, { sender: "bot", text: response.data.reply }]);
    } catch (error) {
      setMessages((msgs) => [...msgs, { sender: "bot", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow-md flex flex-col h-96">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.sender === "user" ? "bg-green-200 self-end" : "bg-gray-200 self-start"
            } max-w-[75%]`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <textarea
        className="w-full border rounded p-2 resize-none"
        rows={2}
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <button
        onClick={sendMessage}
        disabled={loading}
        className="mt-2 bg-green-600 text-white rounded py-2 disabled:bg-green-300"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default ChatBot;
