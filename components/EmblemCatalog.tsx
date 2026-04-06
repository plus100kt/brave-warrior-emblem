"use client";

import { useState } from "react";
import { CATEGORIES, Category, EmblemItem } from "@/lib/data";

type Props = {
  emblems: EmblemItem[];
  onCreate: (category: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function EmblemCatalog({ emblems, onCreate, onDelete }: Props) {
  const [category, setCategory] = useState<Category>("기교");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { alert("엠블럼 이름을 입력해주세요."); return; }
    setLoading(true);
    try {
      await onCreate(category, name.trim());
      setName("");
    } finally {
      setLoading(false);
    }
  };

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: emblems.filter((e) => e.category === cat)
  }));

  return (
    <div className="card">
      <h2>엠블럼 생성</h2>
      <div className="cardDesc">보급 대상 엠블럼을 등록하고 관리하실 수 있습니다.</div>

      <div className="emblemEditor">
        <strong style={{ fontSize: 13 }}>새 엠블럼 추가</strong>
        <div className="twoCol" style={{ marginTop: 12 }}>
          <div>
            <label className="label">분류</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">보스 이름</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 스크림 뱃"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
        </div>
        <div className="toolbar" style={{ marginTop: 12 }}>
          <button className="primaryBtn" onClick={handleCreate} disabled={loading} type="button">
            {loading ? "등록 중..." : "+ 엠블럼 등록"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {grouped.map(({ cat, items }) => (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="tag">{cat}</span>
              <span className="muted" style={{ fontSize: 12 }}>{items.length}개</span>
            </div>
            {items.length === 0 ? (
              <div className="empty" style={{ padding: "10px 14px", fontSize: 12 }}>등록된 엠블럼이 없습니다.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.map((e) => (
                  <div key={e.id} className="emblemRow">
                    <div><span className="tag">{e.category}</span></div>
                    <div style={{ fontWeight: 500 }}>{e.name}</div>
                    <div />
                    <button
                      type="button"
                      className="dangerBtn"
                      style={{ padding: "6px 10px", fontSize: 12 }}
                      onClick={() => {
                        if (!window.confirm(`"${e.name}" 엠블럼을 삭제하시겠습니까?`)) return;
                        onDelete(e.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
