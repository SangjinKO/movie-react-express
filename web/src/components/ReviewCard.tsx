import { useState } from "react";
import type { ReviewDto } from "../api/reviews";

export function ReviewCard({ review }: { review: ReviewDto }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPlaceholder = !review.imageUrl || imgFailed;

  return (
    <div className="col">
      <div className="card review-card bg-dark text-white">
        {showPlaceholder ? (
          <div
            className="card-img-top d-flex align-items-center justify-content-center bg-secondary"
            style={{ height: 220 }}
          >
            <span>이미지 없음</span>
          </div>
        ) : (
          <img
            src={review.imageUrl ?? undefined}
            alt={review.title ? `${review.title} 포스터` : "영화 포스터"}
            className="card-img-top"
            onError={() => setImgFailed(true)}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{review.title}</h5>
          <p className="card-text">{review.rating ? "⭐".repeat(review.rating) : "평점 없음"}</p>
          <p className="card-text">{review.comment}</p>
          {!review.createdAt && (
            <p className="card-text">
              <small className="text-muted">날짜 미상</small>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
