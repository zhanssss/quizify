import React, {useEffect, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";

function LinkItem({to, children, onClick}) {
    return (
        <NavLink
            to={to}
            className={({isActive}) => `navLink ${isActive ? "active" : ""}`}
            end={to === "/"}
            onClick={onClick}
        >
            {children}
        </NavLink>
    );
}

export default function NavBar() {
    const nav = useNavigate();
    const [open, setOpen] = useState(false);

    // Escape закрывает меню
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    // Блокируем скролл body когда меню открыто (мобилка)
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => (document.body.style.overflow = "");
    }, [open]);

    const closeMenu = () => setOpen(false);

    return (
        <header className="topbar">
            <div className="navInner">
                <button
                    className="brand"
                    onClick={() => {
                        closeMenu();
                        nav("/");
                    }}
                >
                    QuizForge
                    <span className="brandDot"/>
                </button>

                {/* Бургер (виден только на мобилке через CSS) */}
                <button
                    className={`navToggle ${open ? "open" : ""}`}
                    type="button"
                    aria-label={open ? "Закрыть меню" : "Открыть меню"}
                    aria-expanded={open}
                    aria-controls="main-nav"
                    onClick={() => setOpen((v) => !v)}
                >
                    <span/>
                    <span/>
                    <span/>
                </button>

                {/* Навигация: на десктопе как раньше, на мобилке становится drawer */}
                <nav
                    id="main-nav"
                    className={`navLinks ${open ? "open" : ""}`}
                    aria-label="Основная навигация"
                >
                    <LinkItem to="/" onClick={closeMenu}>Об приложении</LinkItem>
                    <LinkItem to="/import" onClick={closeMenu}>Импорт</LinkItem>
                    <LinkItem to="/quizzes/create" onClick={closeMenu}>Создать квиз</LinkItem>
                    <LinkItem to="/archive/quizzes" onClick={closeMenu}>Архив квизов</LinkItem>
                    <LinkItem to="/archive/materials" onClick={closeMenu}>Архив материалов</LinkItem>
                    <LinkItem to="/ai" onClick={closeMenu}>AI Lab</LinkItem>
                    <LinkItem to="/profile" onClick={closeMenu}>Профиль</LinkItem>
                </nav>

                {/* Оверлей (клик вне меню закрывает) */}
                {open && (
                    <button
                        className="navOverlay"
                        type="button"
                        aria-label="Закрыть меню"
                        onClick={closeMenu}
                    />
                )}
            </div>
        </header>
    );
}
