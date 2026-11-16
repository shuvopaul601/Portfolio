SHUVO PAUL — CYBERSECURITY PORTFOLIO
====================================

FILES
- index.html   portfolio structure and content
- style.css    visual system, responsive layout, animation and interaction styling
- script.js    navigation, interactive terminal, particles, counters, reveals, project filtering
- assets/      profile.webp, certificate PDFs and their preview images

CERTIFICATES (Certifications section)
Each certificate card opens the original PDF in a new tab.
- assets/sql_basic certificate.pdf                        <- HackerRank SQL (Basic)
- assets/SHUVO PAUL_WS_2026_M_69050_Certificate.pdf       <- WsCube Tech Bug Bounty masterclass
- assets/cert-sql-basic.webp, assets/cert-bug-bounty.webp <- preview thumbnails shown on the cards
To add another certificate: copy one <a class="cert-card cert-link"> block in index.html,
upload the PDF + a preview image to assets/, and update href / src / text.
(Spaces in file names must be written as %20 in the href.)

INTERACTIVE TERMINAL
Open it with the "OPEN INTERACTIVE TERMINAL" button. Commands:
help, about, skills, projects, education, certs, contact, whoami, ls, github, email, date,
open <section>, clear, exit.  Up/Down = history, Tab = autocomplete, Esc = close.

RUN LOCALLY
Keep index.html, style.css, script.js and the assets folder together, then open index.html
in a modern browser or use VS Code Live Server.

DEPLOYMENT
Upload everything (including the assets folder) to GitHub Pages, Netlify or any static host.
No build tools required. Google Fonts load from Google; system fallbacks are included.

PERSONALIZE
- Add your LinkedIn URL in the contact section (commented-out link in index.html).
- Add screenshots of the real applications to strengthen the project case studies.
