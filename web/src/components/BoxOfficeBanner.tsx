import { useEffect, useState } from "react";
import { getBoxOffice, type BoxOfficeResponse } from "../api/boxOffice";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: BoxOfficeResponse };

export function BoxOfficeBanner() {
  const [state, setState] = useState<State>({ status: "loading" });

  function load() {
    setState({ status: "loading" });
    getBoxOffice()
      .then((data) => setState({ status: "ready", data }))
      .catch(() => setState({ status: "error" }));
  }

  useEffect(() => {
    load();
  }, []);

  if (state.status === "loading") {
    return (
      <p className="fs-5" role="status">
        박스오피스 순위를 불러오는 중...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div>
        <p className="fs-5">박스오피스 순위를 불러오지 못했습니다.</p>
        <button type="button" className="btn btn-outline-light btn-sm" onClick={load}>
          다시 시도
        </button>
      </div>
    );
  }

  const { items, targetDate, stale } = state.data;

  return (
    <>
      <h1 className="display-5 fw-bold">
        Korean Box Office Rankings
        <span style={{ fontSize: "50%" }}>
          {" "}
          (일별 순위, 기준일: {targetDate}
          {stale ? " · 최신 조회 실패로 이전 값 표시" : ""})
        </span>
      </h1>
      {items.length === 0 ? (
        <p className="col-md-8 fs-4">표시할 박스오피스 데이터가 없습니다.</p>
      ) : (
        items.map((item) => (
          <p className="col-md-8 fs-4" key={item.rank}>
            {item.rank}. {item.title} (Total Audience:{" "}
            {item.audienceCount.toLocaleString("en-US")})
          </p>
        ))
      )}
    </>
  );
}
