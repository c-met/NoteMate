import axios from "axios";
import type { ChatResponse, DocumentItem } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  timeout: 180000,
});

export async function uploadPdfs(files: File[], onUploadProgress?: (pct: number) => void) {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const { data } = await api.post<DocumentItem[]>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!evt.total || !onUploadProgress) return;
      onUploadProgress(Math.round((evt.loaded * 100) / evt.total));
    },
  });
  return data;
}

export async function getDocuments() {
  const { data } = await api.get<DocumentItem[]>("/documents");
  return data;
}

export async function deleteDocument(id: string) {
  await api.delete(`/documents/${id}`);
}

export async function askQuestion(message: string, conversationId?: string) {
  const { data } = await api.post<ChatResponse>("/chat", {
    message,
    conversation_id: conversationId,
  });
  return data;
}
