export const LS_TEXT_KEY = "quiz_text_ru_react_v1";
export const LS_SESSION_KEY = "quiz_session_ru_react_v1";

export function saveText(raw) {
    localStorage.setItem(LS_TEXT_KEY, raw || "");
}
export function loadText() {
    return localStorage.getItem(LS_TEXT_KEY) || "";
}

export function saveSession(session) {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(session));
}
export function loadSession() {
    const s = localStorage.getItem(LS_SESSION_KEY);
    if (!s) return null;
    try {
        return JSON.parse(s);
    } catch {
        return null;
    }
}
export function clearSession() {
    localStorage.removeItem(LS_SESSION_KEY);
}
