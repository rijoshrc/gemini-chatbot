import { GoogleGenerativeAI } from "@google/generative-ai";
import { useRef, useState } from "react";
import Markdown from "react-markdown";

const API_KEY = "AIzaSyDFfVClZwBIFCxj1HZYll_HPE2LFEWwcjo";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro-001" });

type History = {
  id: string;
  text: string;
  sender: "user" | "model";
};

const chat = model.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 100,
  },
});

const ChatBox = () => {
  const [history, setHistory] = useState<History[] | any>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const text = inputRef.current?.value;
      if (loading || !text || !text.trim()) return;

      setLoading(true);
      addEntry(text, "user");
      inputRef.current.value = "";

      const result = await chat.sendMessage(text);
      const response = await result.response;
      const reply = response.text();

      console.log(await chat.getHistory());

      addEntry(reply, "model");
      setLoading(false);
    } catch (e) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = (text: string, sender: "user" | "model") => {
    const id = new Date().toISOString();
    const newChat: History = {
      text,
      id,
      sender,
    };

    setHistory((h: History[]) => [...h, newChat]);
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto">
        {history
          ? history?.map((message: History) => (
              <div
                className={`mb-2 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
                key={message.id}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  <Markdown>{message.text}</Markdown>
                </span>
              </div>
            ))
          : null}

        {loading && (
          <div className={`mb-2 "text-left`}>
            <span className={`inline-block p-2 rounded-lg bg-gray-300`}>
              <p>Typing...</p>
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center mt-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          className="flex-1 p-2 mr-2 border border-gray-300 rounded"
        />
        <button className="p-2 text-white bg-blue-500 rounded">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;
