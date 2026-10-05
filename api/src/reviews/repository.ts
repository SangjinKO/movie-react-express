import { getDb } from "../firestore/client.js";
import { ServiceUnavailableError } from "../errors.js";
import type { RawReviewDoc } from "./dto.js";

/**
 * Live collection had 23 docs at investigation time (see movie-contract-findings.md).
 * This cap is a safety margin for the "small dataset, full read" strategy — once real
 * counts approach it, switch to pagination/index instead of raising it further.
 */
const OVERFLOW_CAP = 500;

export async function fetchAllReviewDocs(): Promise<RawReviewDoc[]> {
  let snapshot;
  try {
    snapshot = await getDb().collection("movies").get();
  } catch (err) {
    throw new ServiceUnavailableError(
      "FIRESTORE_READ_FAILED",
      "Could not read reviews from Firestore"
    );
  }

  if (snapshot.size > OVERFLOW_CAP) {
    throw new ServiceUnavailableError(
      "REVIEWS_OVERFLOW",
      `Collection has ${snapshot.size} docs, exceeding the investigated cap of ${OVERFLOW_CAP}`
    );
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      image: data.image,
      title: data.title,
      comment: data.comment,
      star: data.star,
      created_at: data.created_at,
    };
  });
}

export async function fetchReviewDoc(id: string): Promise<RawReviewDoc | null> {
  let doc;
  try {
    doc = await getDb().collection("movies").doc(id).get();
  } catch (err) {
    throw new ServiceUnavailableError(
      "FIRESTORE_READ_FAILED",
      "Could not read review from Firestore"
    );
  }

  if (!doc.exists) return null;
  const data = doc.data() ?? {};
  return {
    id: doc.id,
    image: data.image,
    title: data.title,
    comment: data.comment,
    star: data.star,
    created_at: data.created_at,
  };
}
