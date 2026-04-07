import { useState } from "react";
import { Job, Member } from "@/lib/data";
import { formatAbyss, sortWithinJob } from "@/lib/utils";

type Props = {
  members: Member[];
  selectedJob: Job;
  selectedId: string | null;
  onSelectJob: (job: Job) => void;
  onSelectMember: (member: Member) => void;
};

const JOBS: Job[] = ["어쎄신", "프리스트", "워리어", "위자드", "아처"];
const PAGE_SIZE = 10;

export default function MemberList({ members, selectedJob, selectedId, onSelectJob, onSelectMember }: Props) {
  const [page, setPage] = useState(1);

  const filtered = sortWithinJob(members.filter((m) => m.job === selectedJob));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelectJob = (job: Job) => {
    setPage(1);
    onSelectJob(job);
  };

  return (
    <div className="card">
      <h2>전투원 데이터</h2>
      <div className="cardDesc">직업별로 전투원 목록을 확인하고, 선택하시면 오른쪽에서 바로 수정하실 수 있습니다.</div>

      <div className="jobTabs">
        {JOBS.map((job) => (
          <button key={job} className={`subTabBtn ${selectedJob === job ? "active" : ""}`} onClick={() => handleSelectJob(job)} type="button">
            {job}
          </button>
        ))}
      </div>

      <div className="memberHeader">
        <div>순위</div><div>닉네임</div><div>직업</div><div>비경</div><div>진행 엠블럼</div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">등록된 전투원이 없습니다.</div>
      ) : (
        <>
          {paged.map((member, idx) => {
            const globalIdx = (page - 1) * PAGE_SIZE + idx;
            return (
              <div key={member.id} className={`memberRow ${selectedId === member.id ? "active" : ""}`} onClick={() => onSelectMember(member)}>
                <div>{globalIdx + 1}위</div>
                <div><strong>{member.nickname}</strong></div>
                <div>{member.job}</div>
                <div>{formatAbyss(member)}</div>
                <div className="tagWrap">
                  {member.emblems.length === 0 ? <span className="muted">없음</span> : member.emblems.map((e) => (
                    <span key={e.emblemKey} className="tag">{e.emblemKey.split("|")[1]} {e.count}/9</span>
                  ))}
                </div>
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
