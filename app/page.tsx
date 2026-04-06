"use client";

import MemberForm from "@/components/MemberForm";
import MemberList from "@/components/MemberList";
import QueueBoard from "@/components/QueueBoard";
import EmblemCatalog from "@/components/EmblemCatalog";
import { CATEGORIES, EmblemItem, Job, Member } from "@/lib/data";
import * as api from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const [tab, setTab] = useState<"emblem" | "view" | "edit" | "emblemCreate">("emblem");
  const [members, setMembers] = useState<Member[]>([]);
  const [emblemCatalog, setEmblemCatalog] = useState<EmblemItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job>("어쎄신");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [selectedEmblemName, setSelectedEmblemName] = useState("전체");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const showStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 3000);
  };

  const loadMembers = async () => {
    const data = await api.fetchMembers();
    setMembers(data as Member[]);
  };

  const loadEmblems = async () => {
    const data = await api.fetchEmblems();
    setEmblemCatalog(data);
  };

  useEffect(() => {
    Promise.all([loadMembers(), loadEmblems()]).catch((e) =>
      setError(e instanceof Error ? e.message : "불러오기 실패")
    );
  }, []);

  const allEmblemKeys = useMemo(
    () => emblemCatalog.map((e) => `${e.category}|${e.name}`),
    [emblemCatalog]
  );

  const filteredEmblemKeys = useMemo(() => {
    return allEmblemKeys.filter((key) => {
      const [cat, name] = key.split("|");
      if (keyword.trim()) return key.toLowerCase().includes(keyword.toLowerCase());
      if (selectedCategory !== "전체" && cat !== selectedCategory) return false;
      if (selectedEmblemName !== "전체" && name !== selectedEmblemName) return false;
      return true;
    });
  }, [allEmblemKeys, keyword, selectedCategory, selectedEmblemName]);

  const categoryEmblemNames = useMemo(() => {
    if (selectedCategory === "전체") return [];
    return emblemCatalog.filter((e) => e.category === selectedCategory).map((e) => e.name);
  }, [emblemCatalog, selectedCategory]);

  const selectedMember = useMemo(
    () => members.find((m) => m.id === selectedId) ?? null,
    [members, selectedId]
  );

  const memberFormProps = {
    emblemCatalog,
    onUpdate: async (id: string, payload: Omit<Member, "id">) => {
      try {
        setError("");
        await api.updateMember(id, payload);
        showStatus("전투원 정보를 수정했습니다.");
        await loadMembers();
      } catch (e) { setError(e instanceof Error ? e.message : "수정 실패"); }
    },
    onDelete: async (id: string) => {
      if (!window.confirm("해당 전투원을 삭제하시겠습니까?")) return;
      try {
        setError("");
        await api.deleteMember(id);
        showStatus("전투원을 삭제했습니다.");
        setSelectedId(null);
        await loadMembers();
      } catch (e) { setError(e instanceof Error ? e.message : "삭제 실패"); }
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <h1>엠블럼 길드 대시보드</h1>
        <p>길드원 엠블럼 보급 현황을 관리하는 대시보드입니다.</p>

        <div className="toolbar">
          <button className={`tabBtn ${tab === "emblem" ? "active" : ""}`} onClick={() => setTab("emblem")} type="button">
            엠블럼
          </button>
          <button className={`tabBtn ${tab === "view" ? "active" : ""}`} onClick={() => setTab("view")} type="button">
            전투원 데이터
          </button>
          <button className={`tabBtn ${tab === "edit" ? "active" : ""}`} onClick={() => setTab("edit")} type="button">
            전투원 생성
          </button>
          <button className={`tabBtn ${tab === "emblemCreate" ? "active" : ""}`} onClick={() => setTab("emblemCreate")} type="button">
            엠블럼 생성
          </button>
          <button className="ghostBtn" onClick={async () => {
            await Promise.all([loadMembers(), loadEmblems()]);
          }} type="button">새로고침</button>
        </div>
        {status ? <div className="status">{status}</div> : null}
        {error ? <div className="error">{error}</div> : null}
      </section>

      {tab === "emblem" && (
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h2>엠블럼 검색</h2>
            <div className="cardDesc">엠블럼 이름으로 검색하거나, 분류와 엠블럼을 선택하여 조회하실 수 있습니다.</div>
            <input
              className="search"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                if (e.target.value) { setSelectedCategory("전체"); setSelectedEmblemName("전체"); }
              }}
              placeholder="예: 스크림 뱃, 히드라, 기교"
            />
            <div className="twoCol" style={{ marginTop: 12 }}>
              <div>
                <label className="label">분류</label>
                <select className="select" value={selectedCategory} onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedEmblemName("전체");
                  setKeyword("");
                }}>
                  <option value="전체">전체</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">엠블럼</label>
                <select className="select" value={selectedEmblemName} onChange={(e) => {
                  setSelectedEmblemName(e.target.value);
                  setKeyword("");
                }} disabled={selectedCategory === "전체"}>
                  <option value="전체">전체</option>
                  {categoryEmblemNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <QueueBoard members={members} emblemKeys={filteredEmblemKeys} />
        </div>
      )}

      {tab === "emblemCreate" && (
        <EmblemCatalog
          emblems={emblemCatalog}
          onCreate={async (category, name) => {
            try {
              setError("");
              await api.createEmblem(category, name);
              showStatus(`"${name}" 엠블럼을 등록했습니다.`);
              await loadEmblems();
            } catch (e) { setError(e instanceof Error ? e.message : "등록 실패"); }
          }}
          onDelete={async (id) => {
            try {
              setError("");
              await api.deleteEmblem(id);
              showStatus("엠블럼을 삭제했습니다.");
              await loadEmblems();
            } catch (e) { setError(e instanceof Error ? e.message : "삭제 실패"); }
          }}
        />
      )}

      {tab === "edit" && (
        <MemberForm
          wide
          member={null}
          emblemCatalog={emblemCatalog}
          onCreate={async (payload) => {
            try {
              setError("");
              await api.createMember(payload);
              showStatus("전투원을 생성했습니다.");
              await loadMembers();
            } catch (e) { setError(e instanceof Error ? e.message : "생성 실패"); }
          }}
          onUpdate={async () => {}}
          onDelete={async () => {}}
        />
      )}

      {tab === "view" && (
        <div className="grid">
          <MemberList
            members={members}
            selectedJob={selectedJob}
            selectedId={selectedId}
            onSelectJob={setSelectedJob}
            onSelectMember={(member) => {
              setSelectedId(member.id);
              setSelectedJob(member.job);
            }}
          />
          <div className="sidePanel">
            {selectedMember ? (
              <MemberForm
                member={selectedMember}
                {...memberFormProps}
                onCreate={async () => {}}
              />
            ) : (
              <div className="card">
                <h3>전투원 수정</h3>
                <div className="infoBox">왼쪽 목록에서 전투원을 선택하시면 정보를 수정할 수 있습니다.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
