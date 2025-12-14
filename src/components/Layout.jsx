import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar.jsx";

export default function Layout() {
    return (
        <div className="appShell">
            <a className="skipLink" href="#main">
                Перейти к содержимому
            </a>

            <NavBar />

            <main id="main" className="appMain">
                <Outlet />
            </main>
        </div>
    );
}
