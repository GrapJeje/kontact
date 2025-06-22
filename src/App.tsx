import { BrowserRouter, Routes, Route } from "react-router-dom";
import Contacts from "./pages/Contacts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./pages/User";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Contacts />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/user/:id" element={<User />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
