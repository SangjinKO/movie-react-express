import { useState } from "react";
import { BoxOfficeBanner } from "../components/BoxOfficeBanner";
import { ReviewForm } from "../components/ReviewForm";
import { ReviewList } from "../components/ReviewList";
import "../styles/my-flix.css";

export function MyFlixPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="my-flix-page">
      <header className="p-3 text-bg-dark">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              <li>
                <span className="nav-link px-2 text-danger">MYFLIX</span>
              </li>
              <li>
                <span className="nav-link px-2 text-white">
                  &nbsp;&nbsp;&nbsp;&nbsp;"Movie Rankings &amp; My Reviews"
                </span>
              </li>
            </ul>

            <ul className="nav col-12 col-lg-auto ms-lg-auto mb-2 justify-content-center mb-md-0">
              <li>
                <a href="/" className="nav-link px-2 text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="/blog/" className="nav-link px-2 text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="/about_me/" className="nav-link px-2 text-white">
                  About Me
                </a>
              </li>
              <li>
                <a href="/my_flix/" className="nav-link px-2 text-danger">
                  My Movie
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="main">
        <div className="p-5 mb-4 bg-body-tertiary rounded-3">
          <div className="container-fluid py-5">
            <BoxOfficeBanner />
            <button
              type="button"
              className="btn btn-outline-light"
              onClick={() => setShowForm((v) => !v)}
            >
              Add a New Review to MYFLIX
            </button>
          </div>
        </div>
      </div>

      {showForm && <ReviewForm />}

      <div className="mycards">
        <ReviewList />
      </div>
    </div>
  );
}
