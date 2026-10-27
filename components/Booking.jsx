"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getDict } from "@/lib/i18n";
import { STAY, SITE } from "@/lib/config";
import { addDays, nightsBetween, quote } from "@/lib/pricing";
import { LIMITS } from "@/lib/booking";

const pad = (n) => String(n).padStart(2, "0");
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function monthDays(year, month) {
  // month : 0-11 ; semaine commençant le lundi
  const first = new Date(Date.UTC(year, month, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = Array(lead).fill(null);
  for (let d = 1; d <= count; d++) cells.push(`${year}-${pad(month + 1)}-${pad(d)}`);
  return cells;
}

export default function BookingWidget({ locale }) {
  const t = getDict(locale).book;
  const dl = getDict(locale).dateLocale;
  // Date du jour calculée après le montage : évite un écart serveur/navigateur (fuseaux horaires)
  const [today, setToday] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [notice, setNotice] = useState(""); // demo | degraded
  const [blocked, setBlocked] = useState(null);
  const [offset, setOffset] = useState(0);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [hover, setHover] = useState(null);
  const [guests, setGuests] = useState(2);
  const [hint, setHint] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [canceled, setCanceled] = useState(false);
  const errorRef = useRef(null);
  const gridRef = useRef(null);

  // En cas d'échec, on n'affiche jamais un calendrier « tout libre » : message et bouton pour réessayer
  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const r = await fetch("/api/availability", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      if (!Array.isArray(j.blocked)) throw new Error("format");
      setBlocked(new Set(j.blocked));
      setNotice(j.degraded ? "degraded" : j.demo ? "demo" : "");
      setStatus("ready");
    } catch {
      setBlocked(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    setToday(localToday());
    load();
    if (new URLSearchParams(location.search).get("annule")) setCanceled(true);
    // Retour arrière depuis Stripe (cache du navigateur) : le bouton redevient actif
    const onShow = (e) => e.persisted && setSending(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [load]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const money = (n) =>
    new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  const fmt = (iso, opts = { weekday: "short", day: "numeric", month: "short" }) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(dl, { ...opts, timeZone: "UTC" });

  const isBlocked = (d) => blocked?.has(d);

  // Une arrivée est possible si les nuits du séjour minimum sont libres
  const canStart = (d) => {
    if (!blocked || !today || d < today) return false;
    for (let i = 0; i < STAY.minNights; i++) if (isBlocked(addDays(d, i))) return false;
    return true;
  };

  const selectingOut = checkIn && !checkOut;
  const minOut = checkIn ? addDays(checkIn, STAY.minNights) : null;
  const maxOut = useMemo(() => {
    if (!checkIn || !blocked) return null;
    for (let i = 0; i < 400; i++) {
      const d = addDays(checkIn, i);
      if (blocked.has(d)) return d; // le départ peut tomber le jour d'une arrivée suivante
    }
    return addDays(checkIn, 60);
  }, [checkIn, blocked]);

  const validOut = (d) => selectingOut && d >= minOut && d <= maxOut && nightsBetween(checkIn, d) <= 60;

  const pick = (d) => {
    setError("");
    if (!checkIn || checkOut) {
      if (canStart(d)) {
        setCheckIn(d);
        setCheckOut(null);
        setHint(t.pickOut);
      } else setHint(isBlocked(d) ? t.errors.unavailable : t.errors.minNights);
      return;
    }
    if (validOut(d)) {
      setCheckOut(d);
      setHint("");
      return;
    }
    if (d > checkIn && d < minOut) return setHint(t.errors.minNights);
    if (canStart(d)) {
      setCheckIn(d);
      setHint(t.pickOut);
    } else setHint(d > maxOut ? t.errors.blockedInside : t.errors.unavailable);
  };

  const reset = () => {
    setCheckIn(null);
    setCheckOut(null);
    setHint("");
  };

  const end = checkOut || (selectingOut && hover && validOut(hover) ? hover : null);
  const q = checkIn && checkOut ? quote(checkIn, checkOut, guests) : null;

  const months = today
    ? [0, 1].map((k) => {
        const dt = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + offset + k, 1));
        return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() };
      })
    : [];

  // Navigation au clavier dans le calendrier : flèches (jour, semaine), en sautant les dates indisponibles
  const onGridKey = (e) => {
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    const from = e.target?.dataset?.d;
    if (!steps || !from) return;
    e.preventDefault();
    for (let i = 1; i <= 8; i++) {
      const el = gridRef.current?.querySelector(`button[data-d="${addDays(from, steps * i)}"]:not([disabled])`);
      if (el) return el.focus();
    }
  };
  const dows = Array.from({ length: 7 }, (_, i) =>
    new Date(Date.UTC(2024, 0, 1 + i)).toLocaleDateString(dl, { weekday: "short", timeZone: "UTC" })
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!q) return setError(t.errors.dates);
    setSending(true);
    setError("");
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn, checkOut, guests, locale, ...form }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.url) {
        window.location.href = j.url;
        return;
      }
      setError(j.error || "generic");
      if (j.error === "unavailable" || j.error === "sync") {
        reset();
        load();
      }
    } catch {
      setError("generic");
    }
    setSending(false);
  };

  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(
    `${SITE.house} ${checkIn || ""} > ${checkOut || ""}`
  )}&body=${encodeURIComponent(
    `${form.name}\n${guests} pers.\n${checkIn || ""} > ${checkOut || ""}\n\n${form.message}`
  )}`;

  return (
    <>
        {canceled && <div className="notice" role="status">{t.canceled}</div>}

        <div className="book-grid">
          <div className="panel">
            <div className="cal-top">
              <span style={{ fontWeight: 600 }}>
                {checkIn ? `${fmt(checkIn)}${end ? ` > ${fmt(end)}` : ""}` : t.choose}
              </span>
              <div className="cal-nav">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setOffset((o) => Math.max(0, o - 1))}
                  disabled={offset === 0}
                  aria-label={t.prev}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setOffset((o) => Math.min(16, o + 1))}
                  disabled={offset >= 16}
                  aria-label={t.next}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
                </button>
              </div>
            </div>

            {status === "error" && (
              <div className="notice error cal-error" role="alert">
                <span>{t.loadError}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={load}>{t.retry}</button>
              </div>
            )}
            {notice && status === "ready" && <p className="notice soft">{t[notice]}</p>}
            <div
              className={`cal-months ${status === "loading" ? "is-loading" : ""}`}
              ref={gridRef}
              onMouseLeave={() => setHover(null)}
              onKeyDown={onGridKey}
              aria-busy={status === "loading"}
            >
              {!today && [0, 1].map((k) => <div key={k} className="cal-month cal-skeleton" aria-hidden="true" />)}
              {months.map(({ y, m }) => (
                <div className="cal-month" key={`${y}-${m}`}>
                  <h3>{new Date(Date.UTC(y, m, 1)).toLocaleDateString(dl, { month: "long", year: "numeric", timeZone: "UTC" })}</h3>
                  <div className="cal-grid">
                    {dows.map((d) => (
                      <div key={d} className="cal-dow" aria-hidden="true">{d.replace(".", "")}</div>
                    ))}
                    {monthDays(y, m).map((d, i) => {
                      if (!d) return <div key={`e${i}`} />;
                      const past = !today || d < today;
                      const blockedNight = !past && isBlocked(d);
                      const isStart = d === checkIn;
                      const isEnd = d === end;
                      const inRange = checkIn && end && d > checkIn && d < end;
                      let clickable;
                      let unreachable = false;
                      if (!blocked || past) clickable = false;
                      else if (selectingOut) {
                        clickable = validOut(d) || canStart(d) || d === checkIn;
                        unreachable = d > checkIn && !validOut(d);
                      } else {
                        clickable = canStart(d);
                        unreachable = !blockedNight && !canStart(d);
                      }
                      const cls = [
                        "day",
                        past && "is-past",
                        blockedNight && !(selectingOut && validOut(d)) && "is-blocked",
                        unreachable && !blockedNight && "is-unreachable",
                        inRange && "in-range",
                        isStart && end && "is-start",
                        isStart && !end && "is-start is-end",
                        isEnd && "is-end",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <button
                          type="button"
                          key={d}
                          data-d={d}
                          className={cls}
                          disabled={!clickable}
                          onClick={() => pick(d)}
                          onMouseEnter={() => setHover(d)}
                          aria-pressed={isStart || isEnd}
                          aria-label={`${fmt(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${blockedNight ? `, ${t.unavailable}` : ""}`}
                        >
                          <span>{Number(d.slice(8))}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="cal-legend">
              <span><i className="lg-blocked" />{t.unavailable}</span>
              <span><i className="lg-sel" />{t.selected}</span>
              {checkIn && (
                <button type="button" className="link-btn" onClick={reset}>{t.reset}</button>
              )}
            </div>
            <p className="cal-hint" role="status">{status === "loading" ? t.loading : hint}</p>
          </div>

          <aside className="panel summary" aria-labelledby="bk-summary">
            <h3 id="bk-summary">{t.selected}</h3>
            <div className="picked">
              <div>
                <small>{t.checkIn}</small>
                <b>{checkIn ? fmt(checkIn) : "…"}</b>
              </div>
              <div>
                <small>{t.checkOut}</small>
                <b>{checkOut ? fmt(checkOut) : "…"}</b>
              </div>
            </div>
            <div className="stepper">
              <div>
                <span className="stepper-label" id="bk-guests">{t.guests}</span>
                <output aria-labelledby="bk-guests" aria-live="polite">{guests}</output>
              </div>
              <div className="stepper-ctrl">
                <button type="button" className="icon-btn" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label={t.guestsLess}>
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10" stroke="currentColor" strokeWidth="1.8" /></svg>
                </button>
                <button type="button" className="icon-btn" onClick={() => setGuests((g) => Math.min(STAY.maxGuests, g + 1))} disabled={guests >= STAY.maxGuests} aria-label={t.guestsMore}>
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.8" /></svg>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {q ? (
                <motion.div
                  key="q"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <dl className="lines" aria-live="polite">
                    <div>
                      <dt>{t.nights(q.nights)}, {money(q.perPerson)} {t.perPerson}</dt>
                      <dd>× {q.guests}</dd>
                    </div>
                    <div className="total">
                      <dt>{t.total}</dt>
                      <dd>{money(q.total)}</dd>
                    </div>
                    {q.dueLater > 0 && (
                      <>
                        <div><dt>{t.dueNow}</dt><dd>{money(q.dueNow)}</dd></div>
                        <div><dt>{t.dueLater}</dt><dd>{money(q.dueLater)}</dd></div>
                      </>
                    )}
                  </dl>

                  <form className="form" onSubmit={submit}>
                    <h4>{t.details}</h4>
                    <div className="field">
                      <label htmlFor="bk-name">{t.name}</label>
                      <input id="bk-name" name="name" required minLength={2} maxLength={LIMITS.name} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="field">
                      <label htmlFor="bk-email">{t.email}</label>
                      <input id="bk-email" name="email" type="email" inputMode="email" required maxLength={LIMITS.email} autoComplete="email" spellCheck={false} autoCapitalize="none" placeholder={locale === "fr" ? "prenom@exemple.com" : "name@example.com"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="field">
                      <label htmlFor="bk-phone">{t.phone}</label>
                      <input id="bk-phone" name="phone" type="tel" inputMode="tel" maxLength={LIMITS.phone} autoComplete="tel" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="field">
                      <label htmlFor="bk-msg">{t.message}</label>
                      <textarea id="bk-msg" name="message" maxLength={LIMITS.message} rows={3} placeholder={t.messagePh} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    </div>
                    {/* Champ piège pour les robots, invisible pour les visiteurs */}
                    <div className="hp" aria-hidden="true">
                      <label htmlFor="bk-website">{t.honeypot}</label>
                      <input id="bk-website" name="website" tabIndex={-1} autoComplete="off" value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                    </div>
                    {error && (
                      <div className="notice error" role="alert" tabIndex={-1} ref={errorRef}>
                        {t.errors[error] || t.errors.generic}{" "}
                        {["payments_off", "busy", "sync"].includes(error) && <a href={mailto}>{SITE.email}</a>}
                      </div>
                    )}
                    <button className="btn" type="submit" disabled={sending} aria-busy={sending}>
                      {sending && <span className="spinner" aria-hidden="true" />}
                      {sending ? t.paying : t.pay(money(q.dueNow))}
                    </button>
                    <p className="fine">{t.secure}</p>
                  </form>
                </motion.div>
              ) : (
                <motion.p key="e" className="empty-sum" initial={{ opacity: 0 }} animate={{ opacity: 0.75 }} exit={{ opacity: 0 }}>
                  {selectingOut ? t.pickOut : t.pickDates}
                </motion.p>
              )}
            </AnimatePresence>
            <p className="fine" style={{ marginTop: 20 }}>
              {t.contactAlt} <a href={`mailto:${SITE.email}`}>{t.write}</a>
            </p>
          </aside>
        </div>
    </>
  );
}
