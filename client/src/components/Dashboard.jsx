// import React, { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axiosInstance from "../utils/axiosConfig";
// import { getCurrentUser, removeToken, getToken } from "../utils/auth";

// export default function Dashboard() {
    
//   const [docs, setDocs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [newTitle, setNewTitle] = useState("");
//   const [deletingId, setDeletingId] = useState(null);
//   const navigate = useNavigate();
//   const user = getCurrentUser();

//   // Check if user is authenticated
//   useEffect(() => {
//     const token = getToken();
//     if (!token) {
//       navigate("/login", { replace: true });
//       return;
//     }
//     fetchDocuments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function fetchDocuments() {
//     setLoading(true);
//     try {
//       const res = await axiosInstance.get("/documents");
//       setDocs(Array.isArray(res.data) ? res.data : []);
//     } catch (err) {
//       console.error("Failed to load documents", err);
//       if (err.response?.status === 401) {
//         navigate("/login", { replace: true });
//       } else {
//         alert(err?.response?.data?.message || "Failed to load documents");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function createDocument(e) {
//     e?.preventDefault();
//     if (!newTitle.trim()) return alert("Please enter a title for the document.");
//     setCreating(true);
//     try {
//       const res = await axiosInstance.post("/documents", { 
//         title: newTitle.trim() 
//       });
//       const created = res.data;
//       setNewTitle("");
//       if (created?._id) navigate(`/doc/${created._id}`);
//       else fetchDocuments();
//     } catch (err) {
//       console.error("Create failed", err);
//       alert(err?.response?.data?.message || "Failed to create document");
//     } finally {
//       setCreating(false);
//     }
//   }

//   async function deleteDocument(id) {
//     if (!confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;
//     setDeletingId(id);
//     try {
//       await axiosInstance.delete(`/documents/${id}`);
//       setDocs((prev) => prev.filter((d) => d._id !== id));
//     } catch (err) {
//       console.error("Delete failed", err);
//       alert(err?.response?.data?.message || "Failed to delete document");
//     } finally {
//       setDeletingId(null);
//     }
//   }

//   async function handleLogout() {
//     try {
//       await axiosInstance.post("/auth/logout");
//     } catch (err) {
//       console.warn("Logout request failed", err);
//     } finally {
//       removeToken();
//       navigate("/login", { replace: true });
//     }
//   }

//   function formatDate(iso) {
//     try {
//       const d = new Date(iso);
//       return new Intl.DateTimeFormat(undefined, {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       }).format(d);
//     } catch {
//       return iso;
//     }
//   }

//   return (
//     <div className="container py-4">
//       <nav className="navbar navbar-expand-lg navbar-light bg-white rounded-3 shadow-sm mb-4">
//         <div className="container-fluid">
//           <span className="navbar-brand mb-0 h4">Collab Editor</span>

//           <div className="d-flex align-items-center">
//             <div className="me-3 text-end">
//               <div className="small text-muted">Signed in as</div>
//               <div className="fw-semibold">{user?.name ?? user?.email ?? "User"}</div>
//             </div>

//             <button className="btn btn-outline-secondary me-2" onClick={fetchDocuments} title="Refresh">
//               Refresh
//             </button>

//             <button className="btn btn-outline-danger" onClick={handleLogout}>
//               Logout
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="row g-4">
//         <div className="col-lg-4">
//           <div className="card shadow-sm">
//             <div className="card-body">
//               <h5 className="card-title">Create New Document</h5>
//               <form onSubmit={createDocument}>
//                 <div className="mb-3">
//                   <label className="form-label">Title</label>
//                   <input
//                     className="form-control"
//                     placeholder="Untitled document"
//                     value={newTitle}
//                     onChange={(e) => setNewTitle(e.target.value)}
//                     disabled={creating}
//                     required
//                   />
//                 </div>
//                 <div className="d-grid">
//                   <button className="btn btn-primary" type="submit" disabled={creating}>
//                     {creating ? "Creating..." : "Create Document"}
//                   </button>
//                 </div>
//               </form>
//             </div>

//             <div className="card-footer text-muted small">
//               Auto-save will be available inside the editor (every 30s). You can open a document to edit.
//             </div>
//           </div>
//         </div>

//         <div className="col-lg-8">
//           <div className="card shadow-sm">
//             <div className="card-body">
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5 className="card-title mb-0">Your Documents</h5>
//                 <small className="text-muted">{loading ? "Loading..." : `${docs.length} documents`}</small>
//               </div>

//               {loading ? (
//                 <div className="text-center py-4">
//                   <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
//                 </div>
//               ) : docs.length === 0 ? (
//                 <div className="text-center py-4 text-muted">You have no documents yet. Create one to get started.</div>
//               ) : (
//                 <div className="list-group">
//                   {docs.map((d) => (
//                     <div key={d._id} className="list-group-item list-group-item-action d-flex align-items-start justify-content-between">
//                       <div className="me-3" style={{ minWidth: 0 }}>
//                         <Link to={`/doc/${d._id}`} className="h6 mb-1 d-block text-decoration-none">
//                           {d.title || "Untitled"}
//                         </Link>
//                         <div className="small text-muted">
//                           Last updated: {formatDate(d.updatedAt || d.createdAt)} • {d.ownerEmail ? `Owner: ${d.ownerEmail}` : ""}
//                         </div>
//                       </div>

//                       <div className="d-flex align-items-center">
//                         <Link to={`/doc/${d._id}`} className="btn btn-sm btn-outline-primary me-2">
//                           Open
//                         </Link>
//                         <button
//                           className="btn btn-sm btn-outline-danger"
//                           onClick={() => deleteDocument(d._id)}
//                           disabled={deletingId === d._id}
//                           title="Delete document"
//                         >
//                           {deletingId === d._id ? (
//                             <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                           ) : (
//                             "Delete"
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="card-footer text-muted">
//               Documents are private to your account unless you share them. Use the editor to invite collaborators and manage permissions.
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }









import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
import { getCurrentUser, removeToken, getToken } from "../utils/auth";

export default function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const user = getCurrentUser();

  // Load all docs (owned + shared)
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetchDocuments();
    fetchSharedDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/documents");
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load documents", err);
      if (err.response?.status === 401) navigate("/login", { replace: true });
      else alert(err?.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSharedDocs() {
    try {
      const res = await axiosInstance.get("/documents/shared-with-me");
      setSharedDocs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load shared docs", err);
    }
  }

  async function createDocument(e) {
    e?.preventDefault();
    if (!newTitle.trim()) return alert("Please enter a title for the document.");
    setCreating(true);
    try {
      const res = await axiosInstance.post("/documents", { title: newTitle.trim() });
      const created = res.data;
      setNewTitle("");
      if (created?._id) navigate(`/doc/${created._id}`);
      else fetchDocuments();
    } catch (err) {
      console.error("Create failed", err);
      alert(err?.response?.data?.message || "Failed to create document");
    } finally {
      setCreating(false);
    }
  }

  async function deleteDocument(id) {
    if (!confirm("Are you sure you want to delete this document?")) return;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.warn("Logout failed", err);
    } finally {
      removeToken();
      navigate("/login", { replace: true });
    }
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return iso;
    }
  }

  return (
    <div className="container py-4">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white rounded-3 shadow-sm mb-4">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h4">Collab Editor</span>

          <div className="d-flex align-items-center">
            <div className="me-3 text-end">
              <div className="small text-muted">Signed in as</div>
              <div className="fw-semibold">{user?.name ?? user?.email ?? "User"}</div>
            </div>

            <button className="btn btn-outline-secondary me-2" onClick={() => { fetchDocuments(); fetchSharedDocs(); }}>
              Refresh
            </button>

            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="row g-4">
        {/* Create Document */}
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Create New Document</h5>
              <form onSubmit={createDocument}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    placeholder="Untitled document"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    disabled={creating}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button className="btn btn-primary" type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Document"}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-muted small">
              Auto-save is built-in; share access via the Editor’s “Share” button.
            </div>
          </div>
        </div>

        {/* My Documents */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">My Documents</h5>
                <small className="text-muted">{loading ? "Loading..." : `${docs.length} total`}</small>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : docs.length === 0 ? (
                <div className="text-center text-muted py-4">You have no documents yet.</div>
              ) : (
                <div className="list-group">
                  {docs.map((d) => (
                    <div key={d._id} className="list-group-item d-flex justify-content-between align-items-start">
                      <div className="me-3" style={{ minWidth: 0 }}>
                        <Link to={`/doc/${d._id}`} className="h6 text-decoration-none">
                          {d.title || "Untitled"}
                        </Link>
                        <div className="small text-muted">
                          Last updated: {formatDate(d.updatedAt || d.createdAt)}
                        </div>
                      </div>
                      <div>
                        <Link to={`/doc/${d._id}`} className="btn btn-sm btn-outline-primary me-2">
                          Open
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteDocument(d._id)}
                          disabled={deletingId === d._id}
                        >
                          {deletingId === d._id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shared With Me */}
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Shared With Me</h5>
                <small className="text-muted">{sharedDocs.length} shared</small>
              </div>

              {sharedDocs.length === 0 ? (
                <div className="text-center text-muted py-4">No shared documents yet.</div>
              ) : (
                <div className="list-group">
                  {sharedDocs.map((d) => (
                    <div key={d._id} className="list-group-item d-flex justify-content-between align-items-start">
                      <div>
                        <Link to={`/doc/${d._id}`} className="h6 text-decoration-none">
                          {d.title}
                        </Link>
                        <div className="small text-muted">
                          Owner: {d.ownerEmail || "Unknown"} • Role: {d.role}
                        </div>
                      </div>
                      <Link to={`/doc/${d._id}`} className="btn btn-sm btn-outline-primary">
                        Open
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
