import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "oriz-api-bot/0.1 (+https://oriz.in/about)";
const UPSTREAM = "https://data.gov.in/files/ogdpv2dms/s3fs-public/all_india_pincode_directory.csv";

const FALLBACK = [
  { officeName: "Mumbai GPO", pincode: "400001", district: "Mumbai", state: "Maharashtra" },
  { officeName: "New Delhi GPO", pincode: "110001", district: "New Delhi", state: "Delhi" },
  { officeName: "Bangalore GPO", pincode: "560001", district: "Bengaluru Urban", state: "Karnataka" },
  { officeName: "Chennai GPO", pincode: "600001", district: "Chennai", state: "Tamil Nadu" },
  { officeName: "Kolkata GPO", pincode: "700001", district: "Kolkata", state: "West Bengal" },
  { officeName: "Hyderabad GPO", pincode: "500001", district: "Hyderabad", state: "Telangana" },
  { officeName: "Pune GPO", pincode: "411001", district: "Pune", state: "Maharashtra" },
  { officeName: "Ahmedabad GPO", pincode: "380001", district: "Ahmedabad", state: "Gujarat" },
  { officeName: "Jaipur GPO", pincode: "302001", district: "Jaipur", state: "Rajasthan" },
  { officeName: "Lucknow GPO", pincode: "226001", district: "Lucknow", state: "Uttar Pradesh" },
  { officeName: "Bhopal GPO", pincode: "462001", district: "Bhopal", state: "Madhya Pradesh" },
  { officeName: "Patna GPO", pincode: "800001", district: "Patna", state: "Bihar" },
  { officeName: "Chandigarh GPO", pincode: "160001", district: "Chandigarh", state: "Chandigarh" },
  { officeName: "Indore GPO", pincode: "452001", district: "Indore", state: "Madhya Pradesh" },
  { officeName: "Nagpur GPO", pincode: "440001", district: "Nagpur", state: "Maharashtra" },
  { officeName: "Surat GPO", pincode: "395001", district: "Surat", state: "Gujarat" },
  { officeName: "Kanpur GPO", pincode: "208001", district: "Kanpur Nagar", state: "Uttar Pradesh" },
  { officeName: "Visakhapatnam GPO", pincode: "530001", district: "Visakhapatnam", state: "Andhra Pradesh" },
  { officeName: "Vadodara GPO", pincode: "390001", district: "Vadodara", state: "Gujarat" },
  { officeName: "Coimbatore GPO", pincode: "641001", district: "Coimbatore", state: "Tamil Nadu" },
];

async function main() {
  let rows = FALLBACK;
  let usedUpstream = false;
  try {
    console.log(`[pincode] fetching ${UPSTREAM}`);
    const r = await fetch(UPSTREAM, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
    if (r.ok) {
      const txt = await r.text();
      const lines = txt.split(/\r?\n/).slice(1).filter(Boolean);
      const parsed = lines
        .map((l) => l.split(","))
        .filter((c) => c.length >= 8)
        .map((c) => ({
          officeName: c[0]?.trim(),
          pincode: c[1]?.trim(),
          district: c[6]?.trim(),
          state: c[7]?.trim(),
        }))
        .filter((row) => /^\d{6}$/.test(row.pincode));
      if (parsed.length > 100) {
        rows = parsed;
        usedUpstream = true;
        console.log(`[pincode] upstream OK, parsed ${parsed.length} rows`);
      } else {
        console.warn(`[pincode] upstream returned only ${parsed.length} valid rows, using fallback`);
      }
    } else {
      console.warn(`[pincode] upstream HTTP ${r.status}, using fallback`);
    }
  } catch (e) {
    console.warn("[pincode] upstream failed, using fallback:", e.message);
  }

  const out = {
    source: "https://data.gov.in/resource/all-india-pincode-directory",
    fetchedAt: new Date().toISOString(),
    upstreamUsed: usedUpstream,
    count: rows.length,
    pincodes: rows,
  };
  const dataDir = join(ROOT, "data");
  await mkdir(dataDir, { recursive: true });
  await writeFile(join(dataDir, "pincodes.json"), JSON.stringify(out, null, 2));
  await writeFile(join(dataDir, "latest.json"), JSON.stringify(out, null, 2));
  console.log(`[pincode] wrote ${rows.length} pincodes (upstream=${usedUpstream})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
