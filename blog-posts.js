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
    slug: "impact-intel/commission-based-grant-writing.html",
    title: "Commission-Based Grant Writing: What Your Organisation Needs to Know",
    category: "Funding Intelligence",
    date: "2026-05-26",
    dateDisplay: "26 May 2026",
    readTime: "7 min read",
    excerpt: "Every major grant writing peak body prohibits commission-based pay. Here is what the international consensus says, why Australian law creates additional risk, and what fair pricing actually looks like.",
    featured: true
  },
  {
    slug: "impact-intel/grant-readiness-before-you-apply.html",
    title: "Is Your Organisation Grant-Ready? Ten Questions to Ask Before You Apply",
    category: "Grant Strategy",
    date: "2026-06-02",
    dateDisplay: "2 June 2026",
    readTime: "5 min read",
    excerpt: "Most grant applications fail before a word is written. This checklist walks you through the ten areas that determine whether your organisation is positioned to win.",
    featured: false
  },
  {
    slug: "impact-intel/reading-grant-guidelines.html",
    title: "How to Read Grant Guidelines Like a Strategist",
    category: "Grant Strategy",
    date: "2026-06-09",
    dateDisplay: "9 June 2026",
    readTime: "6 min read",
    excerpt: "Grant guidelines tell you far more than eligibility requirements. Here is a methodical approach to extracting what funders actually want before you write a single word.",
    featured: false
  }
];
