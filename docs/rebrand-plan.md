# Website rebrand plan

Status: proposed scope based on the client's notes and a read-only review of the current project. No website implementation is included in this document.

Working assumption: continue with the Prime Tacos name and existing logo in the repository. Confirm final brand assets before visual design. The four locations currently configured are Mission Valley, Seaport Village, Encinitas, and Coronado; their business details and menus still need client confirmation.

## 1. Website experience

The website should show the food being made, introduce the people behind it, and make choosing the right restaurant and menu easy. The opening three sections are a firm client requirement; the proposed full sequence is:

**Video → About → Locations → Mini video clips → Instagram images → Footer**

### Homepage

| Section | Proposed content and behavior |
| --- | --- |
| Video hero | Full-width film showing preparation, food, people, and all four storefronts. Keep the logo, a short headline, and Menu / Locations actions readable over the footage. Use a muted loop with a pause control and a still-image fallback. |
| About introduction | A short, client-approved introduction paired with a real team or preparation photo. Explain the food, people, and San Diego connection. Link to the full Our Story page. |
| Locations | Four photo-led cards, each using a current photograph of that specific storefront. Show the location name, address, hours, View Menu, and location details. Keep all four visible even when a visitor has selected a store. |
| Mini video clips | A compact collection of food preparation, customer reactions, reviews, and community moments. Use poster images and tap-to-play clips; provide captions when speech matters. |
| Instagram images | A visible grid of selected Instagram images, each linked to its original post, plus a profile link. Proposed launch approach: a curated gallery that the team can update. Automatic feed syncing is a separate decision with an account/integration dependency. |
| Footer | Keep useful menu, location, contact, and social links easy to find. |

The existing favorites section should move below Locations or have its imagery incorporated into the requested sections. It must not interrupt Video → About → Locations.

### Navigation and logo movement

- Give Menu, Locations, Our Story, and Order Online clear placement. Keep secondary links accessible in the existing navigation/footer.
- Interpret the client's Monkey Bar note as a large opening logo that becomes a compact logo in the upper-left header during scrolling. Prototype both desktop and mobile behavior before implementation.
- Keep menu and location actions available as the visitor scrolls. Respect reduced-motion preferences and keep content stable during the transition.
- Replace the automatic first-visit location prompt with a chooser opened by the visitor. The current source opens the chooser after 300 ms; that would cover the requested video introduction.

### Location-specific menu flow

**Menu → choose a location → that location's menu → available ordering options**

- On the menu entry page, show four clearly labeled location choices. Desktop can use a row of location links styled as tabs; mobile can use a compact chooser.
- Selecting a location should take the visitor directly to its menu. Keep the current location name and a Change Location control visible on the destination.
- Reuse the current `/menu/{slug}/embed` routes and stored location selection. Direct menu links should work without a prior selection.
- A saved location can determine the default menu destination, while the visitor can always switch to any of the four stores.
- Check each location's actual menu items, prices, hours, and ordering links with the client. The existing data is a starting point, not confirmation that every detail is current.

### About page

Refresh the existing `/our-story` page instead of introducing a duplicate About route. Proposed narrative: the people and origin of the business, how the food is prepared, then the restaurants and community. Combine concise copy with preparation, team, and Coronado opening imagery. Use client-approved facts and names; the brief does not establish a detailed founding story.

## 2. Reference direction

Reference roles below come primarily from the client's notes. Public page text was checked where accessible; the specific video treatments and scroll animations were not verified in a browser.

| Reference | Role in the design brief | Verification / next step |
| --- | --- | --- |
| [Fish Guts](https://fishgutscalifornia.com/) | Hero-film inspiration, especially food and preparation. | Official homepage located. Review the exact film visually with the editor before matching its pacing or framing. |
| MYKA | Hero-film inspiration, About page, and Instagram imagery near the bottom. | Exact client URL unresolved. A possible MYKA Greek site was found, but its page could not be accessed through the research tool. Do not assume it is the intended reference. |
| [Los Tacos No. 1](https://www.lostacos1.com/) | Proposed reference for a concise food-and-story presentation. | Official homepage includes a photo gallery, a short origin story, and a menu link. The client has not specified a particular visual detail to adopt. |
| [7th Street Burger](https://7thstreetburger.com/) | Mini clips near the bottom, as described by the client. | Official site located; the specific clip treatment still needs visual review. |
| [Monkey Bar NYC](https://www.nycmonkeybar.com/) | Logo moving into the upper-left corner during scroll, as described by the client. | Candidate official site located; confirm it is the intended Monkey Bar and inspect the animation. |
| Santo Taco | Additional visual inspiration; no specific feature given. | Multiple businesses use the name. [Santo Taco NYC](https://www.eatsantotaco.com/) is a candidate, not a confirmed match. |

Proposed visual direction: prominent food imagery, readable type, short copy, and genuine restaurant activity. Start with the existing brand assets; settle color, typography, and exact motion treatment in the design phase.

## 3. Video production plan

### Deliverables to scope with the editor

- One approximately **25–35-second hero loop**, with desktop and mobile compositions and a poster still. This duration is a proposal, not a client requirement.
- A small collection of lower-page clips, provisionally **6–8 clips**. Use roughly 8–15 seconds for visual moments; allow review excerpts enough time to retain their meaning. Final counts depend on footage quality and coverage.
- Four current storefront photographs, with crops suitable for homepage cards and location-page covers.
- Web-ready exports, original masters, and captions for spoken clips. The hero should work without sound; review audio should start only when the visitor plays it.

### Hero storyboard

Build the first edit around this sequence, adjusting the timing to the strongest available footage:

| Beat | Required shot coverage from the client's notes |
| --- | --- |
| Preparation | Hand-pressing tortillas, making salsa, rolling rolled tacos. |
| Meat and cooking | Meat tumbling; the meat-processing setting with a worker in a white coat and hat or a sticker-covered hard hat; chefs cooking. |
| Assembly and food | Cooks seen through the restaurant window, tacos being assembled, and close-ups of finished food. |
| People and atmosphere | Customers tasting food, Santa Cruz eating, front-of-house staff laughing together, and restaurant décor. |
| Four locations | Recognizable exterior shots of Mission Valley, Seaport Village, Encinitas, and Coronado. |

Use brief excerpts from the community and review footage in the hero when they fit. Give fuller moments space in the mini clips so the hero remains legible. Every requested subject stays in the footage checklist even if its strongest use is elsewhere on the site.

### Existing-footage audit

The client mentions the following sources. Their original files have not been reviewed or confirmed available in this workspace.

| Source | Planned use / action |
| --- | --- |
| Fourth of July content in the Photos album | Find customer tasting reactions and restaurant atmosphere; select hero excerpts and a customer clip. |
| Salsa videos on the account | Use preparation close-ups in the hero and a longer craft clip. |
| Santa Cruz eating the food | Select a recognizable food moment; confirm the person's identity and any on-screen credit. |
| Food-review footage and foodies' review videos | Select short excerpts that preserve the reviewer's meaning, with captions and creator attribution. |
| SD Strike Force eating food | Community clip and possible hero excerpt. |
| Run club footage | Community clip showing the restaurant's connection to the group. |
| Full Coronado grand-opening video | Include the ribbon cutting with the mayor in the selected content, and review the entire recording for additional food, crowd, team, and storefront moments. |
| Luna Dominguez clip | Use a selected excerpt in the mini clips; clarify what additional contribution or collaboration the client has in mind. |
| Any existing kitchen, factory, staff, décor, food, and exterior footage | Audit before scheduling new filming; identify missing shots and unsuitable crops. |

For each source, record its file/link, creator, location, usable timestamps, orientation, audio quality, and confirmed availability for website reuse. Request original footage where possible rather than relying on social downloads.

### Filming and editing sequence

1. Client/team gathers the existing album, account videos, creator files, and full opening recording.
2. Editor reviews the footage and makes a selection reel and missing-shot list.
3. Scope the pickup shoot with **Louie the videographer or the person from DAYGO**, the two options named by the client. Neither contact's availability or involvement is confirmed.
4. Capture missing kitchen, factory, team, décor, finished-food, and four-storefront coverage. Frame important shots for both wide and mobile layouts.
5. Review the hero rough cut and clip selections together with the website layout.
6. Finish the edits, captions, poster frames, and web exports; test crops and loading on mobile before launch.

## 4. Build plan for this repository

The project uses Next.js, React, TypeScript, Tailwind CSS, and npm. Existing routes and location data provide most of the foundation.

| Work package | Existing files / planned additions | Completion condition |
| --- | --- | --- |
| Homepage structure and hero | `src/components/HomeContent.tsx`, `src/components/HeroPhotoCarousel.tsx`, `src/app/globals.css`; a focused video component if needed. | Video, About, Locations appear in that order; hero has a poster fallback and usable controls. |
| Header and store choice | `src/components/SiteHeader.tsx`, `src/components/LocationPicker.tsx`, `src/components/SelectedMenuContent.tsx`. | Visitor opens the chooser intentionally; menu selection reaches the correct location; logo transition works at mobile and desktop sizes. |
| Storefront presentation | `src/components/LocationCard.tsx`, `src/app/locations/page.tsx`, `src/app/locations/[slug]/page.tsx`, `src/data/locations.ts`. | Every store uses its own approved exterior photo; all four are visible on the homepage. |
| Location menus | `src/app/menu/page.tsx`, `src/app/menu/[slug]/embed/page.tsx`, `src/data/menu.ts`. | Four menu destinations and switching behavior match client-confirmed content. |
| About narrative | `src/app/our-story/page.tsx`, `src/data/site-content.ts`. | Approved story, team/preparation imagery, and a clear path to locations/menu. |
| Mini clips and Instagram gallery | Focused media components and a content list added as needed; integrate with `HomeContent.tsx` and the footer layout. | Clips have usable playback/captions; each Instagram image opens the intended post; media below the fold loads on demand. |

Use the current styling system and dependencies for the initial implementation. Build the layout with clearly identified placeholder media while editing proceeds, then replace it with approved exports before launch.

## 5. Delivery sequence

| Phase | Proposed lead | Reviewable output |
| --- | --- | --- |
| 1. Content and scope | Client + designer | Confirmed brand assets, exact reference links, four-store menu sheet, footage inventory, and approved page order. |
| 2. Design | Designer/developer | Desktop and mobile layouts for the homepage, menu selection, About, and a location page; logo-motion prototype. |
| 3. Media production | Editor/videographer + client | Selection reel, pickup-shot list, hero rough cut, mini-clip selection, and four storefront photos. Can run alongside Phase 2. |
| 4. Website implementation | Developer | Working preview using the existing routes, location data, and approved design. |
| 5. Content integration and QA | Developer + client | Final media and copy, all four menu journeys checked, mobile/accessibility/performance review. |

Set dates and budget after the footage audit and design scope are settled. The main scheduling dependency is availability of usable video, especially factory and four-location coverage.

## 6. Inputs still needed

- Final name/logo/brand files; the plan currently follows Prime Tacos as configured in the project.
- Exact MYKA, Monkey Bar, and Santo Taco links; any particular Los Tacos No. 1 detail the client wants adopted.
- Source footage and current storefront photographs; identify which requested shots require new filming.
- Confirmed location menus, prices, hours, and ordering destinations.
- Approved About-page facts; Santa Cruz identification and the intended Luna Dominguez contribution.
- Instagram choice: proposed curated image grid at launch, or automatic updates if the client requires them.

These are dependencies for final design and production, not blockers to preparing this plan.

## 7. Verification

For implementation, use the repository's documented commands:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

Manually check the requested section order; all four visible storefronts; first visit without an unsolicited location drawer; all four menu destinations; changing a saved selection; direct menu links; mobile layout; keyboard navigation; reduced motion; paused/blocked video playback; captions; and Instagram links. Check that hero controls remain usable before the video loads and that lower-page videos do not all download immediately.

For this planning change, verification is limited to source inspection, checking the document against the client's notes, and checking the documentation diff. No website behavior has been implemented or browser-tested as part of this plan.
