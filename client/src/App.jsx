  import { Routes, Route } from "react-router-dom";
  import Login from "./components/auth/Login";
  import Register from "./components/auth/Register";
  import Dashboard from "./components/Dashboard";
  import EditorPage from "./components/EditorPage";

  function App() {
    return (
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/doc/:id" element={<EditorPage />} />
        </Routes>
      </div>
    );
  }

  export default App;



