import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const projectId = process.env.FIRESTORE_PROJECT_ID ?? "spartaproject-86d31";

initializeApp({
  credential: applicationDefault(),
  projectId,
});

const db = getFirestore();

type RawDoc = {
  id: string;
  image: unknown;
  title: unknown;
  comment: unknown;
  star: unknown;
  created_at: unknown;
};

function describeType(value: unknown): string {
  if (value === undefined) return "missing";
  if (value === null) return "null";
  if (value instanceof Timestamp) return "Timestamp";
  return typeof value;
}

async function main() {
  const snapshot = await db.collection("movies").get();

  const docs: RawDoc[] = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      image: data.image,
      title: data.title,
      comment: data.comment,
      star: data.star,
      created_at: data.created_at,
    };
  });

  const total = docs.length;

  const missingOrBadCreatedAt = docs.filter(
    (d) => describeType(d.created_at) !== "Timestamp"
  );

  const createdAtTypeCounts = new Map<string, number>();
  for (const d of docs) {
    const t = describeType(d.created_at);
    createdAtTypeCounts.set(t, (createdAtTypeCounts.get(t) ?? 0) + 1);
  }

  const starValueCounts = new Map<string, number>();
  for (const d of docs) {
    const key = `${describeType(d.star)}:${JSON.stringify(d.star)}`;
    starValueCounts.set(key, (starValueCounts.get(key) ?? 0) + 1);
  }

  function lengthStats(field: "image" | "title" | "comment") {
    const lengths = docs
      .map((d) => d[field])
      .filter((v): v is string => typeof v === "string")
      .map((s) => s.length);
    if (lengths.length === 0) return { min: null, max: null, count: 0 };
    return {
      min: Math.min(...lengths),
      max: Math.max(...lengths),
      count: lengths.length,
    };
  }

  const report = {
    projectId,
    totalDocs: total,
    createdAtTypeCounts: Object.fromEntries(createdAtTypeCounts),
    docsWithMissingOrBadCreatedAt: missingOrBadCreatedAt.map((d) => d.id),
    starValueCounts: Object.fromEntries(starValueCounts),
    lengthStats: {
      image: lengthStats("image"),
      title: lengthStats("title"),
      comment: lengthStats("comment"),
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("investigate-movies failed:", err);
    process.exit(1);
  });
