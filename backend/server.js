require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const { z } = require("zod");

// ============ ENV VALIDATION ============
// Fail fast and loudly if required configuration is missing — no silent
// fallback to a default admin PIN or a hardcoded connection string.
const REQUIRED_ENV_VARS = ["MONGO_URL", "DB_NAME", "ADMIN_PIN"];
const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}. ` +
      "Set them (e.g. in backend/.env) before starting the server."
  );
  process.exit(1);
}

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;
const ADMIN_PIN = process.env.ADMIN_PIN;
const PORT = Number(process.env.PORT) || 8001;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============ CORS ============
function resolveCorsOrigins() {
  const raw = process.env.CORS_ORIGINS;
  if (!raw || raw.trim() === "") {
    if (NODE_ENV === "production") {
      console.warn(
        "CORS_ORIGINS is not set in production — defaulting to a restrictive policy (no cross-origin requests allowed). " +
          "Set CORS_ORIGINS to a comma-separated allowlist of origins."
      );
      return [];
    }
    return "*";
  }
  const origins = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (origins.includes("*")) {
    if (NODE_ENV === "production") {
      console.warn('CORS_ORIGINS="*" allows any origin — not recommended in production.');
    }
    return "*";
  }
  return origins;
}

const corsOrigins = resolveCorsOrigins();
const corsOptions = {
  // "*" with credentials: reflect the request origin (mirrors the previous
  // FastAPI/Starlette CORSMiddleware behavior for allow_origins=["*"] with
  // allow_credentials=True, since browsers reject a literal "*" alongside
  // credentialed requests).
  origin: corsOrigins === "*" ? true : corsOrigins,
  credentials: true,
};

// ============ APP SETUP ============
const app = express();
// Site images are base64 data URLs stored directly in request bodies, so the
// JSON body limit needs to comfortably exceed typical image sizes.
app.use(express.json({ limit: "50mb" }));
app.use(cors(corsOptions));

const apiRouter = express.Router();

// ============ HELPERS ============
function utcNowIso() {
  return new Date().toISOString();
}

function genBookingRef() {
  const suffix = crypto.randomInt(0, 100000).toString().padStart(5, "0");
  return `RTC-2026-${suffix}`;
}

function newId() {
  return crypto.randomUUID();
}

function stripMongoId(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}

// Build a partial-update object the same way the original Pydantic-based
// service did: only fields explicitly provided AND non-null are applied.
function buildPartialUpdate(body, allowedKeys) {
  const update = {};
  for (const key of allowedKeys) {
    if (body[key] !== undefined && body[key] !== null) {
      update[key] = body[key];
    }
  }
  return update;
}

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(422).json({ detail: result.error.issues });
    }
    req.validatedBody = result.data;
    next();
  };
}

function requireAdmin(req, res, next) {
  const pin = req.header("X-Admin-Pin");
  if (!pin || pin !== ADMIN_PIN) {
    return res.status(401).json({ detail: "Unauthorized" });
  }
  next();
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// ============ SCHEMAS (mirrors the previous Pydantic models) ============
const BookingCreateSchema = z.object({
  date: z.string(),
  shift: z.enum(["morning", "evening"]),
  vehicle: z.string(),
  zone: z.string().nullish(),
  nationality: z.string().nullish(),
  guests: z.number().int(),
  per_person: z.number().nullish(),
  total: z.number().nullish(),
  addons: z.array(z.string()).default([]),
  full_name: z.string(),
  email: z.string(),
  whatsapp: z.string(),
  age: z.number().int().nullish(),
  id_proof_type: z.string().nullish(),
  id_proof_number: z.string().nullish(),
  emergency_contact_name: z.string().nullish(),
  emergency_contact_number: z.string().nullish(),
  is_tatkal: z.boolean().default(false),
});

const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

const InquiryCreateSchema = z.object({
  type: z.enum(["callback", "contact", "package", "hotel", "tatkal_request", "custom_package"]),
  name: z.string(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  message: z.string().nullish(),
  context: z.record(z.any()).nullish(),
});

const AdminLoginSchema = z.object({
  pin: z.string(),
});

const ReviewCreateSchema = z.object({
  name: z.string(),
  rating: z.number().int().default(5),
  text: z.string(),
  photo: z.string().nullish(),
  source_url: z.string().nullish(),
});

const ReviewUpdateSchema = z.object({
  hidden: z.boolean().nullish(),
});

const HotelCreateSchema = z.object({
  name: z.string(),
  stars: z.number(),
  distance: z.string(),
  description: z.string(),
  amenities: z.array(z.string()).default([]),
  image1: z.string().nullish(),
  image2: z.string().nullish(),
});

const HotelUpdateSchema = z.object({
  name: z.string().nullish(),
  stars: z.number().nullish(),
  distance: z.string().nullish(),
  description: z.string().nullish(),
  amenities: z.array(z.string()).nullish(),
  image1: z.string().nullish(),
  image2: z.string().nullish(),
});

const SiteImagePayloadSchema = z.object({
  data_url: z.string(),
});

// ============ DB ============
const client = new MongoClient(MONGO_URL);
let db;

// ============ ROUTES ============
apiRouter.get("/", (req, res) => {
  res.json({ message: "Ranthambore Safari Curator API", status: "ok" });
});

// ---- Bookings ----
apiRouter.post(
  "/bookings",
  validateBody(BookingCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = req.validatedBody;
    const booking = {
      id: newId(),
      ref: genBookingRef(),
      status: "pending",
      created_at: utcNowIso(),
      ...payload,
    };
    await db.collection("bookings").insertOne(booking);
    res.json(stripMongoId(booking));
  })
);

apiRouter.get(
  "/admin/bookings",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const docs = await db
      .collection("bookings")
      .find({}, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(2000)
      .toArray();
    res.json(docs);
  })
);

apiRouter.patch(
  "/admin/bookings/:ref/status",
  requireAdmin,
  validateBody(StatusUpdateSchema),
  asyncHandler(async (req, res) => {
    const { ref } = req.params;
    const result = await db
      .collection("bookings")
      .updateOne({ ref }, { $set: { status: req.validatedBody.status } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "Booking not found" });
    }
    res.json({ ok: true });
  })
);

// ---- Inquiries ----
apiRouter.post(
  "/inquiries",
  validateBody(InquiryCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = req.validatedBody;
    const inquiry = {
      id: newId(),
      created_at: utcNowIso(),
      ...payload,
    };
    await db.collection("inquiries").insertOne(inquiry);
    res.json(stripMongoId(inquiry));
  })
);

apiRouter.get(
  "/admin/inquiries",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const docs = await db
      .collection("inquiries")
      .find({}, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(2000)
      .toArray();
    res.json(docs);
  })
);

// ---- Admin Auth ----
apiRouter.post(
  "/admin/login",
  validateBody(AdminLoginSchema),
  (req, res) => {
    if (req.validatedBody.pin === ADMIN_PIN) {
      return res.json({ ok: true, token: ADMIN_PIN });
    }
    res.status(401).json({ detail: "Incorrect PIN" });
  }
);

// ---- Admin Stats ----
apiRouter.get(
  "/admin/stats",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const bookings = db.collection("bookings");
    const inquiries = db.collection("inquiries");

    const [totalBookings, pending, confirmed, cancelled] = await Promise.all([
      bookings.countDocuments({}),
      bookings.countDocuments({ status: "pending" }),
      bookings.countDocuments({ status: "confirmed" }),
      bookings.countDocuments({ status: "cancelled" }),
    ]);

    const revAgg = await bookings
      .aggregate([{ $match: { status: "confirmed" } }, { $group: { _id: null, sum: { $sum: "$total" } } }])
      .toArray();
    const revenue = revAgg.length > 0 ? revAgg[0].sum : 0;

    const [contactCount, callbackCount, packageCount] = await Promise.all([
      inquiries.countDocuments({ type: "contact" }),
      inquiries.countDocuments({ type: "callback" }),
      inquiries.countDocuments({ type: { $in: ["package", "custom_package"] } }),
    ]);

    const [recentBookings, recentInquiries] = await Promise.all([
      bookings.find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(5).toArray(),
      inquiries.find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(5).toArray(),
    ]);

    res.json({
      total_bookings: totalBookings,
      pending,
      confirmed,
      cancelled,
      revenue,
      contact_inquiries: contactCount,
      callback_requests: callbackCount,
      package_inquiries: packageCount,
      recent_bookings: recentBookings,
      recent_inquiries: recentInquiries,
      last_updated: utcNowIso(),
    });
  })
);

// ---- Admin Live Feed ----
apiRouter.get(
  "/admin/live-feed",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [bookings, inquiries] = await Promise.all([
      db.collection("bookings").find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(50).toArray(),
      db.collection("inquiries").find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(50).toArray(),
    ]);

    const feed = [];
    for (const b of bookings) {
      feed.push({
        kind: b.is_tatkal ? "tatkal_request" : "new_booking",
        title: b.is_tatkal ? "Tatkal Request" : "New Booking",
        name: b.full_name || "",
        detail: `${b.vehicle || ""} · Zone ${b.zone || ""} · ${b.date || ""}`,
        created_at: b.created_at,
        ref: b.ref,
      });
    }
    const titleMap = {
      callback: "Callback Request",
      contact: "Contact Message",
      package: "Package Inquiry",
      custom_package: "Custom Package Inquiry",
      hotel: "Hotel Inquiry",
    };
    for (const q of inquiries) {
      feed.push({
        kind: q.type,
        title: titleMap[q.type] || (q.type ? q.type.charAt(0).toUpperCase() + q.type.slice(1) : "Inquiry"),
        name: q.name || "",
        detail: q.message || (q.context && q.context.summary) || "",
        created_at: q.created_at,
      });
    }
    feed.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    res.json({ items: feed.slice(0, 50) });
  })
);

// ---- Reviews ----
apiRouter.get(
  "/reviews",
  asyncHandler(async (req, res) => {
    const docs = await db
      .collection("reviews")
      .find({ hidden: { $ne: true } }, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(200)
      .toArray();
    res.json(docs);
  })
);

apiRouter.get(
  "/admin/reviews",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const docs = await db
      .collection("reviews")
      .find({}, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(500)
      .toArray();
    res.json(docs);
  })
);

apiRouter.post(
  "/admin/reviews",
  requireAdmin,
  validateBody(ReviewCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = req.validatedBody;
    const review = {
      id: newId(),
      created_at: utcNowIso(),
      hidden: false,
      ...payload,
    };
    await db.collection("reviews").insertOne(review);
    res.json(stripMongoId(review));
  })
);

apiRouter.patch(
  "/admin/reviews/:id",
  requireAdmin,
  validateBody(ReviewUpdateSchema),
  asyncHandler(async (req, res) => {
    const update = buildPartialUpdate(req.validatedBody, ["hidden"]);
    if (Object.keys(update).length === 0) {
      return res.json({ ok: true });
    }
    const result = await db.collection("reviews").updateOne({ id: req.params.id }, { $set: update });
    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "Review not found" });
    }
    res.json({ ok: true });
  })
);

apiRouter.delete(
  "/admin/reviews/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await db.collection("reviews").deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Review not found" });
    }
    res.json({ ok: true });
  })
);

// ---- Hotels ----
apiRouter.get(
  "/hotels",
  asyncHandler(async (req, res) => {
    const docs = await db
      .collection("hotels")
      .find({}, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(500)
      .toArray();
    res.json(docs);
  })
);

apiRouter.get(
  "/admin/hotels",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const docs = await db
      .collection("hotels")
      .find({}, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(500)
      .toArray();
    res.json(docs);
  })
);

apiRouter.post(
  "/admin/hotels",
  requireAdmin,
  validateBody(HotelCreateSchema),
  asyncHandler(async (req, res) => {
    const payload = req.validatedBody;
    const hotel = {
      id: newId(),
      created_at: utcNowIso(),
      ...payload,
    };
    await db.collection("hotels").insertOne(hotel);
    res.json(stripMongoId(hotel));
  })
);

apiRouter.patch(
  "/admin/hotels/:id",
  requireAdmin,
  validateBody(HotelUpdateSchema),
  asyncHandler(async (req, res) => {
    const update = buildPartialUpdate(req.validatedBody, [
      "name",
      "stars",
      "distance",
      "description",
      "amenities",
      "image1",
      "image2",
    ]);
    if (Object.keys(update).length === 0) {
      return res.json({ ok: true });
    }
    const result = await db.collection("hotels").updateOne({ id: req.params.id }, { $set: update });
    if (result.matchedCount === 0) {
      return res.status(404).json({ detail: "Hotel not found" });
    }
    res.json({ ok: true });
  })
);

apiRouter.delete(
  "/admin/hotels/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await db.collection("hotels").deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: "Hotel not found" });
    }
    res.json({ ok: true });
  })
);

// ---- Site Images (key-value) ----
apiRouter.get(
  "/images",
  asyncHandler(async (req, res) => {
    const docs = await db.collection("site_images").find({}, { projection: { _id: 0 } }).toArray();
    const result = {};
    for (const d of docs) {
      if (d.data_url) result[d.key] = d.data_url;
    }
    res.json(result);
  })
);

apiRouter.put(
  "/admin/images/:key",
  requireAdmin,
  validateBody(SiteImagePayloadSchema),
  asyncHandler(async (req, res) => {
    await db.collection("site_images").updateOne(
      { key: req.params.key },
      { $set: { key: req.params.key, data_url: req.validatedBody.data_url, updated_at: utcNowIso() } },
      { upsert: true }
    );
    res.json({ ok: true });
  })
);

apiRouter.delete(
  "/admin/images/:key",
  requireAdmin,
  asyncHandler(async (req, res) => {
    await db.collection("site_images").deleteOne({ key: req.params.key });
    res.json({ ok: true });
  })
);

app.use("/api", apiRouter);

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ detail: "Internal server error" });
});

// ============ STARTUP ============
async function start() {
  await client.connect();
  db = client.db(DB_NAME);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ranthambore Safari Curator API listening on port ${PORT} (${NODE_ENV})`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await client.close();
  process.exit(0);
});
process.on("SIGINT", async () => {
  await client.close();
  process.exit(0);
});
