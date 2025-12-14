import React, {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {loadText, loadSession, saveSession, saveText} from "../lib/storage.js";
import {parseQuestions, buildSessionFromBank, calcScore, QUIZ_QUESTION_LIMIT} from "../lib/quizEngine.js";

function Badge({checked, selected, isCorrect}) {
    if (!checked) {
        if (selected) return <span className="badge ok">Выбрано</span>;
        return <span className="badge wait">Нет ответа</span>;
    }
    return isCorrect ? <span className="badge ok">Верно</span> : <span className="badge bad">Ошибка</span>;
}

export default function QuizPage() {
    const nav = useNavigate();

    const [session, setSession] = useState(() => loadSession());
    const [_, force] = useState(0);

    const score = useMemo(() => (session ? calcScore(session) : {correctCount: 0, total: 0}), [session]);

    const persist = (next) => {
        setSession(next);
        saveSession(next);
        force((x) => x + 1);
    };

    if (!session || !session.questions || session.questions.length === 0) {
        return (
            <div className="container">
                <header className="header">
                    <h1>Квиз</h1>
                    <p className="sub">Сессия не найдена. Сначала импортируй вопросы.</p>
                </header>

                <section className="card">
                    <div className="bd">
                        <button className="btn primary" onClick={() => nav("/")}>Перейти к импорту</button>
                    </div>
                </section>
            </div>
        );
    }

    const answeredCount = Object.values(session.selections || {}).filter(Boolean).length;

    const toggleSelection = (qid, letter) => {
        if (session.checked) return;

        const current = session.selections[qid];
        const nextSelections = {...session.selections};

        // checkbox UI, но single-choice:
        if (current === letter) delete nextSelections[qid];
        else nextSelections[qid] = letter;

        persist({...session, selections: nextSelections});
    };

    const onCheck = () => persist({...session, checked: true});

    const onReset = () => persist({...session, selections: {}, checked: false});

    const onNewSample = () => {
        // пересобираем 40 вопросов из сохранённого текста
        const raw = loadText();
        const bank = parseQuestions(raw);
        if (bank.length === 0) {
            alert("Нет исходного текста для пересборки. Вернись на импорт и вставь вопросы.");
            return;
        }
        const next = buildSessionFromBank(bank);
        persist(next);
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Квиз (случайные {QUIZ_QUESTION_LIMIT} вопросов)</h1>
                <p className="sub">
                    Вопросы и варианты перемешаны. Выбор через галочки (но только один вариант на вопрос). После
                    проверки покажет ошибки.
                </p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Прохождение</h2>
                    <div className="row">
                        <button className="btn primary" onClick={onCheck}>Проверить</button>
                        <button className="btn danger" onClick={onReset}>Сбросить ответы</button>
                        <button className="btn" onClick={onNewSample}>Новая выборка 40 вопросов</button>
                        <button className="btn" onClick={() => nav("/")}>К импорту</button>
                    </div>
                </div>

                <div className="bd">
                    <div className="quizTop">
                        <div className="stats">
                            <div className="stat">Вопросов: <b>{session.questions.length}</b></div>
                            <div className="stat">Отвечено: <b>{answeredCount}</b></div>
                            <div
                                className="stat">Баллы: <b>{session.checked ? `${score.correctCount} / ${score.total}` : "—"}</b>
                            </div>
                        </div>
                        <span className="pill">
              {session.checked ? `Проверено: ${score.correctCount}/${score.total}` : "Не проверено"}
            </span>
                    </div>

                    <div>
                        {session.questions.map((q, idx) => {
                            const sel = session.selections[q.id];
                            const isCorrect = sel && sel === q.correct;

                            return (
                                <div
                                    key={q.id}
                                    className={`q ${session.checked ? (isCorrect ? "correct" : "incorrect") : ""}`}
                                >
                                    <div className="qHead">
                                        <div>
                                            <div className="qNum">Вопрос {idx + 1} (исходный №{q.originalNumber})</div>
                                            <div className="qText">{q.question}</div>
                                        </div>
                                        <div className="qMeta">
                                            <Badge checked={session.checked} selected={!!sel} isCorrect={isCorrect}/>
                                        </div>
                                    </div>

                                    <div className="opts">
                                        {q.options.map((o) => {
                                            const checkedBox = sel === o.letter;

                                            const optClass = session.checked
                                                ? (o.letter === q.correct ? "opt correct" : (sel && sel !== q.correct && o.letter === sel ? "opt incorrect" : "opt"))
                                                : "opt";

                                            return (
                                                <label
                                                    key={o.letter}
                                                    className={optClass}
                                                    onClick={(e) => {
                                                        // чтобы клик по label работал предсказуемо
                                                        e.preventDefault();
                                                        toggleSelection(q.id, o.letter);
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checkedBox}
                                                        disabled={session.checked}
                                                        readOnly
                                                    />
                                                    <div className="txt">
                                                        <span className="letter">{o.letter}</span>
                                                        <span>{o.text}</span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {session.checked && (
                                        <div className="explain">
                                            {isCorrect ? (
                                                <>Ответ: <b>{sel}</b>. Правильно.</>
                                            ) : (
                                                <>
                                                    Твой ответ: <b>{sel || "не выбран"}</b>. Правильный ответ:{" "}
                                                    <b>
                                                        {q.correct}) {q.options.find((x) => x.letter === q.correct)?.text || ""}
                                                    </b>.
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
