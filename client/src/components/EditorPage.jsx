// import React, { useEffect, useRef, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// // import ReactQuill from "react-quill";
// // import "react-quill/dist/quill.snow.css";
// import ReactQuill from "react-quill-new";
// import "react-quill-new/dist/quill.snow.css";
// import { io } from "socket.io-client";
// import { getToken, getCurrentUser, removeToken } from "../utils/auth";

// const API_BASE = import.meta.env.VITE_API_BASE;
// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE;

// export default function EditorPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [lastSaved, setLastSaved] = useState(null);
//   const [presence, setPresence] = useState([]);
//   const [aiResponse, setAiResponse] = useState("");
//   const [aiLoading, setAiLoading] = useState(false);

//   const quillRef = useRef(null);
//   const socketRef = useRef(null);
//   const user = getCurrentUser();

//   // 🧠 Auto-save every 30s
//   useEffect(() => {
//     const interval = setInterval(() => handleSave(), 30000);
//     return () => clearInterval(interval);
//   }, [content]);

//   // ⚙️ Load document + connect socket
//   useEffect(() => {
//     if (!id) return;

//     loadDocument();
//     setupSocket();

//     return () => {
//       socketRef.current?.emit("leave-document", { documentId: id });
//       socketRef.current?.disconnect();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   async function loadDocument() {
//     try {
//       const res = await axios.get(`${API_BASE}/documents/${id}`, {
//         withCredentials: true,
//       });
//       setTitle(res.data?.title || "Untitled Document");
//       setContent(res.data?.content || "");
//     } catch (err) {
//       console.error("❌ Failed to load document", err);
//       alert("Error loading document. Redirecting...");
//       navigate("/");
//     }
//   }

//   function setupSocket() {
//     const token = getToken();
//     const socket = io(SOCKET_URL, {
//       withCredentials: true,
//       auth: { token },
//     });
//     socketRef.current = socket;

//     socket.emit("join-document", { documentId: id, user });

//     socket.on("document-content", ({ html }) => setContent(html));
//     socket.on("text-change", ({ delta, userId }) => {
//       if (userId === user?.id) return;
//       const quill = quillRef.current?.getEditor();
//       if (quill && delta) quill.updateContents(delta);
//     });
//     socket.on("user-joined", (u) =>
//       setPresence((prev) => [...prev.filter((p) => p.id !== u.id), u])
//     );
//     socket.on("user-left", (u) =>
//       setPresence((prev) => prev.filter((p) => p.id !== u.id))
//     );
//   }

//   function handleEditorChange(content, delta, source) {
//     if (source !== "user") return;
//     socketRef.current?.emit("text-change", {
//       documentId: id,
//       delta,
//       userId: user?.id,
//     });
//     setContent(content);
//   }

//   async function handleSave() {
//     if (saving) return;
//     setSaving(true);
//     try {
//       await axios.put(
//         `${API_BASE}/documents/${id}`,
//         { content },
//         { withCredentials: true }
//       );
//       setLastSaved(new Date().toLocaleTimeString());
//       socketRef.current?.emit("document-saved", { documentId: id });
//     } catch (err) {
//       console.error("❌ Save failed", err);
//       alert("Failed to save document.");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleLogout() {
//     try {
//       await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
//     } catch (err) {
//       console.warn("Logout failed", err);
//     } finally {
//       removeToken();
//       navigate("/login");
//     }
//   }

//   // 🧠 AI Assistant Functions
//   async function callAI(endpoint) {
//     if (!content.trim()) return alert("Please write something first!");
//     setAiLoading(true);
//     setAiResponse("");

//     try {
//       const res = await axios.post(`${API_BASE}/ai/${endpoint}`, {
//         text: content,
//       });
//       setAiResponse(res.data?.result || "No response from AI");
//     } catch (err) {
//       console.error("AI error:", err);
//       alert(err.response?.data?.message || "AI request failed");
//     } finally {
//       setAiLoading(false);
//     }
//   }

//   return (
//     <div className="container-fluid py-3">
//       {/* Top Bar */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h4>{title}</h4>
//           <small className="text-muted">
//             Last saved: {lastSaved ? lastSaved : "Not yet saved"}
//           </small>
//         </div>
//         <div>
//           <button
//             className="btn btn-outline-secondary me-2"
//             onClick={() => navigate("/")}
//           >
//             Back
//           </button>
//           <button
//             className="btn btn-outline-primary me-2"
//             onClick={handleSave}
//             disabled={saving}
//           >
//             {saving ? "Saving..." : "Save"}
//           </button>
//           <button className="btn btn-outline-danger" onClick={handleLogout}>
//             Logout
//           </button>
//         </div>
//       </div>

//       <div className="row">
//         {/* Editor */}
//         <div className="col-lg-9 mb-3">
//           <ReactQuill
//             ref={quillRef}
//             theme="snow"
//             value={content}
//             onChange={handleEditorChange}
//             modules={{
//               toolbar: [
//                 [{ header: [1, 2, false] }],
//                 ["bold", "italic", "underline", "strike"],
//                 [{ list: "ordered" }, { list: "bullet" }],
//                 ["blockquote", "code-block"],
//                 ["link", "image"],
//                 ["clean"],
//               ],
//             }}
//             style={{ backgroundColor: "#fff", minHeight: "500px" }}
//           />
//         </div>

//         {/* Sidebar */}
//         <div className="col-lg-3">
//           {/* Collaborators */}
//           <div className="card shadow-sm mb-3">
//             <div className="card-body">
//               <h6 className="card-title">Collaborators Online</h6>
//               <ul className="list-group list-group-flush">
//                 {presence.length === 0 && (
//                   <li className="list-group-item text-muted small">
//                     No one else is online.
//                   </li>
//                 )}
//                 {presence.map((p) => (
//                   <li key={p.id} className="list-group-item">
//                     <span className="badge bg-success me-2">●</span>
//                     {p.name || p.email || "User"}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* AI Assistant */}
//           <div className="card shadow-sm">
//             <div className="card-body">
//               <h6 className="card-title">🧠 AI Assistant</h6>
//               <div className="d-grid gap-2 mb-3">
//                 <button
//                   className="btn btn-outline-primary"
//                   onClick={() => callAI("enhance")}
//                   disabled={aiLoading}
//                 >
//                   ✨ Enhance Writing
//                 </button>
//                 <button
//                   className="btn btn-outline-success"
//                   onClick={() => callAI("summarize")}
//                   disabled={aiLoading}
//                 >
//                   📝 Summarize
//                 </button>
//                 <button
//                   className="btn btn-outline-secondary"
//                   onClick={() => callAI("suggest")}
//                   disabled={aiLoading}
//                 >
//                   💡 Suggest Improvements
//                 </button>
//               </div>

//               {aiLoading && (
//                 <div className="text-center text-muted small">
//                   <div className="spinner-border spinner-border-sm me-2" />
//                   AI is thinking...
//                 </div>
//               )}

//               {aiResponse && !aiLoading && (
//                 <div className="alert alert-light border mt-3" style={{ whiteSpace: "pre-wrap" }}>
//                   {aiResponse}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { io } from "socket.io-client";
import { getToken, getCurrentUser, removeToken } from "../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE;

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [presence, setPresence] = useState([]);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // 💡 Sharing states
  const [showShareModal, setShowShareModal] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [sharedUsers, setSharedUsers] = useState([]);

  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const user = getCurrentUser();

  // 🧠 Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => handleSave(), 30000);
    return () => clearInterval(interval);
  }, [content]);

  // ⚙️ Load document + connect socket
  useEffect(() => {
    if (!id) return;
    loadDocument();
    setupSocket();
    fetchSharedUsers();

    return () => {
      socketRef.current?.emit("leave-document", { documentId: id });
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadDocument() {
    try {
      const res = await axios.get(`${API_BASE}/documents/${id}`, {
        withCredentials: true,
      });
      setTitle(res.data?.title || "Untitled Document");
      setContent(res.data?.content || "");
    } catch (err) {
      console.error("❌ Failed to load document", err);
      alert("Error loading document. Redirecting...");
      navigate("/");
    }
  }

  function setupSocket() {
    const token = getToken();
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token },
    });
    socketRef.current = socket;

    socket.emit("join-document", { documentId: id, user });

    socket.on("document-content", ({ html }) => setContent(html));
    socket.on("text-change", ({ delta, userId }) => {
      if (userId === user?.id) return;
      const quill = quillRef.current?.getEditor();
      if (quill && delta) quill.updateContents(delta);
    });
    socket.on("user-joined", (u) =>
      setPresence((prev) => [...prev.filter((p) => p.id !== u.id), u])
    );
    socket.on("user-left", (u) =>
      setPresence((prev) => prev.filter((p) => p.id !== u.id))
    );
  }

  function handleEditorChange(content, delta, source) {
    if (source !== "user") return;
    socketRef.current?.emit("text-change", {
      documentId: id,
      delta,
      userId: user?.id,
    });
    setContent(content);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/documents/${id}`,
        { content },
        { withCredentials: true }
      );
      setLastSaved(new Date().toLocaleTimeString());
      socketRef.current?.emit("document-saved", { documentId: id });
    } catch (err) {
      console.error("❌ Save failed", err);
      alert("Failed to save document.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.warn("Logout failed", err);
    } finally {
      removeToken();
      navigate("/login");
    }
  }

  // 🧠 AI Assistant Functions
  async function callAI(endpoint) {
    if (!content.trim()) return alert("Please write something first!");
    setAiLoading(true);
    setAiResponse("");

    try {
      const res = await axios.post(`${API_BASE}/ai/${endpoint}`, {
        text: content,
      });
      setAiResponse(res.data?.result || "No response from AI");
    } catch (err) {
      console.error("AI error:", err);
      alert(err.response?.data?.message || "AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  // 📤 Share Logic
  async function handleShare() {
    try {
      await axios.post(
        `${API_BASE}/share/${id}/share`,
        { email, role },
        { withCredentials: true }
      );
      alert("✅ Document shared successfully!");
      setEmail("");
      setRole("viewer");
      fetchSharedUsers();
    } catch (err) {
      console.error("❌ Share error:", err);
      alert(err.response?.data?.message || "Failed to share document.");
    }
  }

  async function fetchSharedUsers() {
    try {
      const res = await axios.get(`${API_BASE}/share/${id}/shared`, {
        withCredentials: true,
      });
      setSharedUsers(res.data?.sharedWith || []);
    } catch (err) {
      console.error("Failed to fetch shared users:", err);
    }
  }

  async function handleRevoke(userId) {
    try {
      await axios.delete(`${API_BASE}/share/${id}/revoke`, {
        data: { userId },
        withCredentials: true,
      });
      alert("Access revoked successfully.");
      fetchSharedUsers();
    } catch (err) {
      console.error("Revoke failed:", err);
    }
  }

  return (
    <div className="container-fluid py-3">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4>{title}</h4>
          <small className="text-muted">
            Last saved: {lastSaved ? lastSaved : "Not yet saved"}
          </small>
        </div>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate("/")}
          >
            Back
          </button>
          <button
            className="btn btn-outline-primary me-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            className="btn btn-outline-success me-2"
            onClick={() => setShowShareModal(true)}
          >
            Share
          </button>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="row">
        {/* Editor */}
        <div className="col-lg-9 mb-3">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleEditorChange}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["blockquote", "code-block"],
                ["link", "image"],
                ["clean"],
              ],
            }}
            style={{ backgroundColor: "#fff", minHeight: "500px" }}
          />
        </div>

        {/* Sidebar */}
        <div className="col-lg-3">
          {/* Collaborators */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h6 className="card-title">Collaborators Online</h6>
              <ul className="list-group list-group-flush">
                {presence.length === 0 && (
                  <li className="list-group-item text-muted small">
                    No one else is online.
                  </li>
                )}
                {presence.map((p) => (
                  <li key={p.id} className="list-group-item">
                    <span className="badge bg-success me-2">●</span>
                    {p.name || p.email || "User"}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Assistant */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">🧠 AI Assistant</h6>
              <div className="d-grid gap-2 mb-3">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => callAI("enhance")}
                  disabled={aiLoading}
                >
                  ✨ Enhance Writing
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => callAI("summarize")}
                  disabled={aiLoading}
                >
                  📝 Summarize
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => callAI("suggest")}
                  disabled={aiLoading}
                >
                  💡 Suggest Improvements
                </button>
              </div>

              {aiLoading && (
                <div className="text-center text-muted small">
                  <div className="spinner-border spinner-border-sm me-2" />
                  AI is thinking...
                </div>
              )}

              {aiResponse && !aiLoading && (
                <div
                  className="alert alert-light border mt-3"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "400px" }}
          >
            <h5 className="mb-3">Share Document</h5>
            <input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mb-2"
            />
            <select
              className="form-select mb-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <div className="d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={() => setShowShareModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={handleShare}>Share</button>
            </div>

            <hr />
            <h6>Shared With:</h6>
            <ul className="list-group">
              {sharedUsers.map((u) => (
                <li key={u.user._id} className="list-group-item d-flex justify-content-between align-items-center">
                  {u.user.email} ({u.role})
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRevoke(u.user._id)}
                  >
                    Revoke
                  </button>
                </li>
              ))}
              {sharedUsers.length === 0 && (
                <li className="list-group-item text-muted small">
                  Not shared with anyone.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
