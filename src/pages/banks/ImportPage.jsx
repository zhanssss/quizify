// src/pages/banks/ImportPage.jsx
import React, {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";

import {useSaveActiveBankMutation} from "../../app/features/banks/banksApi.js";
import {parseQuestions} from "../../lib/quizEngine.js";
import {uid} from "../../lib/ids.js";
import {loadText, saveText} from "../../lib/storage.js";

export default function ImportPage() {
    const nav = useNavigate();
    const [saveBank, {isLoading}] = useSaveActiveBankMutation();

    const [rawText, setRawText] = useState(() => loadText());

    const parsed = useMemo(() => parseQuestions(rawText), [rawText]);
    const parsedCount = parsed.length;

    const onSaveDraft = () => {
        saveText(rawText);
        alert("Черновик текста сохранён в браузере.");
    };

    const onClear = () => {
        setRawText("");
        saveText("");
    };

    const onSaveBank = async () => {
        if (parsedCount === 0) {
            alert("Не удалось распознать вопросы. Проверь формат (A–E) и строку 'Правильный ответ: X'.");
            return;
        }

        const bank = {
            id: uid("bank"),
            title: "Банк вопросов",
            rawText,
            parsedCount,
            parsed,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await saveBank(bank).unwrap();
        nav("/quizzes/create");
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Импорт банка вопросов</h1>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Вставка текста</h2>
                    <span className="pill">{parsedCount ? `Распознано: ${parsedCount}` : "Ожидаю импорт"}</span>
                </div>

                <div className="bd">
                    <div className="grid2">
                        {/* LEFT: textarea */}
                        <div>
                              <textarea
                                  className="textarea"
                                  value={rawText}
                                  onChange={(e) => setRawText(e.target.value)}
                                  placeholder="Вставь сюда весь текст с вопросами..."
                              />

                            <div className="hint">
                                Подсказка: у каждого вопроса должна быть строка <code>Правильный ответ: X</code> (X —
                                A–E).
                            </div>

                            <div className="row mt">
                                <button className="btn primary" onClick={onSaveBank}
                                        disabled={isLoading || parsedCount === 0}>
                                    Сохранить банк и перейти к созданию квиза
                                </button>

                                <button className="btn" onClick={onSaveDraft}>
                                    Сохранить черновик
                                </button>

                                <button className="btn danger" onClick={onClear}>
                                    Очистить
                                </button>

                                <button className="btn" onClick={() => nav("/")}>
                                    Назад
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: instruction card */}
                        <aside className="infoCard">
                            <h3>Формат вставки</h3>
                            <p>
                                Каждый вопрос должен начинаться с номера <code>1.</code>, затем идти
                                варианты <code>A)</code> … <code>E)</code>,
                                и обязательно строка <code>Правильный ответ: X</code>.
                            </p>

                            <div className="hr"/>

                            <p style={{marginBottom: 8}}>Пример:</p>

                            <pre className="codeBlock">{`1. Что такое HTTP?
A) Язык программирования
B) Протокол передачи гипертекста
C) СУБД
D) Операционная система
E) Браузер
Правильный ответ: B`}
                            </pre>

                            <div className="hr"/>

                            <p>
                                Варианты допускаются русскими буквами <code>А–Е</code>, они автоматически приводятся
                                к <code>A–E</code>.
                            </p>
                        </aside>
                    </div>
                </div>

            </section>
        </div>
    );
}
