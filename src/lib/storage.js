export const LS_TEXT_KEY = "quiz_text_ru_react_v1";

export function saveText(raw) {
    localStorage.setItem(LS_TEXT_KEY, raw || "");
}
export function loadText() {
    return localStorage.getItem(LS_TEXT_KEY) || "";
}
