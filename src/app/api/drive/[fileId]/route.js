/**
 * /api/drive/[fileId]/route.js
 * Server-side proxy that fetches a Google Drive file using the API key
 * and streams it directly to the browser — bypasses all iframe/CORS/X-Frame-Options blocks.
 */

export async function GET(request, { params }) {
  const { fileId } = await params;

  if (!fileId) {
    return new Response("Missing fileId", { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    return new Response("Drive API key not configured", { status: 500 });
  }

  try {
    // Step 1: Get file metadata to know mimeType and name
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType,size&key=${apiKey}`
    );

    if (!metaRes.ok) {
      const err = await metaRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: err?.error?.message || "File not found or not public" }),
        { status: metaRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const meta = await metaRes.json();
    const mimeType = meta.mimeType || "application/pdf";

    // Step 2: For Google Docs/Slides/Sheets, export as PDF; for native files stream directly
    let downloadUrl;
    if (mimeType.startsWith("application/vnd.google-apps.")) {
      // Export Google Workspace docs as PDF
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf&key=${apiKey}`;
    } else {
      // Download native file (PDF, etc.) directly
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    }

    // Step 3: Stream the file content from Drive to the browser
    const fileRes = await fetch(downloadUrl);

    if (!fileRes.ok) {
      return new Response("Failed to fetch file from Google Drive", {
        status: fileRes.status,
      });
    }

    // Step 4: Forward the response with correct headers for inline PDF display
    const contentType = mimeType.startsWith("application/vnd.google-apps.")
      ? "application/pdf"
      : mimeType;

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `inline; filename="${meta.name || fileId}.pdf"`);
    // Allow browser to cache for 10 minutes to avoid re-fetching large textbooks
    headers.set("Cache-Control", "public, max-age=600");
    // Allow embedding from same origin
    headers.set("X-Frame-Options", "SAMEORIGIN");

    return new Response(fileRes.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Drive proxy error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
