/**
 * Thin typed wrapper over the PixelLab v2 REST API.
 * Uses native fetch — no SDK dependency.
 *
 * Auth: Bearer token from PIXELLAB_API_TOKEN env var.
 * Base URL: https://api.pixellab.ai/v2 (override with PIXELLAB_BASE_URL)
 *
 * Sync endpoints (return the image directly):
 *   POST /create-image-pixen      → createImagePixen()
 *   POST /create-image-pixflux    → createImagePixflux()
 *   POST /create-image-bitforge   → createImageBitforge()
 *   POST /inpaint                 → inpaint()
 *   POST /correct-pixelart        → correctPixelart()
 *   POST /reduce-colors           → reduceColors()
 *   POST /remove-background       → removeBackground()
 *   POST /unzoom                  → unzoom()
 *
 * Async endpoints (return a job id, poll with getJobStatus()):
 *   POST /generate-with-style-v2  → generateWithStyle()
 *   POST /inpaint-v3              → inpaintV3()
 *   POST /edit-image-pixen        → editImagePixen()
 *   POST /image-to-pixelart-pro   → imageToPixelartPro()
 *
 * Jobs:
 *   GET  /background-jobs/{id}    → getJobStatus()
 *   Awaiter:                      → waitForJob()
 *
 * Account:
 *   GET  /balance                 → getBalance()
 */

export interface PixelLabImage {
  type: "base64";
  base64: string;
  format: string;
}

export interface PixelLabImageSize {
  width: number;
  height: number;
}

// ── Sync responses ────────────────────────────────────────────────────────────

export interface SyncImageResponse {
  image: PixelLabImage;
  usage?: { type: string; usd?: number; generations?: number } | null;
}

export interface ReduceColorsResponse {
  images: PixelLabImage[];
  usage?: { type: string; usd?: number } | null;
}

export interface CorrectPixelartResponse {
  images: PixelLabImage[];
  usage?: { type: string; usd?: number } | null;
}

// ── Async (job) responses ─────────────────────────────────────────────────────

export interface AsyncJobResponse {
  background_job_id: string;
  status?: string;
}

export interface JobStatus {
  id: string;
  status: "processing" | "completed" | "failed";
  created_at: string;
  last_response?: Record<string, unknown> | null;
}

// ── Account ───────────────────────────────────────────────────────────────────

export interface Balance {
  credits: { usd: number };
  subscription: {
    status: string;
    plan?: string | null;
    generations: number;
    total: number;
  };
}

// ── Client ────────────────────────────────────────────────────────────────────

export class PixelLabClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(token: string, baseUrl?: string) {
    this.token = token;
    this.baseUrl =
      baseUrl ??
      process.env.PIXELLAB_BASE_URL ??
      "https://api.pixellab.ai/v2";
  }

  static fromEnv(): PixelLabClient {
    const token = process.env.PIXELLAB_API_TOKEN;
    if (!token) {
      throw new Error(
        "PIXELLAB_API_TOKEN is not set. Add it to .env.local:\n  PIXELLAB_API_TOKEN=<your token>"
      );
    }
    return new PixelLabClient(token);
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`PixelLab API error ${res.status} ${method} ${path}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  // ── Account ────────────────────────────────────────────────────────────────

  async getBalance(): Promise<Balance> {
    return this.request<Balance>("GET", "/balance");
  }

  // ── Image generation — sync ────────────────────────────────────────────────

  /** POST /create-image-pixen — default for sprite parts + portraits */
  async createImagePixen(params: {
    description: string;
    image_size: PixelLabImageSize;
    outline?: "single color black outline" | "single color outline" | "selective outline" | "lineless";
    detail?: "low detail" | "medium detail" | "highly detailed";
    view?: "side" | "low top-down" | "high top-down";
    direction?: "north" | "north-east" | "east" | "south-east" | "south" | "south-west" | "west" | "north-west";
    no_background?: boolean;
    background_removal_task?: "remove_simple_background" | "remove_complex_background";
    seed?: number;
    enhance_prompt?: boolean;
  }): Promise<SyncImageResponse> {
    return this.request<SyncImageResponse>("POST", "/create-image-pixen", params);
  }

  /** POST /create-image-pixflux — default for scenes */
  async createImagePixflux(params: {
    description: string;
    image_size: PixelLabImageSize;
    text_guidance_scale?: number;
    outline?: string;
    shading?: string;
    detail?: string;
    view?: string;
    direction?: string;
    no_background?: boolean;
    background_removal_task?: string;
    init_image?: PixelLabImage;
    init_image_strength?: number;
    color_image?: PixelLabImage;
    seed?: number;
  }): Promise<SyncImageResponse> {
    return this.request<SyncImageResponse>("POST", "/create-image-pixflux", params);
  }

  // ── Image generation — async (returns job id) ──────────────────────────────

  /**
   * POST /generate-with-style-v2 — style-locked follow-ups.
   *
   * Each style image must be wrapped as { image, width, height }.
   * The API rejects flat PixelLabImage objects at the top level.
   */
  async generateWithStyle(params: {
    style_images: Array<{ image: PixelLabImage; width: number; height: number }>;
    description: string;
    style_description?: string;
    seed?: number;
    no_background?: boolean;
  }): Promise<AsyncJobResponse> {
    return this.request<AsyncJobResponse>("POST", "/generate-with-style-v2", params);
  }

  /** POST /inpaint-v3 — layer extraction (clothes, hair, face) */
  async inpaintV3(params: {
    description: string;
    inpainting_image: { image: PixelLabImage; size: PixelLabImageSize };
    mask_image: { image: PixelLabImage; size: PixelLabImageSize };
    seed?: number;
    no_background?: boolean;
    crop_to_mask?: boolean;
  }): Promise<AsyncJobResponse> {
    return this.request<AsyncJobResponse>("POST", "/inpaint-v3", params);
  }

  // ── New generation endpoints ───────────────────────────────────────────────

  /**
   * POST /edit-image-pixen (async) — instruction-based edit that preserves
   * pose/composition. Only the requested change is applied; unchanged pixels
   * are kept intact, making pixel-diff hair extraction reliable.
   */
  async editImagePixen(params: {
    image: PixelLabImage;
    description: string;
    width?: number;
    height?: number;
    no_background?: boolean;
    seed?: number;
  }): Promise<AsyncJobResponse> {
    return this.request<AsyncJobResponse>("POST", "/edit-image-pixen", params);
  }

  /**
   * POST /create-image-bitforge (sync) — style-transfer generator that also
   * supports inpainting (mask_image) and transparent background.
   * Max 200×200. Cheaper than inpaint-v3, no Tier-1 requirement.
   */
  async createImageBitforge(params: {
    description: string;
    negative_description?: string;
    image_size: PixelLabImageSize;
    no_background?: boolean;
    style_image?: PixelLabImage;
    init_image?: PixelLabImage;
    init_image_strength?: number;
    inpainting_image?: PixelLabImage;
    mask_image?: PixelLabImage;
    color_image?: PixelLabImage;
    outline?: string;
    detail?: string;
    text_guidance_scale?: number;
    seed?: number;
  }): Promise<SyncImageResponse> {
    return this.request<SyncImageResponse>("POST", "/create-image-bitforge", params);
  }

  /**
   * POST /inpaint (sync, legacy but fully supported) — mask-based inpaint
   * with transparent background. Max 200×200, no Tier-1 requirement.
   * Cheaper than inpaint-v3 and synchronous.
   */
  async inpaint(params: {
    description: string;
    negative_description?: string;
    image_size: PixelLabImageSize;
    inpainting_image: PixelLabImage;
    mask_image: PixelLabImage;
    no_background?: boolean;
    init_image?: PixelLabImage;
    color_image?: PixelLabImage;
    outline?: string;
    detail?: string;
    text_guidance_scale?: number;
    seed?: number;
  }): Promise<SyncImageResponse> {
    return this.request<SyncImageResponse>("POST", "/inpaint", params);
  }

  /** POST /image-to-pixelart-pro — portrait from reference photo */
  async imageToPixelartPro(params: {
    image: PixelLabImage;
    description?: string;
    seed?: number;
  }): Promise<AsyncJobResponse> {
    return this.request<AsyncJobResponse>("POST", "/image-to-pixelart-pro", params);
  }

  // ── Post-processing — sync ─────────────────────────────────────────────────

  /** POST /reduce-colors — snap to shared palette */
  async reduceColors(params: {
    images: PixelLabImage[];
    num_colors?: number;
    palette_image?: PixelLabImage;
    dithering?: "none" | "2x2" | "4x4" | "8x8";
    dithering_strength?: number;
  }): Promise<ReduceColorsResponse> {
    return this.request<ReduceColorsResponse>("POST", "/reduce-colors", params);
  }

  /** POST /correct-pixelart — clean AA / fringe pixels */
  async correctPixelart(params: {
    images: PixelLabImage[];
    strength?: number;
  }): Promise<CorrectPixelartResponse> {
    return this.request<CorrectPixelartResponse>("POST", "/correct-pixelart", params);
  }

  /** POST /remove-background — strip background from a part */
  async removeBackground(params: {
    image: PixelLabImage;
    image_size: PixelLabImageSize;
    background_removal_task?: "remove_simple_background" | "remove_complex_background";
    text?: string;
    seed?: number;
  }): Promise<SyncImageResponse> {
    return this.request<SyncImageResponse>("POST", "/remove-background", params);
  }

  /** POST /unzoom — downscale upscaled reference art before using as style ref */
  async unzoom(params: {
    image: PixelLabImage;
    quantize?: number;
  }): Promise<SyncImageResponse> {
    return this.request<SyncImageResponse>("POST", "/unzoom", params);
  }

  // ── Job polling ────────────────────────────────────────────────────────────

  async getJobStatus(jobId: string): Promise<JobStatus> {
    return this.request<JobStatus>("GET", `/background-jobs/${jobId}`);
  }

  /**
   * Poll until status is "completed" or "failed". Throws on failure.
   * Returns last_response as the generation result object.
   */
  async waitForJob(
    jobId: string,
    options: { intervalMs?: number; timeoutMs?: number } = {}
  ): Promise<Record<string, unknown>> {
    const { intervalMs = 3000, timeoutMs = 300_000 } = options;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const status = await this.getJobStatus(jobId);
      if (status.status === "completed") {
        return status.last_response ?? {};
      }
      if (status.status === "failed") {
        throw new Error(`PixelLab job ${jobId} failed: ${JSON.stringify(status.last_response)}`);
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`PixelLab job ${jobId} timed out after ${timeoutMs}ms`);
  }
}

/** Encode a file buffer / PNG bytes as a PixelLabImage */
export function bufferToPixelLabImage(buf: Buffer): PixelLabImage {
  return {
    type: "base64",
    base64: buf.toString("base64"),
    format: "png",
  };
}

/** Decode a PixelLabImage back to a Buffer */
export function pixelLabImageToBuffer(img: PixelLabImage): Buffer {
  return Buffer.from(img.base64, "base64");
}

function asPixelLabImage(value: unknown): PixelLabImage | undefined {
  if (!value || typeof value !== "object") return undefined;
  const img = value as Record<string, unknown>;
  if (typeof img.base64 === "string" && img.base64.length > 0) {
    return img as unknown as PixelLabImage;
  }
  return undefined;
}

/**
 * Async jobs don't all return `{ image }`. Style-lock returns `{ images: [...] }`
 * (a grid of variants at 64×64). Edit / inpaint usually return `{ image }`.
 */
export function extractJobImage(
  result: Record<string, unknown>,
  jobId: string
): PixelLabImage {
  const direct = asPixelLabImage(result.image);
  if (direct) return direct;

  const images = result.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = asPixelLabImage(images[0]);
    if (first) return first;
    const nested =
      images[0] && typeof images[0] === "object"
        ? asPixelLabImage((images[0] as Record<string, unknown>).image)
        : undefined;
    if (nested) return nested;
  }

  const keys = Object.keys(result);
  throw new Error(
    `job ${jobId} returned no image (keys: ${keys.join(", ") || "none"})`
  );
}
