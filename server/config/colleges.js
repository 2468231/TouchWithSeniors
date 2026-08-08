const COLLEGES = [
  // ── Bangalore (RV Group & Affiliates) ────────────────────
  { name: 'RV College of Engineering', shortName: 'RVCE', emailDomain: 'rvce.edu.in', location: 'Bengaluru', emailHint: 'yourname.cs24@rvce.edu.in' },
  { name: 'RV Institute of Technology & Management', shortName: 'RVITM', emailDomain: 'rvitm.org', location: 'Bengaluru', emailHint: 'yourname@rvitm.org' },
  { name: 'R.V. University', shortName: 'RVU', emailDomain: 'rvu.edu.in', location: 'Bengaluru', emailHint: 'yourname@rvu.edu.in' },

  // ── PES Group ────────────────────────────────────────────
  { name: 'PES University', shortName: 'PESU', emailDomain: 'pes.edu', location: 'Bengaluru', emailHint: 'yourname@pes.edu' },
  { name: 'PES University – EC Campus', shortName: 'PESU-EC', emailDomain: 'pes.edu', location: 'Bengaluru (EC Campus)', emailHint: 'yourname@pes.edu' },

  // ── BMS Group ────────────────────────────────────────────
  { name: 'BMS College of Engineering', shortName: 'BMSCE', emailDomain: 'bmsce.ac.in', location: 'Bengaluru', emailHint: 'yourname@bmsce.ac.in' },
  { name: 'BMS Institute of Technology', shortName: 'BMSIT', emailDomain: 'bmsit.in', location: 'Bengaluru', emailHint: 'yourname@bmsit.in' },

  { name: 'MS Ramaiah Institute of Technology', shortName: 'MSRIT', emailDomain: 'msrit.edu', location: 'Bengaluru', emailHint: 'yourname@msrit.edu' },
  { name: 'Dayananda Sagar College of Engineering', shortName: 'DSCE', emailDomain: 'dsce.edu.in', location: 'Bengaluru', emailHint: 'yourname@dsce.edu.in' },
  { name: 'Bangalore Institute of Technology', shortName: 'BIT', emailDomain: 'bit-bangalore.edu.in', location: 'Bengaluru', emailHint: 'yourname@bit-bangalore.edu.in' },
  { name: 'Sir M. Visvesvaraya Institute of Technology', shortName: 'MVIT', emailDomain: 'mvit.edu.in', location: 'Bengaluru', emailHint: 'yourname@mvit.edu.in' },
  { name: 'New Horizon College of Engineering', shortName: 'NHCE', emailDomain: 'newhorizonindia.edu', location: 'Bengaluru', emailHint: 'yourname@newhorizonindia.edu' },
  { name: 'RNS Institute of Technology', shortName: 'RNSIT', emailDomain: 'rnsit.ac.in', location: 'Bengaluru', emailHint: 'yourname@rnsit.ac.in' },

  { name: 'Nitte Meenakshi Institute of Technology', shortName: 'NMIT', emailDomain: 'nmit.ac.in', location: 'Bengaluru', emailHint: 'yourname@nmit.ac.in' },
  { name: 'CMR Institute of Technology', shortName: 'CMRIT', emailDomain: 'cmrit.ac.in', location: 'Bengaluru', emailHint: 'yourname@cmrit.ac.in' },
  { name: 'SJB Institute of Technology', shortName: 'SJBIT', emailDomain: 'sjbit.edu.in', location: 'Kengeri, Bengaluru', emailHint: 'yourname@sjbit.edu.in' },
  { name: 'Global Academy of Technology', shortName: 'GAT', emailDomain: 'gat.ac.in', location: 'Bengaluru', emailHint: 'yourname@gat.ac.in' },
  { name: 'Jyothy Institute of Technology', shortName: 'JIT', emailDomain: 'jyothyit.ac.in', location: 'Bengaluru', emailHint: 'yourname@jyothyit.ac.in' },
  { name: 'Dr. Ambedkar Institute of Technology', shortName: 'AIT', emailDomain: 'ait.ac.in', location: 'Bengaluru', emailHint: 'yourname@ait.ac.in' },
  { name: 'East West Institute of Technology', shortName: 'EWIT', emailDomain: 'ewit.edu.in', location: 'Bengaluru', emailHint: 'yourname@ewit.edu.in' },
  { name: 'KS School of Engineering and Management', shortName: 'KSSEM', emailDomain: 'kssem.edu.in', location: 'Bengaluru', emailHint: 'yourname@kssem.edu.in' },

  // ── Karnataka (Other Cities) ──────────────────────────────
  { name: 'Siddaganga Institute of Technology', shortName: 'SIT', emailDomain: 'sit.ac.in', location: 'Tumakuru', emailHint: 'yourname@sit.ac.in' },
  { name: 'National Institute of Technology Karnataka', shortName: 'NITK', emailDomain: 'nitk.edu.in', location: 'Surathkal', emailHint: 'yourname@nitk.edu.in' },

  // ── Other States ─────────────────────────────────────────
  { name: 'Manipal Institute of Technology', shortName: 'MIT Manipal', emailDomain: 'learner.manipal.edu', location: 'Manipal', emailHint: 'yourname@learner.manipal.edu' },
  { name: 'VIT University', shortName: 'VIT', emailDomain: 'vit.ac.in', location: 'Vellore', emailHint: 'yourname@vit.ac.in' },
  { name: 'SRM Institute of Science and Technology', shortName: 'SRMIST', emailDomain: 'srmist.edu.in', location: 'Chennai', emailHint: 'yourname@srmist.edu.in' },
  { name: 'Amrita Vishwa Vidyapeetham', shortName: 'Amrita', emailDomain: 'am.amrita.edu', location: 'Coimbatore', emailHint: 'yourname@am.amrita.edu' },
];

function getCollegeFromEmail(email) {
  const lower = (email || '').toLowerCase().trim();
  return COLLEGES.find(c => lower.endsWith('@' + c.emailDomain)) || null;
}

function extractYearFromEmail(email) {
  const lower = (email || '').toLowerCase();
  // Pattern 1: name.branch24@domain  e.g. hemantha.is24@rvce.edu.in
  let m = lower.match(/\.[a-z]+(\d{2})@/);
  if (m) return m[1];
  // Pattern 2: name24@domain
  m = lower.match(/[a-z]+(\d{2})@/);
  if (m) return m[1];
  // Pattern 3: 24csXXX@domain
  m = lower.match(/^(\d{2})[a-z]/);
  if (m) return m[1];
  return null;
}

function yearToPassout(twoDigitYear) {
  const yr = parseInt(twoDigitYear, 10);
  if (isNaN(yr)) return null;
  return (yr + 2000) + 4; // 4-year B.E/B.Tech
}

module.exports = { COLLEGES, getCollegeFromEmail, extractYearFromEmail, yearToPassout };
