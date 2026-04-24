export interface DocumentItem {
  id: string;
  filename: string;
  size_bytes: number;
  created_at: string;
}

export interface Citation {
  document: string;
  page: number | string;
  snippet: string;
}

export interface ChatResponse {
  answer: string;
  conversation_id: string;
  citations: Citation[];
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: Citation[];
}
