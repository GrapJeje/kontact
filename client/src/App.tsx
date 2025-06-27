import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./Index.scss";
import Contacts from "./pages/Contacts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./pages/User";
import ProtectedRoute from "./components/ProtectedRoute";
import New from "./pages/New.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Contacts />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/new"
                    element={
                        <ProtectedRoute>
                            <New />
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/user/:id"
                    element={
                        <ProtectedRoute>
                            <User />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
