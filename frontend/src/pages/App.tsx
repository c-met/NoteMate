import { useEffect, useState } from "react";
import { ChatPanel } from "../components/ChatPanel";
import { DocumentSidebar } from "../components/DocumentSidebar";
import { askQuestion, deleteDocument, getDocuments, uploadPdfs } from "../services/api";
import type { DocumentItem, Message } from "../types";
import axios from "axios";

export function App() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "parsing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [clearingChat, setClearingChat] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    void resetSessionOnPageLoad();
  }, []);

  async function resetSessionOnPageLoad() {
    try {
      const existingDocs = await getDocuments();
      if (existingDocs.length > 0) {
        await Promise.all(existingDocs.map((doc) => deleteDocument(doc.id)));
      }
      setMessages([]);
      setConversationId(undefined);
      setDocuments([]);
    } catch (_err) {
      try {
        await refreshDocuments();
      } catch {
        // Backend unavailable – start with empty state.
      }
    }
  }

  async function handleClearChat() {
    setClearingChat(true);
    await resetSessionOnPageLoad();
    setClearingChat(false);
  }

  async function refreshDocuments() {
    const docs = await getDocuments();
    setDocuments(docs);
  }

  async function handleUpload(files: File[]) {
    const invalid = files.find((f) => f.type !== "application/pdf");
    if (invalid) {
      alert("Only PDF files are allowed.");
      return;
    }
    const tooLarge = files.find((f) => f.size > 3 * 1024 * 1024);
    if (tooLarge) {
      alert("Please upload a PDF smaller than 3MB.");
      return;
    }
    setUploadState("uploading");
    setProgress(0);
    try {
      await uploadPdfs(files, (pct) => {
        setProgress(pct);
        if (pct === 100) {
          setUploadState("parsing");
        }
      });
      await refreshDocuments();
      setUploadState("success");
      setTimeout(() => setUploadState("idle"), 2500);
    } catch (err: any) {
      console.error("Upload Error:", err?.response?.data || err.message || err);
      const detail =
        axios.isAxiosError(err) && err.response?.data
          ? typeof err.response.data === "string"
            ? err.response.data
            : (err.response.data as { detail?: string }).detail || JSON.stringify(err.response.data)
          : err.message || "Unknown error";
      
      alert(`Upload Failed: ${detail}\n\nCheck the browser console for more details.`);
      setUploadState("error");
      setTimeout(() => setUploadState("idle"), 4000);
    }
  }

  async function handleDelete(id: string) {
    await deleteDocument(id);
    await refreshDocuments();
  }

  async function handleAsk(text: string) {
    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: new Date().toISOString() }]);
    setLoading(true);
    try {
      const res = await askQuestion(text, conversationId);
      const safeAnswer =
        typeof res.answer === "string" && res.answer.trim().length > 0
          ? res.answer
          : "I could not generate a visible answer. Please try asking again.";
      setConversationId(res.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: safeAnswer,
          timestamp: new Date().toISOString(),
          citations: res.citations,
        },
      ]);
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && err.response?.data
          ? typeof err.response.data === "string"
            ? err.response.data
            : (err.response.data as { detail?: string }).detail || JSON.stringify(err.response.data)
          : undefined;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: detail ? `Request failed: ${detail}` : "Something went wrong while processing your question.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    /*
      Unified workspace layout:
      - Sidebar: fixed floating glass panel
      - Main: natural page scroll, no glass wrapper
      - Input: fixed dock at bottom
    */
    <div className="min-h-screen">
      {/* Fixed floating sidebar */}
      <DocumentSidebar
        documents={documents}
        uploadState={uploadState}
        progress={progress}
        onUpload={handleUpload}
        onDelete={handleDelete}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Open workspace — content flows and scrolls with the page */}
      <main className="lg:ml-[288px] min-h-screen">
        <ChatPanel 
          messages={messages} 
          loading={loading} 
          onAsk={handleAsk} 
          onOpenSidebar={() => setIsMobileOpen(true)}
          onClearChat={handleClearChat}
          clearingChat={clearingChat}
        />
      </main>
    </div>
  );
}
