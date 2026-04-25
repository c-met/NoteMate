import { motion, AnimatePresence } from "framer-motion";
import type { DocumentItem } from "../types";
import { GlassCard } from "./GlassCard";

interface Props {
  documents: DocumentItem[];
  uploadState: "idle" | "uploading" | "parsing" | "success" | "error";
  progress: number;
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export function DocumentSidebar({ documents, uploadState, progress, onUpload, onDelete, isMobileOpen, setIsMobileOpen }: Props) {
  const uploadId = "pdf-upload-input";
  const isProcessing = uploadState === "uploading" || uploadState === "parsing";

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const sidebarContent = (
    <>
      {/* ── Brand ── */}
      <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="brand-icon w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="NoteMate logo" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <p className="font-bold text-[15px] text-text-heading tracking-tight leading-none">NoteMate</p>
            <p className="text-[10px] text-primary uppercase tracking-[0.18em] font-semibold mt-0.5">
              AI Exam Prep
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="status-dot w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          </div>
        </div>
      </div>

      {/* ── Upload ── */}
      <div className="px-4 pt-4">
        <label
          htmlFor={uploadId}
          className={`relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-[13px] font-bold transition-all duration-300 ${
            uploadState === "idle" || isProcessing ? "btn-primary text-[#001a14]" : ""
          } ${isProcessing ? "opacity-80 cursor-not-allowed" : "cursor-pointer"} ${
            uploadState === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : ""
          } ${
            uploadState === "error" ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" : ""
          } ${documents.length === 0 && uploadState === "idle" ? "upload-btn-idle" : ""}`}
        >
          {isProcessing && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300 ease-out" 
              style={{ width: `${uploadState === "parsing" ? 100 : progress}%` }} 
            />
          )}

          <span className="relative z-10 flex items-center gap-2">
            {uploadState === "idle" && (
              <>
                <UploadIcon />
                Upload PDF Notes
              </>
            )}
            {uploadState === "uploading" && (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}>
                  <SpinnerIcon />
                </motion.div>
                Uploading PDF...
              </>
            )}
            {uploadState === "parsing" && (
              <>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                  <PulseIcon />
                </motion.div>
                Parsing document...
              </>
            )}
            {uploadState === "success" && (
              <>
                <CheckIcon />
                Ready to chat!
              </>
            )}
            {uploadState === "error" && (
              <>
                <AlertIcon />
                Upload failed
              </>
            )}
          </span>
          <input
            id={uploadId}
            type="file"
            multiple
            accept="application/pdf"
            className="hidden"
            disabled={isProcessing}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) void onUpload(files);
              e.target.value = "";
            }}
          />
        </label>

        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex justify-between mb-1.5 px-0.5">
                <span className="text-[11px] text-text-muted">
                  {uploadState === "uploading" ? "Sending to server..." : "Extracting text & vectors..."}
                </span>
                {uploadState === "uploading" && (
                  <span className="text-[11px] font-semibold text-primary">{progress}%</span>
                )}
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: uploadState === "parsing" ? "100%" : `${progress}%`,
                    background: "linear-gradient(90deg, #0D9488, #14B8A6, #2DD4BF)",
                    backgroundSize: "200% 100%",
                    animation: uploadState === "parsing" ? "shimmer-line 1.5s linear infinite" : "none",
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-4 mt-6 mb-2.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-semibold">Study Library</p>
        <AnimatePresence>
          {documents.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="text-[10px] font-bold text-primary bg-primary-xmuted border border-border-primary px-2.5 py-0.5 rounded-full"
            >
              {documents.length}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        <AnimatePresence mode="popLayout">
          {documents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center px-2"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-2xl bg-primary-xmuted border border-border-primary flex items-center justify-center mb-3 text-primary"
                style={{ boxShadow: "0 0 20px rgba(20,184,166,0.15)" }}
              >
                <EmptyIcon />
              </motion.div>
              <p className="text-[13px] font-semibold text-text-body">No documents yet</p>
              <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                Upload your notes to get started
              </p>
            </motion.div>
          ) : (
            documents.map((doc, idx) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, x: -12, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -12, scale: 0.97 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 300, damping: 24 }}
                className="doc-card group relative flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 border border-transparent cursor-pointer"
              >
                <motion.div
                  className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-primary"
                  initial={{ scaleY: 0, opacity: 0 }}
                  whileHover={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                />
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-xmuted border border-border-primary flex items-center justify-center text-primary group-hover:bg-primary-muted transition-colors duration-150">
                  <PdfIcon />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-text-body">{doc.filename}</p>
                  <div className="flex gap-2 mt-0.5">
                    <p className="text-[10px] text-text-muted">{formatDate(doc.created_at)}</p>
                    {doc.size_bytes > 0 && (
                      <p className="text-[10px] text-text-muted">· {formatSize(doc.size_bytes)}</p>
                    )}
                  </div>
                </div>
                <motion.button
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 p-1 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150"
                  onClick={() => void onDelete(doc.id)}
                  title="Delete document"
                  aria-label={`Delete ${doc.filename}`}
                  whileTap={{ scale: 0.85 }}
                >
                  <TrashIcon />
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-white/[0.06]">
        <div className="flex items-start gap-2.5 bg-primary-xmuted border border-border-primary rounded-2xl px-3.5 py-3">
          <span className="text-base leading-none mt-0.5 flex-shrink-0">💡</span>
          <p className="text-[11px] text-text-subtle leading-relaxed">
            Upload lecture notes or textbooks and ask questions to ace your exam.
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Fixed floating sidebar — desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-[288px] p-3 z-40">
        <GlassCard shimmer className="h-full flex flex-col overflow-hidden">{sidebarContent}</GlassCard>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/55 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-x-3 top-16 bottom-24 z-50"
            >
              <GlassCard shimmer className="h-full flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-text-body">Study Library</p>
                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="text-[11px] text-text-muted hover:text-text-body transition-colors"
                  >
                    Close
                  </button>
                </div>
                {sidebarContent}
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Icons ─── */
function UploadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15V6M12 6L8.5 9.5M12 6L15.5 9.5M5 17V18.25C5 19.355 5.895 20.25 7 20.25H17C18.105 20.25 19 19.355 19 18.25V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 3.75H7.5C6.257 3.75 5.25 4.757 5.25 6V18C5.25 19.243 6.257 20.25 7.5 20.25H16.5C17.743 20.25 18.75 19.243 18.75 18V8L14.5 3.75Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M14.25 3.75V8.25H18.75" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.75 13.5H15.25M8.75 16H13.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 7H18M9 7V5C9 4.448 9.448 4 10 4H14C14.552 4 15 4.448 15 5V7M10 11V17M14 11V17M5 7L6 19C6 19.552 6.448 20 7 20H17C17.552 20 18 19.552 18 19L19 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6C4 4.895 4.895 4 6 4H14L20 10V20C20 21.105 19.105 22 18 22H6C4.895 22 4 21.105 4 20V6Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M14 4V10H20" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 14H16M8 17H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-75">
      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
