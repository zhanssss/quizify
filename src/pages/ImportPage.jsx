import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadText, saveText, saveSession, clearSession } from "../lib/storage.js";
import { parseQuestions, buildSessionFromBank, QUIZ_QUESTION_LIMIT } from "../lib/quizEngine.js";

export default function ImportPage() {
    const nav = useNavigate();
    const [raw, setRaw] = useState(loadText());

    const parsedCount = useMemo(() => parseQuestions(raw).length, [raw]);

    const onSave = () => {
        saveText(raw);
        alert("Сохранено в браузере.");
    };

    const onClear = () => {
        setRaw("");
        saveText("");
        clearSession();
    };

    const onLoadAndGo = () => {
        saveText(raw);
        const bank = parseQuestions(raw);
        if (bank.length === 0) {
            alert("Не удалось распознать вопросы. Проверь формат (A)–E) и 'Правильный ответ: X'.");
            return;
        }
        const session = buildSessionFromBank(bank);
        saveSession(session);
        nav("/quiz");
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Импорт вопросов</h1>
                <p className="sub">
                    Вставь полный список (1–300). На квизе будет автоматически выбрано <b>{QUIZ_QUESTION_LIMIT}</b> случайных вопросов,
                    и ответы будут перемешаны.
                </p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Вставка текста</h2>
                    <span className="pill">
            {parsedCount ? `Распознано вопросов: ${parsedCount}` : "Ожидаю импорт"}
          </span>
                </div>

                <div className="bd">
          <textarea
              className="textarea"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Вставь сюда весь текст с вопросами..."
          />

                    <div className="hint">
                        Формат: <code>1. ...</code>, варианты <code>A) ...</code> … <code>E) ...</code>, строка{" "}
                        <code>Правильный ответ: C</code>.
                    </div>

                    <div className="row mt">
                        <button className="btn primary" onClick={onLoadAndGo}>
                            Загрузить и перейти к квизу
                        </button>
                        <button className="btn" onClick={onSave}>Сохранить текст</button>
                        <button className="btn danger" onClick={onClear}>Очистить</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
