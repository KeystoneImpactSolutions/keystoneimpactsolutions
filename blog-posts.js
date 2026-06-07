// ============================================================
// IMPACT INTEL — Blog post data
// ============================================================
// HOW TO ADD A NEW POST:
//   1. Copy the block starting with { and ending with },
//      and paste it at the TOP of the array (above the current first entry).
//   2. Fill in the six fields.
//   3. Set featured: true on the post you want highlighted at the top;
//      set featured: false on everything else.
//      Only ONE post should have featured: true at any time.
//   4. Save this file. The listing page updates automatically.
//   5. Commit both this file and your new post HTML to GitHub.
//
// FIELDS:
//   slug        — path to the post HTML file from the site root
//                 (e.g. "impact-intel/your-post-slug.html")
//   title       — headline as it appears on the card and in the post
//   category    — display label: "Funding Intelligence", "Grant Strategy",
//                 "Awards & Recognition", "From the Field", "Sector Intelligence"
//   date        — ISO date for sorting, YYYY-MM-DD
//   dateDisplay — human-readable date (e.g. "26 May 2026")
//   readTime    — estimated read time (e.g. "6 min read")
//   excerpt     — 1 to 2 sentence teaser for the card (plain text, no HTML)
//   featured    — true or false. One post only should be true.
// ============================================================

const blogPosts = [
  {
    slug: "impact-intel/funding-when-youre-an-individual-not-an-org.html",
    title: "Funding When You're an Individual, Not an Org",
    category: "Funding Intelligence",
    date: "2026-06-07",
    dateDisplay: "7 June 2026",
    readTime: "7 min read",
    excerpt: "Most formal grant rounds filter out individuals before they start. Expedition grants, fiscal sponsorship, and corporate partnerships for purpose-driven projects that don't fit the standard mould.",
    featured: true
  },
  {
    slug: "impact-intel/when-grants-feel-like-security-arent.html",
    title: "When Grants Feel Like Security but Aren't",
    category: "Funding Intelligence",
    date: "2026-05-25",
    dateDisplay: "25 May 2026",
    readTime: "8 min read",
    excerpt: "Grant funding feels solid. But every dollar arrives with conditions, and when one income stream dominates your funding mix, that sense of solidity is also the weakness. What the sector data actually shows.",
    featured: false
  },
  {
    slug: "impact-intel/the-grant-you-found-the-project-you-have.html",
    title: "The Grant You Found, the Project You Have",
    category: "Grant Strategy",
    date: "2026-06-01",
    dateDisplay: "1 June 2026",
    readTime: "6 min read",
    excerpt: "Most grant applications fail before the writing starts. The sequencing mistake that quietly costs organisations every round, and how to reverse it.",
    featured: false
  }
];
