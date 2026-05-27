import { google } from "googleapis";

// Google Drive folder mapping
const FOLDERS = {
  physicsNotes: { id: "1fqJwA4WR1FLfeWlLDrWe8wU5cAptS1at", subject: "Physics", label: "Physics Notes" },
  physicsTextbooks: { id: "1xTErYgja2vJtokKVEqq-PPcFLMHhneyM", subject: "Physics", label: "Physics Textbooks" },
  chemistry: { id: "1BbZcRa1MWf3nsJqereZDlOx-ThdPO-0Y", subject: "Chemistry", label: "Chemistry Books" },
  maths: { id: "1Nc8t1vGEGK0XVeHVQKw3yaeCVu1bHcIQ", subject: "Mathematics", label: "Mathematics Textbooks" }
};

// CURATED HIGH-FIDELITY FALLBACK DATASET
const FALLBACK_RESOURCES = [
  // Physics Notes
  {
    id: "mock_phy_notes_1",
    fileId: "1fqJwA4WR1FLfeWlLDrWe8wU5cAptS1at",
    name: "JEE Physics Short Formula Sheets (All Chapters)",
    webViewLink: "https://drive.google.com/file/d/1fqJwA4WR1FLfeWlLDrWe8wU5cAptS1at/preview",
    category: "physicsNotes",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
    subject: "Physics",
    desc: "Formula sheets, key constants, and core chapter-wise equations for JEE Mains & Advanced."
  },
  {
    id: "mock_phy_notes_2",
    fileId: "1fqJwA4WR1FLfeWlLDrWe8wU5cAptS1at",
    name: "Rotational Motion Derivations & Mechanics Guide",
    webViewLink: "https://drive.google.com/file/d/1fqJwA4WR1FLfeWlLDrWe8wU5cAptS1at/preview",
    category: "physicsNotes",
    thumbnail: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80",
    subject: "Physics",
    desc: "Detailed mechanics notes on center of mass, moment of inertia, and angular momentum."
  },
  {
    id: "mock_phy_notes_3",
    fileId: "1fqJwA4WR1FLfeWlLDrWe8wU5cAptS1at",
    name: "Electrostatics & Capacitance Revision Notes",
    webViewLink: "https://drive.google.com/file/d/1fqJwA4WR1FLfeWlLDrWe8wU5cAptS1at/preview",
    category: "physicsNotes",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    subject: "Physics",
    desc: "High-grade exam prep sheets covering electric fields, flux, Gauss's law, and dielectrics."
  },
  // Physics Textbooks
  {
    id: "mock_phy_tb_1",
    fileId: "1xTErYgja2vJtokKVEqq-PPcFLMHhneyM",
    name: "Concepts of Physics - HC Verma Volume 1",
    webViewLink: "https://drive.google.com/file/d/1xTErYgja2vJtokKVEqq-PPcFLMHhneyM/preview",
    category: "physicsTextbooks",
    thumbnail: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    subject: "Physics",
    desc: "Standard reference text for understanding basic physics concepts with standard numericals."
  },
  {
    id: "mock_phy_tb_2",
    fileId: "1xTErYgja2vJtokKVEqq-PPcFLMHhneyM",
    name: "Problems in General Physics - IE Irodov",
    webViewLink: "https://drive.google.com/file/d/1xTErYgja2vJtokKVEqq-PPcFLMHhneyM/preview",
    category: "physicsTextbooks",
    thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
    subject: "Physics",
    desc: "Elite level conceptual problems covering classical mechanics, thermodynamics, and electrodynamics."
  },
  {
    id: "mock_phy_tb_3",
    fileId: "1xTErYgja2vJtokKVEqq-PPcFLMHhneyM",
    name: "Fundamentals of Physics - Halliday, Resnick & Walker",
    webViewLink: "https://drive.google.com/file/d/1xTErYgja2vJtokKVEqq-PPcFLMHhneyM/preview",
    category: "physicsTextbooks",
    thumbnail: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80",
    subject: "Physics",
    desc: "Comprehensive calculus-based concepts detailing optics, wave kinematics, and relativity mechanics."
  },
  // Chemistry Books
  {
    id: "mock_chem_1",
    fileId: "1BbZcRa1MWf3nsJqereZDlOx-ThdPO-0Y",
    name: "Advanced Organic Chemistry - MS Chouhan",
    webViewLink: "https://drive.google.com/file/d/1BbZcRa1MWf3nsJqereZDlOx-ThdPO-0Y/preview",
    category: "chemistry",
    thumbnail: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=600&q=80",
    subject: "Chemistry",
    desc: "Organic chemistry reaction mechanisms, reagents, and multi-step synthesis worksheets."
  },
  {
    id: "mock_chem_2",
    fileId: "1BbZcRa1MWf3nsJqereZDlOx-ThdPO-0Y",
    name: "Physical Chemistry - RC Mukherjee",
    webViewLink: "https://drive.google.com/file/d/1BbZcRa1MWf3nsJqereZDlOx-ThdPO-0Y/preview",
    category: "chemistry",
    thumbnail: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=600&q=80",
    subject: "Chemistry",
    desc: "Stoichiometry, thermodynamics, ionic equilibrium, chemical kinetics numerical problems."
  },
  {
    id: "mock_chem_3",
    fileId: "1BbZcRa1MWf3nsJqereZDlOx-ThdPO-0Y",
    name: "Concise Inorganic Chemistry - JD Lee",
    webViewLink: "https://drive.google.com/file/d/1BbZcRa1MWf3nsJqereZDlOx-ThdPO-0Y/preview",
    category: "chemistry",
    thumbnail: "https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&w=600&q=80",
    subject: "Chemistry",
    desc: "Elite structural molecular symmetry guides covering coordination chemistry, metallurgy and s/p/d blocks."
  },
  // Mathematics Textbooks
  {
    id: "mock_math_1",
    fileId: "1Nc8t1vGEGK0XVeHVQKw3yaeCVu1bHcIQ",
    name: "Cengage Algebra for JEE Advanced",
    webViewLink: "https://drive.google.com/file/d/1Nc8t1vGEGK0XVeHVQKw3yaeCVu1bHcIQ/preview",
    category: "maths",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
    subject: "Mathematics",
    desc: "Comprehensive series for Algebra covering quadratic equations, complex numbers, series, and permutations."
  },
  {
    id: "mock_math_2",
    fileId: "1Nc8t1vGEGK0XVeHVQKw3yaeCVu1bHcIQ",
    name: "Cengage Calculus - Differential & Integral",
    webViewLink: "https://drive.google.com/file/d/1Nc8t1vGEGK0XVeHVQKw3yaeCVu1bHcIQ/preview",
    category: "maths",
    thumbnail: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=600&q=80",
    subject: "Mathematics",
    desc: "Rigorous concepts of limits, continuity, differentiability, integration techniques, and applications."
  },
  {
    id: "mock_math_3",
    fileId: "1Nc8t1vGEGK0XVeHVQKw3yaeCVu1bHcIQ",
    name: "Cengage Coordinate Geometry & Trigonometry",
    webViewLink: "https://drive.google.com/file/d/1Nc8t1vGEGK0XVeHVQKw3yaeCVu1bHcIQ/preview",
    category: "maths",
    thumbnail: "https://images.unsplash.com/photo-1518133680790-3985ecea528e?auto=format&fit=crop&w=600&q=80",
    subject: "Mathematics",
    desc: "Advanced analytic geometric principles covering parabolas, hyperbolas, ellipses, and functions."
  }
];

export async function GET() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

  const hasCredentials = apiKey || (clientEmail && privateKey);

  // Safe fallback if credentials are missing
  if (!hasCredentials) {
    console.warn("No Google Drive API Key or Service Account credentials found. Serving curated fallback resources.");
    return Response.json({ success: true, resources: FALLBACK_RESOURCES, fallback: true });
  }

  try {
    let driveClient;

    // 1. Attempt Service Account JWT Auth if fully configured
    if (clientEmail && privateKey) {
      const auth = new google.auth.JWT(
        clientEmail,
        null,
        privateKey.replace(/\\n/g, "\n"),
        ["https://www.googleapis.com/auth/drive.readonly"]
      );
      driveClient = google.drive({ version: "v3", auth });
    } 
    // 2. Otherwise fallback to standard public API key
    else if (apiKey) {
      driveClient = google.drive({ version: "v3", auth: apiKey });
    }

    const fetchedResources = [];

    // Query each folder ID
    for (const [categoryKey, config] of Object.entries(FOLDERS)) {
      try {
        const res = await driveClient.files.list({
          q: `'${config.id}' in parents and mimeType = 'application/pdf' and trashed = false`,
          fields: "files(id, name, mimeType, thumbnailLink, webViewLink, iconLink)",
          pageSize: 20,
        });

        const files = res.data.files || [];

        files.forEach((file) => {
          fetchedResources.push({
            id: file.id,
            fileId: file.id,
            name: file.name.replace(/\.[^/.]+$/, ""), // Strip file extension
            webViewLink: `https://drive.google.com/file/d/${file.id}/preview`,
            category: categoryKey,
            thumbnail: file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, "=s600") : getUnsplashPlaceholder(config.subject),
            subject: config.subject,
            desc: `Academic ${config.subject} PDF document synchronized dynamically from the cloud archive.`
          });
        });
      } catch (folderError) {
        console.error(`Error fetching folder '${config.label}' content:`, folderError.message);
      }
    }

    // Merge fetched items with mock list if empty to guarantee beautiful UI
    if (fetchedResources.length === 0) {
      console.warn("API fetched zero files. Serving curated mock resources instead.");
      return Response.json({ success: true, resources: FALLBACK_RESOURCES, fallback: true });
    }

    return Response.json({ success: true, resources: fetchedResources, fallback: false });
  } catch (error) {
    console.error("Google Drive API fatal error, falling back to mock dataset:", error.message);
    return Response.json({ success: true, resources: FALLBACK_RESOURCES, fallback: true, error: error.message });
  }
}

// Unsplash placeholder generator mapped to subjects
function getUnsplashPlaceholder(subject) {
  if (subject === "Physics") {
    return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80";
  }
  if (subject === "Chemistry") {
    return "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80";
}
