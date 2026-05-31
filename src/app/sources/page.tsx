// "use client";
// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/store/authStore";
// import api from "@/lib/api";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, Zap, Upload, FileText, Globe, Trash2 } from "lucide-react";

// const GithubIcon = () => (
//   <svg
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="1.8"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     style={{ width: 18, height: 18 }}
//   >
//     <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
//   </svg>
// );

// export default function SourcesPage() {
//   const [sources, setSources] = useState<any[]>([]);
//   const [owner, setOwner] = useState("");
//   const [repo, setRepo] = useState("");
//   const [branch, setBranch] = useState("main");
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);
//   const [pdfLoading, setPdfLoading] = useState(false);
//   const [dragOver, setDragOver] = useState(false);
//   const [scrapeUrl, setScrapeUrl] = useState("");
//   const [scrapeLoading, setScrapeLoading] = useState(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const router = useRouter();
//   const { logout } = useAuthStore();

//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");
//     if (!token) router.push("/login");
//   }, [router]);

//   const fetchSources = async () => {
//     try {
//       const { data } = await api.get("/sources");
//       setSources(data);
//     } catch {
//       toast.error("Failed to fetch sources");
//     } finally {
//       setFetching(false);
//     }
//   };

//   useEffect(() => {
//     fetchSources();
//     const interval = setInterval(fetchSources, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleAddSource = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post("/sources", { owner, repo, branch });
//       toast.success("Source added! Ingestion started.");
//       setOwner("");
//       setRepo("");
//       setBranch("main");
//       fetchSources();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || "Failed to add source");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePDFUpload = async (file: File) => {
//     if (!file || file.type !== "application/pdf") {
//       toast.error("Please upload a PDF file");
//       return;
//     }
//     setPdfLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       await api.post("/sources/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       toast.success(`${file.name} uploaded and indexed!`);
//       fetchSources();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || "Failed to upload PDF");
//     } finally {
//       setPdfLoading(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     setDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (file) handlePDFUpload(file);
//   };

//   const handleScrapeURL = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!scrapeUrl.trim()) return;
//     setScrapeLoading(true);
//     try {
//       await api.post("/sources/scrape", { url: scrapeUrl });
//       toast.success("URL scraped and indexed!");
//       setScrapeUrl("");
//       fetchSources();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || "Failed to scrape URL");
//     } finally {
//       setScrapeLoading(false);
//     }
//   };

//   const handleDeleteSource = async (sourceId: string) => {
//     setDeletingId(sourceId);
//     try {
//       await api.delete(`/sources/${sourceId}`);
//       toast.success("Source deleted");
//       fetchSources();
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || "Failed to delete source");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const statusStyles: Record<string, { color: string; bg: string }> = {
//     idle: { color: "rgba(245,240,232,.3)", bg: "rgba(245,240,232,.06)" },
//     running: { color: "#c4983a", bg: "rgba(196,152,58,.12)" },
//     done: { color: "#4ade80", bg: "rgba(74,222,128,.12)" },
//     error: { color: "#f87171", bg: "rgba(248,113,113,.12)" },
//   };

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
//         .sources-root { min-height: 100svh; overflow-y: auto; background: #0a0a0b; font-family: 'DM Sans', sans-serif; color: #f5f0e8; }
//         .sources-nav { height: 56px; border-bottom: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; justify-content: space-between; padding: 0 1rem; background: rgba(10,10,11,.8); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10; }
//         @media (min-width: 640px) { .sources-nav { padding: 0 1.5rem; } }
//         .nav-brand { display: flex; align-items: center; gap: 8px; font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: #f5f0e8; text-decoration: none; flex-shrink: 0; }
//         .nav-icon { width: 28px; height: 28px; background: linear-gradient(135deg, #c4983a, #e8c06e); border-radius: 7px; display: flex; align-items: center; justify-content: center; }
//         .nav-icon svg { color: #0a0a0b; width: 14px; height: 14px; }
//         .nav-right { display: flex; align-items: center; gap: .5rem; }
//         @media (min-width: 640px) { .nav-right { gap: 1rem; } }
//         .nav-links { display: flex; gap: .1rem; }
//         @media (min-width: 480px) { .nav-links { gap: .25rem; } }
//         .nav-link-btn { padding: 5px 8px !important; border-radius: 7px !important; font-size: .75rem !important; color: rgba(245,240,232,.6) !important; background: none !important; border: none !important; height: auto !important; font-family: 'DM Sans', sans-serif !important; transition: background .18s, color .18s !important; text-decoration: none; display: inline-flex; align-items: center; }
//         @media (min-width: 480px) { .nav-link-btn { padding: 6px 12px !important; font-size: .8rem !important; } }
//         .nav-link-btn:hover { background: rgba(255,255,255,.06) !important; color: rgba(245,240,232,.8) !important; }
//         .nav-link-btn.active { background: rgba(196,152,58,.12) !important; color: #c4983a !important; }
//         .logout-btn { padding: 5px 10px !important; height: auto !important; font-size: .75rem !important; color: rgba(245,240,232,.5) !important; background: rgba(255,255,255,.04) !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 7px !important; font-family: 'DM Sans', sans-serif !important; transition: all .18s !important; white-space: nowrap; }
//         .logout-btn:hover { background: rgba(255,255,255,.08) !important; color: rgba(245,240,232,.8) !important; }
//         .sources-page { max-width: 860px; margin: 0 auto; padding: 1.5rem 1rem; }
//         @media (min-width: 640px) { .sources-page { padding: 2.5rem 1.5rem; } }
//         .page-title { font-family: 'DM Serif Display', serif; font-size: 1.75rem; color: #f5f0e8; margin-bottom: .4rem; }
//         .page-sub { font-size: .85rem; color: rgba(245,240,232,.4); font-weight: 300; margin-bottom: 2rem; line-height: 1.6; }
//         .add-card { background: rgba(255,255,255,.03) !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 14px !important; margin-bottom: 1rem; }
//         .add-card-title { font-size: .68rem !important; font-weight: 500 !important; letter-spacing: .1em !important; text-transform: uppercase !important; color: rgba(245,240,232,.35) !important; }
//         .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: end; }
//         @media (min-width: 640px) { .form-row { grid-template-columns: 1fr 1fr 130px auto; } }
//         .form-branch { grid-column: 1 / 2; }
//         .form-submit { grid-column: 2 / 3; }
//         @media (min-width: 640px) { .form-branch { grid-column: auto; } .form-submit { grid-column: auto; } }
//         .sources-label { font-size: .7rem !important; font-weight: 500 !important; letter-spacing: .06em !important; text-transform: uppercase !important; color: rgba(245,240,232,.4) !important; }
//         .sources-input { height: 42px !important; background: rgba(255,255,255,.04) !important; border: 1px solid rgba(255,255,255,.09) !important; border-radius: 9px !important; color: #f5f0e8 !important; font-size: .85rem !important; font-weight: 300 !important; font-family: 'DM Sans', sans-serif !important; transition: border-color .2s, box-shadow .2s !important; }
//         .sources-input::placeholder { color: rgba(245,240,232,.2) !important; }
//         .sources-input:focus-visible { border-color: rgba(196,152,58,.45) !important; box-shadow: 0 0 0 3px rgba(196,152,58,.08) !important; outline: none !important; }
//         .add-source-btn { height: 42px !important; width: 100% !important; padding: 0 16px !important; background: linear-gradient(135deg, #c4983a, #d4a84a) !important; border: none !important; border-radius: 9px !important; color: #0a0a0b !important; font-size: .85rem !important; font-weight: 600 !important; font-family: 'DM Sans', sans-serif !important; white-space: nowrap; transition: transform .15s, box-shadow .2s, opacity .2s !important; }
//         @media (min-width: 640px) { .add-source-btn { width: auto !important; padding: 0 20px !important; } }
//         .add-source-btn:hover:not(:disabled) { transform: translateY(-1px) !important; box-shadow: 0 4px 16px rgba(196,152,58,.3) !important; }
//         .add-source-btn:disabled { opacity: .5 !important; cursor: not-allowed !important; }
//         .pdf-card { background: rgba(255,255,255,.03) !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 14px !important; margin-bottom: 1rem; }
//         .drop-zone { border: 1.5px dashed rgba(255,255,255,.12); border-radius: 10px; padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: border-color .2s, background .2s; text-align: center; }
//         .drop-zone:hover, .drop-zone.over { border-color: rgba(196,152,58,.5); background: rgba(196,152,58,.04); }
//         .drop-zone-icon { width: 40px; height: 40px; background: rgba(196,152,58,.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
//         .drop-zone-icon svg { color: #c4983a; width: 20px; height: 20px; }
//         .drop-zone-title { font-size: .88rem; font-weight: 500; color: rgba(245,240,232,.8); }
//         .drop-zone-sub { font-size: .75rem; color: rgba(245,240,232,.3); font-weight: 300; }
//         .browse-btn { padding: 6px 16px !important; height: auto !important; font-size: .78rem !important; background: rgba(196,152,58,.1) !important; border: 1px solid rgba(196,152,58,.2) !important; color: #c4983a !important; border-radius: 7px !important; font-family: 'DM Sans', sans-serif !important; transition: all .18s !important; margin-top: 4px; }
//         .browse-btn:hover { background: rgba(196,152,58,.18) !important; }
//         .source-card { background: rgba(255,255,255,.03) !important; border: 1px solid rgba(255,255,255,.07) !important; border-radius: 12px !important; transition: border-color .18s, background .18s !important; }
//         .source-card:hover { background: rgba(255,255,255,.05) !important; border-color: rgba(255,255,255,.12) !important; }
//         .source-icon-wrap { width: 38px; height: 38px; background: rgba(255,255,255,.05); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
//         .source-icon-wrap svg { color: rgba(245,240,232,.5); }
//         .source-name { font-size: .92rem; font-weight: 500; color: #f5f0e8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 400px; }
//         .source-meta { font-size: .75rem; color: rgba(245,240,232,.4); font-weight: 300; margin-top: 2px; }
//         .source-right { text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
//         .source-date { font-size: .72rem; color: rgba(245,240,232,.3); font-weight: 300; }
//         .status-badge { padding: 4px 10px !important; border-radius: 6px !important; font-size: .72rem !important; font-weight: 500 !important; letter-spacing: .04em !important; border: none !important; }
//         .delete-btn { background: none; border: none; cursor: pointer; color: rgba(248,113,113,.4); padding: 4px; border-radius: 6px; display: flex; align-items: center; transition: color .18s, background .18s; }
//         .delete-btn:hover { color: #f87171; background: rgba(248,113,113,.1); }
//         .empty { text-align: center; padding: 4rem 0; color: rgba(245,240,232,.3); font-size: .88rem; font-weight: 300; }
//       `}</style>

//       <div className="sources-root">
//         <nav className="sources-nav">
//           <a href="/dashboard" className="nav-brand">
//             <div className="nav-icon">
//               <Zap strokeWidth={2.5} />
//             </div>
//             ContextIQ
//           </a>
//           <div className="nav-right">
//             <div className="nav-links">
//               <a href="/dashboard" className="nav-link-btn">
//                 Chat
//               </a>
//               <a href="/sources" className="nav-link-btn active">
//                 Sources
//               </a>
//               <a href="/analytics" className="nav-link-btn">
//                 Analytics
//               </a>
//             </div>
//             <Button
//               className="logout-btn"
//               onClick={() => {
//                 logout();
//                 router.push("/login");
//               }}
//             >
//               Sign out
//             </Button>
//           </div>
//         </nav>

//         <div className="sources-page">
//           <h1 className="page-title">Knowledge Sources</h1>
//           <p className="page-sub">
//             Connect GitHub repositories, upload PDFs, or scrape any URL into
//             your knowledge base.
//           </p>

//           {/* GitHub form */}
//           <Card className="add-card">
//             <CardHeader className="pb-2 pt-4 px-4 sm:pb-3 sm:pt-5 sm:px-5">
//               <CardTitle className="add-card-title">
//                 Add GitHub Repository
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
//               <form onSubmit={handleAddSource}>
//                 <div className="form-row">
//                   <div className="space-y-1.5">
//                     <Label htmlFor="owner" className="sources-label">
//                       Owner
//                     </Label>
//                     <Input
//                       id="owner"
//                       className="sources-input"
//                       placeholder="facebook"
//                       value={owner}
//                       onChange={(e) => setOwner(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <Label htmlFor="repo" className="sources-label">
//                       Repository
//                     </Label>
//                     <Input
//                       id="repo"
//                       className="sources-input"
//                       placeholder="react"
//                       value={repo}
//                       onChange={(e) => setRepo(e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div className="space-y-1.5 form-branch">
//                     <Label htmlFor="branch" className="sources-label">
//                       Branch
//                     </Label>
//                     <Input
//                       id="branch"
//                       className="sources-input"
//                       placeholder="main"
//                       value={branch}
//                       onChange={(e) => setBranch(e.target.value)}
//                     />
//                   </div>
//                   <div className="form-submit flex flex-col justify-end">
//                     <Button
//                       type="submit"
//                       disabled={loading}
//                       className="add-source-btn"
//                     >
//                       {loading ? (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                       ) : (
//                         "Add source"
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>

//           {/* URL scraper */}
//           <Card className="pdf-card">
//             <CardHeader className="pb-2 pt-4 px-4 sm:pb-3 sm:pt-5 sm:px-5">
//               <CardTitle className="add-card-title">Scrape URL</CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
//               <form onSubmit={handleScrapeURL}>
//                 <div className="flex gap-2">
//                   <Input
//                     className="sources-input flex-1"
//                     placeholder="https://docs.example.com/getting-started"
//                     value={scrapeUrl}
//                     onChange={(e) => setScrapeUrl(e.target.value)}
//                     type="url"
//                     required
//                   />
//                   <Button
//                     type="submit"
//                     disabled={scrapeLoading}
//                     className="add-source-btn"
//                     style={{ width: "auto", padding: "0 20px" }}
//                   >
//                     {scrapeLoading ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       "Scrape"
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>

//           {/* PDF upload */}
//           <Card className="pdf-card" style={{ marginBottom: "2rem" }}>
//             <CardHeader className="pb-2 pt-4 px-4 sm:pb-3 sm:pt-5 sm:px-5">
//               <CardTitle className="add-card-title">Upload PDF</CardTitle>
//             </CardHeader>
//             <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
//               <div
//                 className={`drop-zone ${dragOver ? "over" : ""}`}
//                 onDragOver={(e) => {
//                   e.preventDefault();
//                   setDragOver(true);
//                 }}
//                 onDragLeave={() => setDragOver(false)}
//                 onDrop={handleDrop}
//                 onClick={() => fileInputRef.current?.click()}
//               >
//                 {pdfLoading ? (
//                   <>
//                     <Loader2
//                       className="h-6 w-6 animate-spin"
//                       style={{ color: "#c4983a" }}
//                     />
//                     <p className="drop-zone-title">Processing PDF...</p>
//                     <p className="drop-zone-sub">This may take a moment</p>
//                   </>
//                 ) : (
//                   <>
//                     <div className="drop-zone-icon">
//                       <Upload strokeWidth={1.8} />
//                     </div>
//                     <p className="drop-zone-title">Drop a PDF here</p>
//                     <p className="drop-zone-sub">
//                       or click to browse · Max 10MB
//                     </p>
//                     <Button className="browse-btn" type="button">
//                       Browse files
//                     </Button>
//                   </>
//                 )}
//               </div>
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="application/pdf"
//                 style={{ display: "none" }}
//                 onChange={(e) => {
//                   const file = e.target.files?.[0];
//                   if (file) handlePDFUpload(file);
//                 }}
//               />
//             </CardContent>
//           </Card>

//           {/* Sources list */}
//           <div className="flex flex-col gap-3">
//             {fetching ? (
//               <p className="empty">Loading sources...</p>
//             ) : sources.length === 0 ? (
//               <p className="empty">
//                 No sources yet. Add a GitHub repo, scrape a URL, or upload a PDF
//                 above.
//               </p>
//             ) : (
//               sources.map((source) => {
//                 const st = statusStyles[source.status] ?? statusStyles.idle;
//                 const isPDF = source.type === "pdf";
//                 const isURL = source.type === "url";
//                 return (
//                   <Card key={source.id} className="source-card">
//                     <CardContent className="py-4 px-5 flex items-center justify-between gap-3">
//                       <div className="flex items-center gap-3.5 min-w-0">
//                         <div className="source-icon-wrap">
//                           {isPDF ? (
//                             <FileText strokeWidth={1.8} />
//                           ) : isURL ? (
//                             <Globe strokeWidth={1.8} />
//                           ) : (
//                             <GithubIcon />
//                           )}
//                         </div>
//                         <div className="min-w-0">
//                           <p className="source-name">
//                             {isPDF
//                               ? source.config.fileName
//                               : isURL
//                                 ? source.config.url
//                                 : `${source.config.owner}/${source.config.repo}`}
//                           </p>
//                           <p className="source-meta">
//                             {isPDF
//                               ? "PDF document"
//                               : isURL
//                                 ? "Web page"
//                                 : `Branch: ${source.config.branch}`}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="source-right">
//                         <Badge
//                           className="status-badge"
//                           style={{ color: st.color, background: st.bg }}
//                         >
//                           {source.status === "running"
//                             ? "⟳ indexing..."
//                             : source.status}
//                         </Badge>
//                         <p className="source-date">
//                           {source.lastSyncedAt
//                             ? `Synced ${new Date(source.lastSyncedAt).toLocaleDateString()}`
//                             : "Not yet synced"}
//                         </p>
//                         <button
//                           className="delete-btn"
//                           onClick={() => handleDeleteSource(source.id)}
//                           disabled={deletingId === source.id}
//                           title="Delete source"
//                         >
//                           {deletingId === source.id ? (
//                             <Loader2 size={14} className="animate-spin" />
//                           ) : (
//                             <Trash2 size={14} strokeWidth={1.8} />
//                           )}
//                         </button>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Upload, FileText, Globe, Trash2, RefreshCw } from "lucide-react";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resyncingId, setResyncingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  const fetchSources = async () => {
    try {
      const { data } = await api.get("/sources");
      setSources(data);
    } catch {
      toast.error("Failed to fetch sources");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    fetchSources();
    const interval = setInterval(fetchSources, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/sources", { owner, repo, branch });
      toast.success("Source added! Ingestion started.");
      setOwner(""); setRepo(""); setBranch("main");
      fetchSources();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add source");
    } finally {
      setLoading(false);
    }
  };

  const handlePDFUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") { toast.error("Please upload a PDF file"); return; }
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/sources/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`${file.name} uploaded and indexed!`);
      fetchSources();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to upload PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePDFUpload(file);
  };

  const handleScrapeURL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;
    setScrapeLoading(true);
    try {
      await api.post("/sources/scrape", { url: scrapeUrl });
      toast.success("URL scraped and indexed!");
      setScrapeUrl("");
      fetchSources();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to scrape URL");
    } finally {
      setScrapeLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    setDeletingId(sourceId);
    try {
      await api.delete(`/sources/${sourceId}`);
      toast.success("Source deleted");
      fetchSources();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete source");
    } finally {
      setDeletingId(null);
    }
  };

  const handleResync = async (sourceId: string) => {
    setResyncingId(sourceId);
    try {
      await api.post(`/sources/${sourceId}/resync`);
      toast.success("Re-sync started!");
      fetchSources();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to re-sync");
    } finally {
      setResyncingId(null);
    }
  };

  const statusStyles: Record<string, { color: string; bg: string }> = {
    idle:    { color: "rgba(245,240,232,.3)",  bg: "rgba(245,240,232,.06)" },
    running: { color: "#c4983a",               bg: "rgba(196,152,58,.12)"  },
    done:    { color: "#4ade80",               bg: "rgba(74,222,128,.12)"  },
    error:   { color: "#f87171",               bg: "rgba(248,113,113,.12)" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        .sources-root { min-height: 100svh; overflow-y: auto; background: #0a0a0b; font-family: 'DM Sans', sans-serif; color: #f5f0e8; }
        .sources-nav { height: 56px; border-bottom: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; justify-content: space-between; padding: 0 1rem; background: rgba(10,10,11,.8); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10; }
        @media (min-width: 640px) { .sources-nav { padding: 0 1.5rem; } }
        .nav-brand { display: flex; align-items: center; gap: 8px; font-family: 'DM Serif Display', serif; font-size: 1.1rem; color: #f5f0e8; text-decoration: none; flex-shrink: 0; }
        .nav-icon { width: 28px; height: 28px; background: linear-gradient(135deg, #c4983a, #e8c06e); border-radius: 7px; display: flex; align-items: center; justify-content: center; }
        .nav-icon svg { color: #0a0a0b; width: 14px; height: 14px; }
        .nav-right { display: flex; align-items: center; gap: .5rem; }
        @media (min-width: 640px) { .nav-right { gap: 1rem; } }
        .nav-links { display: flex; gap: .1rem; }
        @media (min-width: 480px) { .nav-links { gap: .25rem; } }
        .nav-link-btn { padding: 5px 8px !important; border-radius: 7px !important; font-size: .75rem !important; color: rgba(245,240,232,.6) !important; background: none !important; border: none !important; height: auto !important; font-family: 'DM Sans', sans-serif !important; transition: background .18s, color .18s !important; text-decoration: none; display: inline-flex; align-items: center; }
        @media (min-width: 480px) { .nav-link-btn { padding: 6px 12px !important; font-size: .8rem !important; } }
        .nav-link-btn:hover { background: rgba(255,255,255,.06) !important; color: rgba(245,240,232,.8) !important; }
        .nav-link-btn.active { background: rgba(196,152,58,.12) !important; color: #c4983a !important; }
        .logout-btn { padding: 5px 10px !important; height: auto !important; font-size: .75rem !important; color: rgba(245,240,232,.5) !important; background: rgba(255,255,255,.04) !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 7px !important; font-family: 'DM Sans', sans-serif !important; transition: all .18s !important; white-space: nowrap; }
        .logout-btn:hover { background: rgba(255,255,255,.08) !important; color: rgba(245,240,232,.8) !important; }
        .sources-page { max-width: 860px; margin: 0 auto; padding: 1.5rem 1rem; }
        @media (min-width: 640px) { .sources-page { padding: 2.5rem 1.5rem; } }
        .page-title { font-family: 'DM Serif Display', serif; font-size: 1.75rem; color: #f5f0e8; margin-bottom: .4rem; }
        .page-sub { font-size: .85rem; color: rgba(245,240,232,.4); font-weight: 300; margin-bottom: 2rem; line-height: 1.6; }
        .add-card { background: rgba(255,255,255,.03) !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 14px !important; margin-bottom: 1rem; }
        .add-card-title { font-size: .68rem !important; font-weight: 500 !important; letter-spacing: .1em !important; text-transform: uppercase !important; color: rgba(245,240,232,.35) !important; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: end; }
        @media (min-width: 640px) { .form-row { grid-template-columns: 1fr 1fr 130px auto; } }
        .form-branch { grid-column: 1 / 2; }
        .form-submit { grid-column: 2 / 3; }
        @media (min-width: 640px) { .form-branch { grid-column: auto; } .form-submit { grid-column: auto; } }
        .sources-label { font-size: .7rem !important; font-weight: 500 !important; letter-spacing: .06em !important; text-transform: uppercase !important; color: rgba(245,240,232,.4) !important; }
        .sources-input { height: 42px !important; background: rgba(255,255,255,.04) !important; border: 1px solid rgba(255,255,255,.09) !important; border-radius: 9px !important; color: #f5f0e8 !important; font-size: .85rem !important; font-weight: 300 !important; font-family: 'DM Sans', sans-serif !important; transition: border-color .2s, box-shadow .2s !important; }
        .sources-input::placeholder { color: rgba(245,240,232,.2) !important; }
        .sources-input:focus-visible { border-color: rgba(196,152,58,.45) !important; box-shadow: 0 0 0 3px rgba(196,152,58,.08) !important; outline: none !important; }
        .add-source-btn { height: 42px !important; width: 100% !important; padding: 0 16px !important; background: linear-gradient(135deg, #c4983a, #d4a84a) !important; border: none !important; border-radius: 9px !important; color: #0a0a0b !important; font-size: .85rem !important; font-weight: 600 !important; font-family: 'DM Sans', sans-serif !important; white-space: nowrap; transition: transform .15s, box-shadow .2s, opacity .2s !important; }
        @media (min-width: 640px) { .add-source-btn { width: auto !important; padding: 0 20px !important; } }
        .add-source-btn:hover:not(:disabled) { transform: translateY(-1px) !important; box-shadow: 0 4px 16px rgba(196,152,58,.3) !important; }
        .add-source-btn:disabled { opacity: .5 !important; cursor: not-allowed !important; }
        .pdf-card { background: rgba(255,255,255,.03) !important; border: 1px solid rgba(255,255,255,.08) !important; border-radius: 14px !important; margin-bottom: 1rem; }
        .drop-zone { border: 1.5px dashed rgba(255,255,255,.12); border-radius: 10px; padding: 2rem 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: border-color .2s, background .2s; text-align: center; }
        .drop-zone:hover, .drop-zone.over { border-color: rgba(196,152,58,.5); background: rgba(196,152,58,.04); }
        .drop-zone-icon { width: 40px; height: 40px; background: rgba(196,152,58,.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .drop-zone-icon svg { color: #c4983a; width: 20px; height: 20px; }
        .drop-zone-title { font-size: .88rem; font-weight: 500; color: rgba(245,240,232,.8); }
        .drop-zone-sub { font-size: .75rem; color: rgba(245,240,232,.3); font-weight: 300; }
        .browse-btn { padding: 6px 16px !important; height: auto !important; font-size: .78rem !important; background: rgba(196,152,58,.1) !important; border: 1px solid rgba(196,152,58,.2) !important; color: #c4983a !important; border-radius: 7px !important; font-family: 'DM Sans', sans-serif !important; transition: all .18s !important; margin-top: 4px; }
        .browse-btn:hover { background: rgba(196,152,58,.18) !important; }
        .source-card { background: rgba(255,255,255,.03) !important; border: 1px solid rgba(255,255,255,.07) !important; border-radius: 12px !important; transition: border-color .18s, background .18s !important; }
        .source-card:hover { background: rgba(255,255,255,.05) !important; border-color: rgba(255,255,255,.12) !important; }
        .source-icon-wrap { width: 38px; height: 38px; background: rgba(255,255,255,.05); border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .source-icon-wrap svg { color: rgba(245,240,232,.5); }
        .source-name { font-size: .92rem; font-weight: 500; color: #f5f0e8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 400px; }
        .source-meta { font-size: .75rem; color: rgba(245,240,232,.4); font-weight: 300; margin-top: 2px; }
        .source-right { text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .source-date { font-size: .72rem; color: rgba(245,240,232,.3); font-weight: 300; }
        .status-badge { padding: 4px 10px !important; border-radius: 6px !important; font-size: .72rem !important; font-weight: 500 !important; letter-spacing: .04em !important; border: none !important; }
        .action-btns { display: flex; gap: 4px; align-items: center; }
        .icon-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; transition: color .18s, background .18s; }
        .icon-btn:disabled { opacity: .4; cursor: not-allowed; }
        .icon-btn.delete { color: rgba(248,113,113,.4); }
        .icon-btn.delete:hover:not(:disabled) { color: #f87171; background: rgba(248,113,113,.1); }
        .icon-btn.resync { color: rgba(196,152,58,.4); }
        .icon-btn.resync:hover:not(:disabled) { color: #c4983a; background: rgba(196,152,58,.1); }
        .empty { text-align: center; padding: 4rem 0; color: rgba(245,240,232,.3); font-size: .88rem; font-weight: 300; }
      `}</style>

      <div className="sources-root">
        <nav className="sources-nav">
          <a href="/dashboard" className="nav-brand">
            <div className="nav-icon"><Zap strokeWidth={2.5} /></div>
            ContextIQ
          </a>
          <div className="nav-right">
            <div className="nav-links">
              <a href="/dashboard" className="nav-link-btn">Chat</a>
              <a href="/sources" className="nav-link-btn active">Sources</a>
              <a href="/analytics" className="nav-link-btn">Analytics</a>
            </div>
            <Button className="logout-btn" onClick={() => { logout(); router.push("/login"); }}>
              Sign out
            </Button>
          </div>
        </nav>

        <div className="sources-page">
          <h1 className="page-title">Knowledge Sources</h1>
          <p className="page-sub">Connect GitHub repositories, upload PDFs, or scrape any URL into your knowledge base.</p>

          {/* GitHub form */}
          <Card className="add-card">
            <CardHeader className="pb-2 pt-4 px-4 sm:pb-3 sm:pt-5 sm:px-5">
              <CardTitle className="add-card-title">Add GitHub Repository</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <form onSubmit={handleAddSource}>
                <div className="form-row">
                  <div className="space-y-1.5">
                    <Label htmlFor="owner" className="sources-label">Owner</Label>
                    <Input id="owner" className="sources-input" placeholder="facebook" value={owner} onChange={(e) => setOwner(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="repo" className="sources-label">Repository</Label>
                    <Input id="repo" className="sources-input" placeholder="react" value={repo} onChange={(e) => setRepo(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5 form-branch">
                    <Label htmlFor="branch" className="sources-label">Branch</Label>
                    <Input id="branch" className="sources-input" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} />
                  </div>
                  <div className="form-submit flex flex-col justify-end">
                    <Button type="submit" disabled={loading} className="add-source-btn">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add source"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* URL scraper */}
          <Card className="pdf-card">
            <CardHeader className="pb-2 pt-4 px-4 sm:pb-3 sm:pt-5 sm:px-5">
              <CardTitle className="add-card-title">Scrape URL</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <form onSubmit={handleScrapeURL}>
                <div className="flex gap-2">
                  <Input className="sources-input flex-1" placeholder="https://docs.example.com/getting-started" value={scrapeUrl} onChange={(e) => setScrapeUrl(e.target.value)} type="url" required />
                  <Button type="submit" disabled={scrapeLoading} className="add-source-btn" style={{ width: "auto", padding: "0 20px" }}>
                    {scrapeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scrape"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* PDF upload */}
          <Card className="pdf-card" style={{ marginBottom: "2rem" }}>
            <CardHeader className="pb-2 pt-4 px-4 sm:pb-3 sm:pt-5 sm:px-5">
              <CardTitle className="add-card-title">Upload PDF</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <div className={`drop-zone ${dragOver ? "over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#c4983a" }} />
                    <p className="drop-zone-title">Processing PDF...</p>
                    <p className="drop-zone-sub">This may take a moment</p>
                  </>
                ) : (
                  <>
                    <div className="drop-zone-icon"><Upload strokeWidth={1.8} /></div>
                    <p className="drop-zone-title">Drop a PDF here</p>
                    <p className="drop-zone-sub">or click to browse · Max 10MB</p>
                    <Button className="browse-btn" type="button">Browse files</Button>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: "none" }}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePDFUpload(file); }}
              />
            </CardContent>
          </Card>

          {/* Sources list */}
          <div className="flex flex-col gap-3">
            {fetching ? (
              <p className="empty">Loading sources...</p>
            ) : sources.length === 0 ? (
              <p className="empty">No sources yet. Add a GitHub repo, scrape a URL, or upload a PDF above.</p>
            ) : (
              sources.map((source) => {
                const st = statusStyles[source.status] ?? statusStyles.idle;
                const isPDF = source.type === "pdf";
                const isURL = source.type === "url";
                const isGitHub = source.type === "github";
                return (
                  <Card key={source.id} className="source-card">
                    <CardContent className="py-4 px-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="source-icon-wrap">
                          {isPDF ? <FileText strokeWidth={1.8} /> : isURL ? <Globe strokeWidth={1.8} /> : <GithubIcon />}
                        </div>
                        <div className="min-w-0">
                          <p className="source-name">
                            {isPDF ? source.config.fileName : isURL ? source.config.url : `${source.config.owner}/${source.config.repo}`}
                          </p>
                          <p className="source-meta">
                            {isPDF ? "PDF document" : isURL ? "Web page" : `Branch: ${source.config.branch}`}
                          </p>
                        </div>
                      </div>
                      <div className="source-right">
                        <Badge className="status-badge" style={{ color: st.color, background: st.bg }}>
                          {source.status === "running" ? "⟳ indexing..." : source.status}
                        </Badge>
                        <p className="source-date">
                          {source.lastSyncedAt
                            ? `Synced ${new Date(source.lastSyncedAt).toLocaleDateString()}`
                            : "Not yet synced"}
                        </p>
                        <div className="action-btns">
                          {(isGitHub || isURL) && (
                            <button
                              className="icon-btn resync"
                              onClick={() => handleResync(source.id)}
                              disabled={resyncingId === source.id || source.status === 'running'}
                              title="Re-sync source"
                            >
                              {resyncingId === source.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <RefreshCw size={14} strokeWidth={1.8} />
                              }
                            </button>
                          )}
                          <button
                            className="icon-btn delete"
                            onClick={() => handleDeleteSource(source.id)}
                            disabled={deletingId === source.id}
                            title="Delete source"
                          >
                            {deletingId === source.id
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} strokeWidth={1.8} />
                            }
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}