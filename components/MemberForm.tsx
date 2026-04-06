import { CATEGORIES, Category, EmblemItem, Job, Member } from "@/lib/data";
import { useEffect, useState } from "react";

type Props = {
  member: Member | null;
  emblemCatalog: EmblemItem[];
  onCreate: (payload: Omit<Member, "id">) => Promise<void>;
  onUpdate: (id: string, payload: Omit<Member, "id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function createBlank(): Omit<Member, "id"> {
  return { nickname: "", job: "어쎄신", abyssFloor: 4, abyssStage: 1, emblems: [] };
}

export default function MemberForm({ member, emblemCatalog, onCreate, onUpdate, onDelete }: Props) {
  const [draft, setDraft] = useState<Omit<Member, "id">>(createBlank());
  const [category, setCategory] = useState<Category>("기교");
  const [emblemName, setEmblemName] = useState<string>("");

  const namesForCategory = emblemCatalog.filter((e) => e.category === category).map((e) => e.name);

  useEffect(() => {
    if (member) {
      const { id: _, ...rest } = member;
      setDraft(rest);
    } else {
      setDraft(createBlank());
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
    setDraft((prev) => ({ ...prev, emblems: [...prev.emblems, { emblemKey, count: 0 }] }));
  };

  const submit = async () => {
    if (!draft.nickname.trim()) { alert("닉네임을 입력해주세요."); return; }
    const payload = { ...draft, nickname: draft.nickname.trim() };
    if (member) await onUpdate(member.id, payload);
    else { await onCreate(payload); setDraft(createBlank()); }
  };

  return (
    <div className="card">
      <h2>{member ? "전투원 수정" : "전투원 생성"}</h2>
      <div className="cardDesc">{member ? "전투원 정보를 수정하실 수 있습니다." : "새 전투원 정보를 입력하여 등록하실 수 있습니다."}</div>

      <div className="formGrid">
        <div className="twoCol">
          <div>
            <label className="label">닉네임</label>
            <input className="input" value={draft.nickname} onChange={(e) => setDraft({ ...draft, nickname: e.target.value })} />
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
        </div>

        <div className="twoCol">
          <div>
            <label className="label">비경 층</label>
            <input className="input" type="number" min={1} value={draft.abyssFloor} onChange={(e) => setDraft({ ...draft, abyssFloor: Number(e.target.value) || 1 })} />
          </div>
          <div>
            <label className="label">비경 스테이지</label>
            <input className="input" type="number" min={1} value={draft.abyssStage} onChange={(e) => setDraft({ ...draft, abyssStage: Number(e.target.value) || 1 })} />
          </div>
        </div>

        <div className="emblemEditor">
          <strong style={{ fontSize: 13 }}>보급 엠블럼 추가</strong>
          <div className="twoCol" style={{ marginTop: 12 }}>
            <div>
              <label className="label">분류</label>
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">엠블럼</label>
              <select className="select" value={emblemName} onChange={(e) => setEmblemName(e.target.value)} disabled={namesForCategory.length === 0}>
                {namesForCategory.length === 0
                  ? <option value="">등록된 엠블럼 없음</option>
                  : namesForCategory.map((n) => <option key={n} value={n}>{n}</option>)
                }
              </select>
            </div>
          </div>
          <div className="toolbar">
            <button type="button" className="ghostBtn" onClick={addEmblem} disabled={!emblemName}>+ 엠블럼 추가</button>
          </div>

          {draft.emblems.length === 0 ? (
            <div className="empty">추가된 엠블럼이 없습니다.</div>
          ) : (
            draft.emblems.map((e) => (
              <div key={e.emblemKey} className="emblemRow">
                <div><span className="tag">{e.emblemKey.split("|")[0]}</span></div>
                <div>{e.emblemKey.split("|")[1]}</div>
                <input className="input" type="number" min={0} max={9} value={e.count} onChange={(ev) => setDraft((prev) => ({
                  ...prev,
                  emblems: prev.emblems.map((x) => x.emblemKey === e.emblemKey ? { ...x, count: Math.max(0, Math.min(9, Number(ev.target.value) || 0)) } : x)
                }))} />
                <button type="button" className="ghostBtn" onClick={() => setDraft((prev) => ({
                  ...prev,
                  emblems: prev.emblems.filter((x) => x.emblemKey !== e.emblemKey)
                }))}>삭제</button>
              </div>
            ))
          )}
        </div>

        <div className="toolbar">
          <button type="button" className="primaryBtn" onClick={submit}>{member ? "수정 저장" : "전투원 생성"}</button>
          {member ? <button type="button" className="dangerBtn" onClick={() => onDelete(member.id)}>삭제</button> : null}
        </div>
      </div>
    </div>
  );
}
