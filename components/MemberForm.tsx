import { CATEGORIES, Category, EmblemItem, Goal, GOAL_MAX, Job, Member } from "@/lib/data";
import { useEffect, useState } from "react";

type Props = {
  member: Member | null;
  emblemCatalog: EmblemItem[];
  wide?: boolean;
  onCreate: (payload: Omit<Member, "id">) => Promise<void>;
  onUpdate: (id: string, payload: Omit<Member, "id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function createBlank(): Omit<Member, "id"> {
  return { nickname: "", job: "어쎄신", abyssFloor: 4, abyssStage: 1, emblems: [] };
}

const GOAL_BADGE: Record<Goal, React.CSSProperties> = {
  전설: { background: "rgba(217,119,6,0.12)", color: "#b45309", border: "1px solid rgba(217,119,6,0.3)" },
  신화: { background: "rgba(220,38,38,0.1)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.3)" },
};

export default function MemberForm({ member, emblemCatalog, wide = false, onCreate, onUpdate, onDelete }: Props) {
  const [draft, setDraft] = useState<Omit<Member, "id">>(createBlank());
  const [category, setCategory] = useState<Category>("기교");
  const [emblemName, setEmblemName] = useState<string>("");
  const [goal, setGoal] = useState<Goal>("전설");
  const [addCountStr, setAddCountStr] = useState("0");
  const [countStrs, setCountStrs] = useState<Record<string, string>>({});
  const [floorStr, setFloorStr] = useState(String(draft.abyssFloor));
  const [stageStr, setStageStr] = useState(String(draft.abyssStage));

  const namesForCategory = emblemCatalog.filter((e) => e.category === category).map((e) => e.name);

  useEffect(() => {
    if (member) {
      const { id: _, ...rest } = member;
      setDraft(rest);
      setFloorStr(String(member.abyssFloor));
      setStageStr(String(member.abyssStage));
    } else {
      setDraft(createBlank());
      setFloorStr("4");
      setStageStr("1");
    }
  }, [member]);

  useEffect(() => {
    setEmblemName(namesForCategory[0] ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, emblemCatalog.length]);

  const addEmblem = () => {
    if (!emblemName) return;
    const emblemKey = `${category}|${emblemName}`;
    if (draft.emblems.some((e) => e.emblemKey === emblemKey)) return;
    const max = GOAL_MAX[goal];
    const count = Math.max(0, Math.min(max, Number(addCountStr) || 0));
    setDraft((prev) => ({ ...prev, emblems: [...prev.emblems, { emblemKey, count, goal }] }));
    setAddCountStr("0");
  };

  const submit = async () => {
    if (!draft.nickname.trim()) { alert("닉네임을 입력해주세요."); return; }
    const floor = Math.max(1, Number(floorStr) || 1);
    const stage = Math.max(1, Number(stageStr) || 1);
    const payload = { ...draft, nickname: draft.nickname.trim(), abyssFloor: floor, abyssStage: stage };
    if (member) await onUpdate(member.id, payload);
    else { await onCreate(payload); setDraft(createBlank()); setFloorStr("4"); setStageStr("1"); }
  };

  const basicInfo = (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <label className="label">닉네임</label>
        <input className="input" value={draft.nickname} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} placeholder="전투원 닉네임" />
      </div>
      <div>
        <label className="label">직업</label>
        <select className="select" value={draft.job} onChange={(e) => setDraft({ ...draft, job: e.target.value as Job })}>
          <option value="어쎄신">어쎄신</option>
          <option value="프리스트">프리스트</option>
          <option value="워리어">워리어</option>
          <option value="위자드">위자드</option>
          <option value="아처">아처</option>
        </select>
      </div>
      <div className="twoCol">
        <div>
          <label className="label">비경 층</label>
          <input className="input" type="number" min={1} value={floorStr} onChange={(e) => setFloorStr(e.target.value)} onBlur={() => setFloorStr(String(Math.max(1, Number(floorStr) || 1)))} />
        </div>
        <div>
          <label className="label">비경 스테이지</label>
          <input className="input" type="number" min={1} value={stageStr} onChange={(e) => setStageStr(e.target.value)} onBlur={() => setStageStr(String(Math.max(1, Number(stageStr) || 1)))} />
        </div>
      </div>
    </div>
  );

  const emblemEditor = (
    <div className="emblemEditor" style={{ height: "100%" }}>
      <strong style={{ fontSize: 13 }}>보급 엠블럼 추가</strong>
      {wide ? (
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr auto 70px auto", gap: 12, marginTop: 12, alignItems: "end" }}>
          <div>
            <label className="label">분류</label>
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">엠블럼</label>
            <select className="select" value={emblemName} onChange={(e) => setEmblemName(e.target.value)} disabled={namesForCategory.length === 0}>
              {namesForCategory.length === 0 ? <option value="">등록된 엠블럼 없음</option> : namesForCategory.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">목표 등급</label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["전설", "신화"] as Goal[]).map((g) => (
                <button key={g} type="button" onClick={() => setGoal(g)} style={{
                  padding: "9px 14px", borderRadius: 10, border: "1px solid", cursor: "pointer",
                  fontWeight: 700, fontSize: 13, transition: "all .15s", whiteSpace: "nowrap",
                  ...(goal === g ? GOAL_BADGE[g] : { background: "transparent", color: "#9ca3af", borderColor: "#e2e6f0" })
                }}>{g} ({GOAL_MAX[g]}개)</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">현재 개수</label>
            <input className="input" type="number" min={0} max={GOAL_MAX[goal]} value={addCountStr}
              onChange={(e) => setAddCountStr(e.target.value)}
              onBlur={() => setAddCountStr(String(Math.max(0, Math.min(GOAL_MAX[goal], Number(addCountStr) || 0))))} />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button type="button" className="ghostBtn" onClick={addEmblem} disabled={!emblemName} style={{ whiteSpace: "nowrap", width: "100%" }}>+ 추가</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <div className="twoCol">
            <div>
              <label className="label">분류</label>
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">엠블럼</label>
              <select className="select" value={emblemName} onChange={(e) => setEmblemName(e.target.value)} disabled={namesForCategory.length === 0}>
                {namesForCategory.length === 0 ? <option value="">등록된 엠블럼 없음</option> : namesForCategory.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 70px auto", gap: 8, alignItems: "end" }}>
            <div>
              <label className="label">목표 등급</label>
              <div style={{ display: "flex", gap: 6 }}>
                {(["전설", "신화"] as Goal[]).map((g) => (
                  <button key={g} type="button" onClick={() => setGoal(g)} style={{
                    padding: "8px 10px", borderRadius: 10, border: "1px solid", cursor: "pointer",
                    fontWeight: 700, fontSize: 12, transition: "all .15s", whiteSpace: "nowrap", flex: 1,
                    ...(goal === g ? GOAL_BADGE[g] : { background: "transparent", color: "#9ca3af", borderColor: "#e2e6f0" })
                  }}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">현재 개수</label>
              <input className="input" type="number" min={0} max={GOAL_MAX[goal]} value={addCountStr}
                onChange={(e) => setAddCountStr(e.target.value)}
                onBlur={() => setAddCountStr(String(Math.max(0, Math.min(GOAL_MAX[goal], Number(addCountStr) || 0))))} />
            </div>
            <div style={{ alignSelf: "end" }}>
              <button type="button" className="ghostBtn" onClick={addEmblem} disabled={!emblemName} style={{ whiteSpace: "nowrap", width: "100%" }}>+ 추가</button>
            </div>
          </div>
        </div>
      )}
      {draft.emblems.length === 0 ? (
        <div className="empty" style={{ marginTop: 10 }}>추가된 엠블럼이 없습니다.</div>
      ) : (
        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
          {draft.emblems.map((e) => {
            const max = GOAL_MAX[e.goal];
            return (
              <div key={e.emblemKey} className="emblemRow" style={{ gridTemplateColumns: "80px 1fr 60px 80px 64px" }}>
                <div><span className="tag">{e.emblemKey.split("|")[0]}</span></div>
                <div style={{ fontSize: 13 }}>{e.emblemKey.split("|")[1]}</div>
                <span className="badge" style={GOAL_BADGE[e.goal]}>{e.goal}</span>
                <input className="input" type="number" min={0} max={max}
                  value={countStrs[e.emblemKey] ?? String(e.count)}
                  onChange={(ev) => setCountStrs((prev) => ({ ...prev, [e.emblemKey]: ev.target.value }))}
                  onBlur={(ev) => {
                    const clamped = Math.max(0, Math.min(max, Number(ev.target.value) || 0));
                    setCountStrs((prev) => ({ ...prev, [e.emblemKey]: String(clamped) }));
                    setDraft((prev) => ({
                      ...prev,
                      emblems: prev.emblems.map((x) => x.emblemKey === e.emblemKey ? { ...x, count: clamped } : x)
                    }));
                  }}
                />
                <button type="button" className="ghostBtn" onClick={() => setDraft((prev) => ({
                  ...prev, emblems: prev.emblems.filter((x) => x.emblemKey !== e.emblemKey)
                }))}>삭제</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (wide) {
    return (
      <div className="card">
        <h2>전투원 생성</h2>
        <div className="cardDesc">새 전투원 정보를 입력하여 등록하실 수 있습니다.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px", gap: 12, marginBottom: 20, alignItems: "end" }}>
          <div>
            <label className="label">닉네임</label>
            <input className="input" value={draft.nickname} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} placeholder="전투원 닉네임" />
          </div>
          <div>
            <label className="label">직업</label>
            <select className="select" value={draft.job} onChange={(e) => setDraft({ ...draft, job: e.target.value as Job })}>
              <option value="어쎄신">어쎄신</option>
              <option value="프리스트">프리스트</option>
              <option value="워리어">워리어</option>
              <option value="위자드">위자드</option>
              <option value="아처">아처</option>
            </select>
          </div>
          <div>
            <label className="label">비경 층</label>
            <input className="input" type="number" min={1} value={floorStr} onChange={(e) => setFloorStr(e.target.value)} onBlur={() => setFloorStr(String(Math.max(1, Number(floorStr) || 1)))} />
          </div>
          <div>
            <label className="label">스테이지</label>
            <input className="input" type="number" min={1} value={stageStr} onChange={(e) => setStageStr(e.target.value)} onBlur={() => setStageStr(String(Math.max(1, Number(stageStr) || 1)))} />
          </div>
        </div>
        {emblemEditor}
        <div className="toolbar" style={{ marginTop: 20 }}>
          <button type="button" className="primaryBtn" onClick={submit}>전투원 생성</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{member ? "전투원 수정" : "전투원 생성"}</h2>
      <div className="cardDesc">{member ? "전투원 정보를 수정하실 수 있습니다." : "새 전투원 정보를 입력하여 등록하실 수 있습니다."}</div>
      <div className="formGrid">
        {basicInfo}
        {emblemEditor}
        <div className="toolbar">
          <button type="button" className="primaryBtn" onClick={submit}>{member ? "수정 저장" : "전투원 생성"}</button>
          {member ? <button type="button" className="dangerBtn" onClick={() => onDelete(member.id)}>삭제</button> : null}
        </div>
      </div>
    </div>
  );
}
