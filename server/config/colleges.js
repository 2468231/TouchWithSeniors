const COLLEGES = [
  { name: 'RV College of Engineering', shortName: 'RVCE', emailDomain: 'rvce.edu.in', location: 'Bangalore' },
  { name: 'BMS College of Engineering', shortName: 'BMSCE', emailDomain: 'bmsce.ac.in', location: 'Bangalore' },
  { name: 'PES University', shortName: 'PESU', emailDomain: 'pes.edu', location: 'Bangalore' },
  { name: 'MS Ramaiah Institute of Technology', shortName: 'MSRIT', emailDomain: 'msrit.edu', location: 'Bangalore' },
  { name: 'Dayananda Sagar College of Engineering', shortName: 'DSCE', emailDomain: 'dsce.edu.in', location: 'Bangalore' },
  { name: 'BMS Institute of Technology', shortName: 'BMSIT', emailDomain: 'bmsit.in', location: 'Bangalore' },
  { name: 'Bangalore Institute of Technology', shortName: 'BIT', emailDomain: 'bit-bangalore.edu.in', location: 'Bangalore' },
  { name: 'New Horizon College of Engineering', shortName: 'NHCE', emailDomain: 'newhorizonindia.edu', location: 'Bangalore' },
  { name: 'RNS Institute of Technology', shortName: 'RNSIT', emailDomain: 'rnsit.ac.in', location: 'Bangalore' },
  { name: 'Nitte Meenakshi Institute of Technology', shortName: 'NMIT', emailDomain: 'nmit.ac.in', location: 'Bangalore' },
  { name: 'CMR Institute of Technology', shortName: 'CMRIT', emailDomain: 'cmrit.ac.in', location: 'Bangalore' },
  { name: 'SJB Institute of Technology', shortName: 'SJBIT', emailDomain: 'sjbit.edu.in', location: 'Bangalore' },
  { name: 'Global Academy of Technology', shortName: 'GAT', emailDomain: 'gat.ac.in', location: 'Bangalore' },
  { name: 'Jyothy Institute of Technology', shortName: 'JIT', emailDomain: 'jyothyit.ac.in', location: 'Bangalore' },
  { name: 'Dr. Ambedkar Institute of Technology', shortName: 'AIT', emailDomain: 'ait.ac.in', location: 'Bangalore' },
  { name: 'East West Institute of Technology', shortName: 'EWIT', emailDomain: 'ewit.edu.in', location: 'Bangalore' },
  { name: 'KS School of Engineering and Management', shortName: 'KSSEM', emailDomain: 'kssem.edu.in', location: 'Bangalore' },
  { name: 'Manipal Institute of Technology', shortName: 'MIT Manipal', emailDomain: 'learner.manipal.edu', location: 'Manipal' },
  { name: 'National Institute of Technology Karnataka', shortName: 'NITK', emailDomain: 'nitk.edu.in', location: 'Surathkal' },
  { name: 'VIT University', shortName: 'VIT', emailDomain: 'vit.ac.in', location: 'Vellore' },
  { name: 'SRM Institute of Science and Technology', shortName: 'SRMIST', emailDomain: 'srmist.edu.in', location: 'Chennai' },
  { name: 'Amrita Vishwa Vidyapeetham', shortName: 'Amrita', emailDomain: 'am.amrita.edu', location: 'Coimbatore' },
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
