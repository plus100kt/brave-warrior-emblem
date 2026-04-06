import React, { useState } from "react";
import { Goal, GOAL_MAX, Member } from "@/lib/data";
import { abyssValue, formatAbyss } from "@/lib/utils";

const PAGE_SIZE = 10;

type Props = {
  members: Member[];
  emblemKeys: string[];
};

function queueForEmblem(members: Member[], emblemKey: string) {
  const rankMap = new Map<string, number>();
  const jobs = ["어쎄신", "프리스트", "워리어", "위자드", "아처"];

  for (const job of jobs) {
    const same = members.filter((m) => m.job === job).sort((a, b) => abyssValue(b) - abyssValue(a));
    same.forEach((m, i) => rankMap.set(m.id, i + 1));
  }

  return members
    .filter((m) => m.emblems.some((e) => e.emblemKey === emblemKey))
    .map((m) => {
      const emblem = m.emblems.find((e) => e.emblemKey === emblemKey)!;
      const goal = emblem.goal as Goal;
      const max = GOAL_MAX[goal];
      return {
        member: m,
        classRank: rankMap.get(m.id) ?? 999,
        count: emblem.count,
        goal,
        max,
      };
    })
    .filter((x) => x.count < x.max)
    .sort((a, b) => {
      if (a.classRank !== b.classRank) return a.classRank - b.classRank;
      return abyssValue(b.member) - abyssValue(a.member);
    });
}

const RANK_LABELS = ["1순위", "2순위", "3순위"];
const REST_STYLE: React.CSSProperties = { borderLeft: "3px solid #d1d5db", background: "rgba(0,0,0,0.02)", borderColor: "#e5e7eb" };
const RANK_STYLES: React.CSSProperties[] = [
  { borderLeft: "3px solid #d97706", background: "rgba(217,119,6,0.06)", borderColor: "rgba(217,119,6,0.25)" },
  { borderLeft: "3px solid #dc2626", background: "rgba(220,38,38,0.05)", borderColor: "rgba(220,38,38,0.2)" },
  { borderLeft: "3px solid #d1d5db", background: "rgba(0,0,0,0.02)",      borderColor: "#e5e7eb" },
];

const RANK_BADGE_STYLES: React.CSSProperties[] = [
  { background: "rgba(217,119,6,0.12)",  color: "#b45309", border: "1px solid rgba(217,119,6,0.3)" },
  { background: "rgba(220,38,38,0.1)",  color: "#dc2626", border: "1px solid rgba(220,38,38,0.3)" },
  { background: "rgba(0,0,0,0.05)",      color: "#6b7280", border: "1px solid #d1d5db" },
];

export default function QueueBoard({ members, emblemKeys }: Props) {
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const totalPages = Math.max(1, Math.ceil(emblemKeys.length / PAGE_SIZE));
  const paged = emblemKeys.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="card">
      <h2>엠블럼 보급 현황</h2>
      <div className="cardDesc">보급 우선순위에 따라 상위 3명의 순번을 표시합니다. 카드를 클릭하면 전체 순번을 확인할 수 있습니다.</div>

      {emblemKeys.length === 0 ? (
        <div className="empty">검색 결과가 없습니다.</div>
      ) : (
        <>
          {paged.map((key) => {
            const queue = queueForEmblem(members, key);
            if (queue.length === 0) return null;
            const isExpanded = expandedKeys.has(key);
            const displayed = isExpanded ? queue : queue.slice(0, 3);

            return (
              <div key={key} className="queueCard">
                <div className="queueTitle" style={{ cursor: "pointer" }} onClick={() => toggleExpand(key)}>
                  <div>
                    <div className="tag">{key.split("|")[0]}</div>
                    <div className="queueName" style={{ marginTop: 8 }}>{key.split("|")[1]}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="badge">{queue.length}명 진행 중</div>
                    <span className="muted" style={{ fontSize: 16 }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {displayed.length === 0 ? (
                  <div className="queueBlock muted">진행 인원 없음</div>
                ) : (
                  displayed.map((entry, i) => (
                    <div key={entry.member.id} className="queueBlock" style={i < 3 ? RANK_STYLES[i] : REST_STYLE}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="badge" style={i < 3 ? RANK_BADGE_STYLES[i] : { background: "rgba(0,0,0,0.05)", color: "#6b7280", border: "1px solid #d1d5db" }}>
                          {i < 3 ? RANK_LABELS[i] : `${i + 1}순위`}
                        </span>
                        <strong>{entry.member.nickname}</strong>
                        <span className="muted">· {entry.member.job}</span>
                      </div>
                      <div className="muted" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>비경 {formatAbyss(entry.member)} · 직업 내 {entry.classRank}위 · {entry.count}/{entry.max}</span>
                        <span className="badge" style={entry.goal === "전설"
                          ? { background: "rgba(217,119,6,0.12)", color: "#b45309", border: "1px solid rgba(217,119,6,0.3)" }
                          : { background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.3)" }
                        }>{entry.goal}</span>
                      </div>
                    </div>
                  ))
                )}
                {queue.length > 3 && (
                  <button
                    type="button"
                    className="ghostBtn"
                    style={{ width: "100%", marginTop: 10, fontSize: 12 }}
                    onClick={() => toggleExpand(key)}
                  >
                    {isExpanded ? "▲ 접기" : `▼ 전체 보기 (${queue.length}명)`}
                  </button>
                )}
              </div>
            );
          })}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="pageBtn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`pageBtn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="pageBtn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
