/**
 * driveResources.js — Google Drive API v3 integration for PhysicsVault.
 * Recursively fetches files from shared Drive folders (handles sub-folders).
 */

// Folder IDs extracted from shared Drive links
export const DRIVE_FOLDERS = {
  physicsNotes: {
    id: "1fqJwA4WR1FLfeWlLDrWe8wU5cAptS1at",
    label: "Physics Notes",
    color: "sky",
    icon: "⚡",
    description: "Chapter-wise physics notes, formula sheets & derivations",
  },
  physicsTextbooks: {
    id: "1xTErYgja2vJtokKVEqq-PPcFLMHhneyM",
    label: "Physics Textbooks",
    color: "orange",
    icon: "📐",
    description: "Premium physics textbooks for JEE & NEET preparation",
  },
  chemistryTextbooks: {
    id: "1BbZcRa1MWf3nsJqereZDlOx-ThdPO-0Y",
    label: "Chemistry Textbooks",
    color: "emerald",
    icon: "🧪",
    description: "Organic, Inorganic & Physical Chemistry resources",
  },
  mathsTextbooks: {
    id: "1Nc8t1vGEGK0XVeHVQKw3yaeCVu1bHcIQ",
    label: "Maths Textbooks",
    color: "violet",
    icon: "📊",
    description: "Algebra, Calculus, Coordinate Geometry & more",
  },
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;

/**
 * Recursively fetches all PDF/Doc files inside a Google Drive folder.
 * If the folder contains sub-folders (e.g. Physics Books → Mechanics, Optics…),
 * it drills into each one and tags each file with its sub-folder name.
 *
 * @param {string} folderId      - The Google Drive folder ID
 * @param {string} categoryLabel - Category label to tag files with (for sub-folder grouping)
 * @param {number} depth         - Current recursion depth (max 3 to avoid infinite loops)
 * @returns {Promise<Array>}
 */
export async function fetchDriveFolder(folderId, categoryLabel = "", depth = 0) {
  if (!API_KEY) {
    console.error("Google Drive API Key is not set in environment variables.");
    return [];
  }
  if (depth > 3) return []; // safety cap

  try {
    const items = await listFolderItems(folderId);

    const subFolders = items.filter(
      (f) => f.mimeType === "application/vnd.google-apps.folder"
    );
    const fileItems = items.filter((f) => isPdfOrDoc(f.mimeType));

    // Map top-level files with current category label
    let result = fileItems.map((f) => mapFile(f, categoryLabel));

    // Recurse into sub-folders in parallel
    if (subFolders.length > 0) {
      const subResults = await Promise.all(
        subFolders.map((folder) =>
          fetchDriveFolder(
            folder.id,
            folder.name, // use sub-folder name as category
            depth + 1
          )
        )
      );
      result = [...result, ...subResults.flat()];
    }

    return result;
  } catch (err) {
    console.error(`Failed to fetch Drive folder ${folderId}:`, err);
    throw err;
  }
}

/** Lists all items (files + sub-folders) directly inside a folder — single level, paginated */
async function listFolderItems(folderId) {
  const fields = "files(id,name,mimeType,size,modifiedTime,webViewLink)";
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const pageSize = 100;
  let allItems = [];
  let pageToken = null;

  do {
    const tokenParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${API_KEY}&fields=nextPageToken,${encodeURIComponent(fields)}&pageSize=${pageSize}&orderBy=name${tokenParam}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    allItems = [...allItems, ...(data.files || [])];
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return allItems;
}

/** Maps a raw Drive API file object to a display-ready resource object */
function mapFile(f, category = "") {
  return {
    id: f.id,
    fileId: f.id,
    title: f.name.replace(/\.(pdf|PDF)$/, ""), // strip .pdf extension for display
    rawName: f.name,
    mimeType: f.mimeType,
    category: category || null,
    link: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
    size: formatBytes(f.size),
    modifiedTime: f.modifiedTime
      ? new Date(f.modifiedTime).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null,
  };
}

/** Returns true if the mime type is a viewable PDF or Google Workspace doc */
function isPdfOrDoc(mimeType) {
  const supported = [
    "application/pdf",
    "application/vnd.google-apps.document",
    "application/vnd.google-apps.presentation",
    "application/vnd.google-apps.spreadsheet",
  ];
  return supported.includes(mimeType);
}

/** Formats bytes into a human-readable file size string */
function formatBytes(bytes) {
  if (!bytes) return null;
  const b = parseInt(bytes, 10);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns a direct download link for any Drive file */
export function getDriveDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
