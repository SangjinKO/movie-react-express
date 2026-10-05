import { useEffect, useState } from "react";
import { getReviews, type ReviewDto } from "../api/reviews";
import { ReviewCard } from "./ReviewCard";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: ReviewDto[] };

export function ReviewList() {
  const [state, setState] = useState<State>({ status: "loading" });

  function load() {
    setState({ status: "loading" });
    getReviews()
      .then(({ items }) => setState({ status: "ready", items }))
      .catch(() => setState({ status: "error" }));
  }

  useEffect(() => {
    load();
  }, []);

  if (state.status === "loading") {
    return (
      <p className="text-white" role="status">
        리뷰를 불러오는 중...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div>
        <p className="text-white">리뷰를 불러오지 못했습니다.</p>
        <button type="button" className="btn btn-outline-light btn-sm" onClick={load}>
          다시 시도
        </button>
      </div>
    );
  }

  if (state.items.length === 0) {
    return <p className="text-white">아직 등록된 리뷰가 없습니다.</p>;
  }

  return (
    <div className="row row-cols-1 row-cols-md-4 g-4">
      {state.items.map((item) => (
        <ReviewCard key={item.id} review={item} />
      ))}
    </div>
  );
}
