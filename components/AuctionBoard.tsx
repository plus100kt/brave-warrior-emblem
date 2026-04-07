"use client";
import { useState } from "react";
import { CATEGORIES, Category, EmblemItem, Goal, GOAL_MAX, GrantLog, GrantQueueItem, Job, Member } from "@/lib/data";
import { formatAbyss, sortWithinJob } from "@/lib/utils";

const JOBS: Job[] = ["어쎄신", "프리스트", "워리어", "위자드", "아처"];

type Props = {
  members: Member[];
  emblemCatalog: EmblemItem[];
  rankMin: number;
  rankMax: number;
  grantLogs: GrantLog[];
  onGrantAll: (items: GrantQueueItem[], auctionType: string) => Promise<void>;
  onDeleteLog: (logId: string) => Promise<void>;
};

export default function AuctionBoard({ members, emblemCatalog, rankMin, rankMax, grantLogs, onGrantAll, onDeleteLog }: Props) {
  const [selectedJob, setSelectedJob] = useState<Job>("어쎄신");
  const [grantJob, setGrantJob] = useState<Job>("어쎄신");
  const [grantMemberId, setGrantMemberId] = useState("");
  const [category, setCategory] = useState<Category>("기교");
  const [emblemName, setEmblemName] = useState("");
  const [quantityStr, setQuantityStr] = useState("1");
  const [queue, setQueue] = useState<GrantQueueItem[]>([]);
  const [granting, setGranting] = useState(false);

  const auctionType = rankMin <= 3 ? "월화" : "수목";

  const eligibleForJob = (job: Job) =>
    sortWithinJob(members.filter((m) => m.job === job)).slice(rankMin - 1, rankMax);

  const currentEligible = eligibleForJob(selectedJob);

  const allEligible = JOBS.flatMap((job) =>
    eligibleForJob(job).map((m, i) => ({ ...m, rank: rankMin + i }))
  );

  const namesForCategory = emblemCatalog.filter((e) => e.category === category).map((e) => e.name);

  const addToQueue = () => {
    if (!grantMemberId || !emblemName) return;
    const member = eligibleForJob(grantJob).find((m) => m.id === grantMemberId);
    if (!member) return;
    const quantity = Math.max(1, Number(quantityStr) || 1);
    setQueue((prev) => [...prev, {
      memberId: member.id,
      memberNickname: member.nickname,
      memberJob: member.job,
      emblemKey: `${category}|${emblemName}`,
      quantity,
    }]);
    setQuantityStr("1");
  };

  const handleGrantAll = async () => {
    if (queue.length === 0) return;
    setGranting(true);
    try {
      await onGrantAll(queue, auctionType);
      setQueue([]);
    } finally {
      setGranting(false);
    }
  };

  const myLogs = grantLogs.filter((l) => l.auctionType === auctionType);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* 참여 가능 전투원 */}
      <div className="card">
        <h2>참여 가능 전투원 ({rankMin}~{rankMax}위)</h2>
        <div className="cardDesc">직업별 비경 순위 {rankMin}위부터 {rankMax}위까지 경매에 참여할 수 있습니다.</div>
        <div className="jobTabs">
          {JOBS.map((job) => (
            <button key={job} className={`subTabBtn ${selectedJob === job ? "active" : ""}`}
              onClick={() => setSelectedJob(job)} type="button">
              {job}
            </button>
          ))}
        </div>
        <div className="memberHeader" style={{ gridTemplateColumns: "48px 1fr 90px 1fr" }}>
          <div>순위</div><div>닉네임</div><div>비경</div><div>진행 엠블럼</div>
        </div>
        {currentEligible.length === 0 ? (
          <div className="empty">참여 가능한 전투원이 없습니다.</div>
        ) : (
          currentEligible.map((m, idx) => (
            <div key={m.id} className="memberRow" style={{ gridTemplateColumns: "48px 1fr 90px 1fr", cursor: "default" }}>
              <div>{rankMin + idx}위</div>
              <div><strong>{m.nickname}</strong></div>
              <div>{formatAbyss(m)}</div>
              <div className="tagWrap">
                {m.emblems.length === 0
                  ? <span className="muted">없음</span>
                  : m.emblems.map((e) => (
                    <span key={e.emblemKey} className="tag">
                      {e.emblemKey.split("|")[1]} {e.count}/{GOAL_MAX[e.goal]}
                    </span>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 엠블럼 지급 */}
      <div className="card">
        <h2>엠블럼 지급</h2>
        <div className="cardDesc">지급할 전투원과 엠블럼을 목록에 추가한 뒤 일괄 지급합니다.</div>

        {/* 큐 추가 폼 */}
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 1fr 60px auto", gap: 12, alignItems: "end", marginTop: 12 }}>
          <div>
            <label className="label">직업</label>
            <select className="select" value={grantJob} onChange={(e) => {
              setGrantJob(e.target.value as Job);
              setGrantMemberId("");
            }}>
              {JOBS.map((job) => <option key={job} value={job}>{job}</option>)}
            </select>
          </div>
          <div>
            <label className="label">전투원</label>
            <select className="select" value={grantMemberId} onChange={(e) => setGrantMemberId(e.target.value)}>
              <option value="">전투원 선택</option>
              {eligibleForJob(grantJob).map((m) => (
                <option key={m.id} value={m.id}>{m.nickname}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">분류</label>
            <select className="select" value={category} onChange={(e) => {
              setCategory(e.target.value as Category);
              setEmblemName("");
            }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">엠블럼</label>
            <select className="select" value={emblemName} onChange={(e) => setEmblemName(e.target.value)}
              disabled={namesForCategory.length === 0}>
              <option value="">엠블럼 선택</option>
              {namesForCategory.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">수량</label>
            <input className="input" type="number" min={1} value={quantityStr}
              onChange={(e) => setQuantityStr(e.target.value)}
              onBlur={() => setQuantityStr(String(Math.max(1, Number(quantityStr) || 1)))} />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button className="ghostBtn" type="button" onClick={addToQueue}
              disabled={!grantMemberId || !emblemName} style={{ whiteSpace: "nowrap" }}>
              + 추가
            </button>
          </div>
        </div>

        {/* 지급 큐 목록 */}
        {queue.length === 0 ? (
          <div className="empty" style={{ marginTop: 12 }}>지급 목록이 비어있습니다.</div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {queue.map((item, idx) => (
              <div key={idx} className="emblemRow" style={{ gridTemplateColumns: "1fr 1fr 50px 64px" }}>
                <div style={{ fontSize: 13 }}><strong>{item.memberNickname}</strong> <span className="muted">({item.memberJob})</span></div>
                <div style={{ fontSize: 13 }}><span className="tag">{item.emblemKey.split("|")[0]}</span> {item.emblemKey.split("|")[1]}</div>
                <div style={{ fontSize: 13, textAlign: "center" }}>{item.quantity}개</div>
                <button type="button" className="ghostBtn" onClick={() => setQueue((prev) => prev.filter((_, i) => i !== idx))}>삭제</button>
              </div>
            ))}
          </div>
        )}

        {/* 일괄 지급 버튼 */}
        <div style={{ marginTop: 16 }}>
          <button className="primaryBtn" type="button" onClick={handleGrantAll}
            disabled={queue.length === 0 || granting} style={{ width: "100%" }}>
            {granting ? "지급 중..." : `일괄 지급 (${queue.length}건)`}
          </button>
        </div>
      </div>

      {/* 지급 로그 */}
      <div className="card">
        <h2>지급 로그</h2>
        <div className="cardDesc">지급 내역을 삭제하면 해당 수량이 재고에서 자동으로 차감됩니다.</div>
        {myLogs.length === 0 ? (
          <div className="empty">지급 내역이 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {myLogs.map((log) => (
              <div key={log.id} className="emblemRow" style={{ gridTemplateColumns: "140px 1fr 1fr 50px 64px" }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  {new Date(log.grantedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ fontSize: 13 }}><strong>{log.memberNickname}</strong> <span className="muted">({log.memberJob})</span></div>
                <div style={{ fontSize: 13 }}><span className="tag">{log.emblemKey.split("|")[0]}</span> {log.emblemKey.split("|")[1]}</div>
                <div style={{ fontSize: 13, textAlign: "center" }}>{log.quantity}개</div>
                <button type="button" className="ghostBtn" onClick={() => onDeleteLog(log.id)}>삭제</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
