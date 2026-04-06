import React, { useState } from "react";
import { Member } from "@/lib/data";
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
    .map((m) => ({
      member: m,
      classRank: rankMap.get(m.id) ?? 999,
      count: m.emblems.find((e) => e.emblemKey === emblemKey)?.count ?? 0
    }))
    .filter((x) => x.count < 9)
    .sort((a, b) => {
      if (a.classRank !== b.classRank) return a.classRank - b.classRank;
      return abyssValue(b.member) - abyssValue(a.member);
    });
}

const RANK_LABELS = ["1순위", "2순위", "3순위"];
const RANK_STYLES: React.CSSProperties[] = [
  { borderLeft: "3px solid #d97706", background: "rgba(217,119,6,0.06)", borderColor: "rgba(217,119,6,0.25)" },
  { borderLeft: "3px solid #7c3aed", background: "rgba(124,58,237,0.05)", borderColor: "rgba(124,58,237,0.2)" },
  { borderLeft: "3px solid #d1d5db", background: "rgba(0,0,0,0.02)",      borderColor: "#e5e7eb" },
];

const RANK_BADGE_STYLES: React.CSSProperties[] = [
  { background: "rgba(217,119,6,0.12)",  color: "#b45309", border: "1px solid rgba(217,119,6,0.3)" },
  { background: "rgba(124,58,237,0.1)",  color: "#6d28d9", border: "1px solid rgba(124,58,237,0.3)" },
  { background: "rgba(0,0,0,0.05)",      color: "#6b7280", border: "1px solid #d1d5db" },
];

export default function QueueBoard({ members, emblemKeys }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(emblemKeys.length / PAGE_SIZE));
  const paged = emblemKeys.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="card">
      <h2>엠블럼 보급 현황</h2>
      <div className="cardDesc">보급 우선순위에 따라 상위 3명의 순번을 표시합니다.</div>

      {emblemKeys.length === 0 ? (
        <div className="empty">검색 결과가 없습니다.</div>
      ) : (
        <>
          {paged.map((key) => {
            const queue = queueForEmblem(members, key);
            const top3 = queue.slice(0, 3);

            return (
              <div key={key} className="queueCard">
                <div className="queueTitle">
                  <div>
                    <div className="tag">{key.split("|")[0]}</div>
                    <div className="queueName" style={{ marginTop: 8 }}>{key.split("|")[1]}</div>
                  </div>
                  <div className="badge">{queue.length}명 진행 중</div>
                </div>

                {top3.length === 0 ? (
                  <div className="queueBlock muted">진행 인원 없음</div>
                ) : (
                  top3.map((entry, i) => (
                    <div key={entry.member.id} className="queueBlock" style={RANK_STYLES[i]}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="badge" style={RANK_BADGE_STYLES[i]}>{RANK_LABELS[i]}</span>
                        <strong>{entry.member.nickname}</strong>
                        <span className="muted">· {entry.member.job}</span>
                      </div>
                      <div className="muted" style={{ marginTop: 4 }}>
                        비경 {formatAbyss(entry.member)} · 직업 내 {entry.classRank}위 · 전설 {entry.count}/9
                      </div>
                    </div>
                  ))
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
