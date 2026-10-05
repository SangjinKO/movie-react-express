import { useState, type FormEvent } from "react";
import { addReview } from "../firebase/client";

const SAVE_KEY = import.meta.env.VITE_SAVE_KEY;
const STAR_OPTIONS = ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"];

export function ReviewForm() {
  const [image, setImage] = useState("");
  const [title, setTitle] = useState("");
  const [star, setStar] = useState("");
  const [comment, setComment] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Ported unchanged from my_flix.html: a plain client-side string compare,
    // not real authentication. Kept exactly as-is per explicit user decision —
    // no Firebase Auth / server-side write path for registration.
    if (secretKey !== SAVE_KEY) {
      setError("Secret key is not valid. Please enter a valid secret key to save");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await addReview({ image, title, comment, star });
      window.location.reload();
    } catch {
      setSubmitting(false);
      setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  return (
    <form className="mypostingbox" onSubmit={handleSubmit}>
      <div className="form-floating mb-3">
        <input
          type="url"
          className="form-control"
          id="movie-image"
          placeholder="Content Image Link"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required
        />
        <label htmlFor="movie-image">Content Image Link</label>
      </div>

      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control"
          id="movie-title"
          placeholder="Content Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="movie-title">Content Title</label>
      </div>

      <div className="input-group mb-3">
        <label className="input-group-text" htmlFor="movie-star">
          Star
        </label>
        <select
          className="form-select"
          id="movie-star"
          value={star}
          onChange={(e) => setStar(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Star
          </option>
          {STAR_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control"
          id="movie-comment"
          placeholder="Comments"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <label htmlFor="movie-comment">Comments</label>
      </div>

      <button type="submit" className="btn btn-danger mb-3" disabled={submitting}>
        {submitting ? "저장 중..." : "SAVE"}
      </button>

      <div className="form-floating mb-3">
        <input
          type="password"
          className="form-control"
          id="movie-secretkey"
          placeholder="SecretKey"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          required
        />
        <label htmlFor="movie-secretkey">Secret Key(Required to Save)</label>
      </div>

      {error && (
        <p className="text-danger" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
