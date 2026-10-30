---
title: Accessibility Audit Grid
sidebar_position: 11
---

# Accessibility Audit Grid (RGAA 4.1)

The grid of the Flexy theme against the 106 criteria of RGAA 4.1, the French reference built on
WCAG 2.1 level AA. The criterion titles are the official French ones. The statement that goes
with it, the pages audited and the method are on the [Accessibility](./accessibility.md) page.

Audit of 30 October 2026, Flexy `main` at `1.4.x-dev`.

| Status | Meaning | Count |
|---|---|---|
| C | Conforming on every audited page | 23 |
| NC | Not conforming on at least one audited page | 1 |
| NA | Nothing on the audited pages the criterion applies to | 36 |
| NT | Not tested yet: needs a manual check (screen reader, judgement on content) | 46 |

24 of the 70 applicable criteria are decided, 23 of them conforming. This is not an RGAA
conformance rate: that rate is computed once every applicable criterion is decided, and 46 are
still to check by hand.

## 1. Images

| Criterion | Status | Evidence |
|---|---|---|
| **1.1** Chaque image porteuse d’information a-t-elle une alternative textuelle ? | NT | axe `image-alt` passes on 6 pages with images. One SVG on /account/purchase-lists is exposed without a role or a name: to review. |
| **1.2** Chaque image de décoration est-elle correctement ignorée par les technologies d’assistance ? | NT | The theme icons (`ux_icon`) are hidden with `aria-hidden`. No decorative `<img>` found; still to review by hand. |
| **1.3** Pour chaque image porteuse d’information ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ? | NT | The relevance of an alternative needs a human. Product images take the product title. |
| **1.4** Pour chaque image utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative permet-elle d’identifier la nature et la fonction de l’image ? | NA | No CAPTCHA on the audited pages (the ReCaptcha module is out of scope). |
| **1.5** Pour chaque image utilisée comme CAPTCHA, une solution d’accès alternatif au contenu ou à la fonction du CAPTCHA est-elle présente ? | NA | Same as 1.4. |
| **1.6** Chaque image porteuse d’information a-t-elle, si nécessaire, une description détaillée ? | NA | No image on the audited pages needs a detailed description. |
| **1.7** Pour chaque image porteuse d’information ayant une description détaillée, cette description est-elle pertinente ? | NA | Same as 1.6. |
| **1.8** Chaque image texte porteuse d’information, en l’absence d’un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ? | NT | The theme ships no image of text besides the logo (exempt). Merchant images are not covered. |
| **1.9** Chaque légende d’image est-elle, si nécessaire, correctement reliée à l’image correspondante ? | NT | Image captions of editorial content: to review. |

## 2. Cadres

| Criterion | Status | Evidence |
|---|---|---|
| **2.1** Chaque cadre a-t-il un titre de cadre ? | NA | No frame on the audited pages. |
| **2.2** Pour chaque cadre ayant un titre de cadre, ce titre de cadre est-il pertinent ? | NA | Same as 2.1. |

## 3. Couleurs

| Criterion | Status | Evidence |
|---|---|---|
| **3.1** Dans chaque page web, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ? | NT | To review by hand: promotion and stock tags carry text as well as colour. |
| **3.2** Dans chaque page web, le contraste entre la couleur du texte et la couleur de son arrière-plan est-il suffisamment élevé (hors cas particuliers) ? | NT | axe `color-contrast` passes (axe, 15 pages) since the fixes of this audit; axe could not decide on 4 pages where text sits over an image: to review. |
| **3.3** Dans chaque page web, les couleurs utilisées dans les composants d’interface ou les éléments graphiques porteurs d’informations sont-elles suffisamment contrastées (hors cas particuliers) ? | NC | The border of the text fields, selects and search box (`--color-medium`, #ffb698) is 1.69:1 on white, 3:1 required. The focus colour (`--color-focus`) reaches 3.39:1 on white, 3.16:1 on `--color-lightest`. |

## 4. Multimédia

| Criterion | Status | Evidence |
|---|---|---|
| **4.1** Chaque média temporel pré-enregistré a-t-il, si nécessaire, une transcription textuelle ou une audiodescription (hors cas particuliers) ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.2** Pour chaque média temporel pré-enregistré ayant une transcription textuelle ou une audiodescription synchronisée, celles-ci sont-elles pertinentes (hors cas particuliers) ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.3** Chaque média temporel synchronisé pré-enregistré a-t-il, si nécessaire, des sous-titres synchronisés (hors cas particuliers) ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.4** Pour chaque média temporel synchronisé pré-enregistré ayant des sous-titres synchronisés, ces sous-titres sont-ils pertinents ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.5** Chaque média temporel pré-enregistré a-t-il, si nécessaire, une audiodescription synchronisée (hors cas particuliers) ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.6** Pour chaque média temporel pré-enregistré ayant une audiodescription synchronisée, celle-ci est-elle pertinente ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.7** Chaque média temporel est-il clairement identifiable (hors cas particuliers) ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.8** Chaque média non temporel a-t-il, si nécessaire, une alternative (hors cas particuliers) ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.9** Pour chaque média non temporel ayant une alternative, cette alternative est-elle pertinente ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.10** Chaque son déclenché automatiquement est-il contrôlable par l’utilisateur ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.11** La consultation de chaque média temporel est-elle, si nécessaire, contrôlable par le clavier et tout dispositif de pointage ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.12** La consultation de chaque média non temporel est-elle contrôlable par le clavier et tout dispositif de pointage ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |
| **4.13** Chaque média temporel et non temporel est-il compatible avec les technologies d’assistance (hors cas particuliers) ? | NA | No audio or video on the audited pages. The product video player is to audit separately. |

## 5. Tableaux

| Criterion | Status | Evidence |
|---|---|---|
| **5.1** Chaque tableau de données complexe a-t-il un résumé ? | NA | No table on the audited pages. |
| **5.2** Pour chaque tableau de données complexe ayant un résumé, celui-ci est-il pertinent ? | NA | No table on the audited pages. |
| **5.3** Pour chaque tableau de mise en forme, le contenu linéarisé reste-t-il compréhensible ? | NA | No table on the audited pages. |
| **5.4** Pour chaque tableau de données ayant un titre, le titre est-il correctement associé au tableau de données ? | NA | No table on the audited pages. |
| **5.5** Pour chaque tableau de données ayant un titre, celui-ci est-il pertinent ? | NA | No table on the audited pages. |
| **5.6** Pour chaque tableau de données, chaque en-tête de colonne et chaque en-tête de ligne sont-ils correctement déclarés ? | NA | No table on the audited pages. |
| **5.7** Pour chaque tableau de données, la technique appropriée permettant d’associer chaque cellule avec ses en-têtes est-elle utilisée (hors cas particuliers) ? | NA | No table on the audited pages. |
| **5.8** Chaque tableau de mise en forme ne doit pas utiliser d’éléments propres aux  tableaux de données. Cette règle est-elle respectée ? | NA | No table on the audited pages. |

## 6. Liens

| Criterion | Status | Evidence |
|---|---|---|
| **6.1** Chaque lien est-il explicite (hors cas particuliers) ? | NT | Link purpose in context needs a human. |
| **6.2** Dans chaque page web, chaque lien a-t-il un intitulé ? | C | axe `link-name` (axe, 15 pages). Fixed in this audit: the checkout header logo had no name. |

## 7. Scripts

| Criterion | Status | Evidence |
|---|---|---|
| **7.1** Chaque script est-il, si nécessaire, compatible avec les technologies d’assistance ? | NT | Live components, drawers and the cart toast: screen reader pass needed. |
| **7.2** Pour chaque script ayant une alternative, cette alternative est-elle pertinente ? | NA | No script alternative on the audited pages. |
| **7.3** Chaque script est-il contrôlable par le clavier et par tout dispositif de pointage (hors cas particuliers) ? | NT | Every tab stop of 9 pages is reachable and the variant drawer opens with Enter. Other widgets still to try one by one. |
| **7.4** Pour chaque script qui initie un changement de contexte, l’utilisateur est-il averti ou en a-t-il le contrôle ? | NT | To review: selects that reload a listing (sort, currency, language). |
| **7.5** Dans chaque page web, les messages de statut sont-ils correctement restitués par les technologies d’assistance ? | NT | The search result count is in a live region. The add to cart confirmation and the cart updates: to review with a screen reader. |

## 8. Éléments obligatoires

| Criterion | Status | Evidence |
|---|---|---|
| **8.1** Chaque page web est-elle définie par un type de document ? | C | Every audited page starts with a doctype. |
| **8.2** Pour chaque page web, le code source généré est-il valide selon le type de document spécifié ? | NT | The markup was not run through a validator. |
| **8.3** Dans chaque page web, la langue par défaut est-elle présente ? | C | axe `html-has-lang` (axe, 15 pages). |
| **8.4** Pour chaque page web ayant une langue par défaut, le code de langue est-il pertinent ? | C | axe `html-lang-valid` (axe, 15 pages); `lang` follows the shop language. |
| **8.5** Chaque page web a-t-elle un titre de page ? | C | axe `document-title` (axe, 15 pages). |
| **8.6** Pour chaque page web ayant un titre de page, ce titre est-il pertinent ? | C | Titles read on the 15 pages: each names the page (Login, Sign up, Contact, the category, the product, My orders...). |
| **8.7** Dans chaque page web, chaque changement de langue est-il indiqué dans le code source (hors cas particuliers) ? | NT | Language changes inside the content (merchant text) are not covered. |
| **8.8** Dans chaque page web, le code de langue de chaque changement de langue est-il valide et pertinent ? | NT | Same as 8.7. |
| **8.9** Dans chaque page web, les balises ne doivent pas être utilisées uniquement à des fins de présentation. Cette règle est-elle respectée ? | NT | To review by hand. |
| **8.10** Dans chaque page web, les changements du sens de lecture sont-ils signalés ? | C | The reading direction is set by `dir` and checked by `tests/Playwright/specs/rtl.spec.ts`. |

## 9. Structuration de l’information

| Criterion | Status | Evidence |
|---|---|---|
| **9.1** Dans chaque page web, l’information est-elle structurée par l’utilisation appropriée de titres ? | C | Every audited page now has a level 1 heading (checked by the test), and the section titles of the home page, the product page and the content pages are headings. Fixed in this audit: the home page had no heading at all; sign-in, sign-up and contact started at h2; the filled cart had none. |
| **9.2** Dans chaque page web, la structure du document est-elle cohérente (hors cas particuliers) ? | C | Every page has `header`, `main` and `footer` (base.html.twig). axe `bypass` passes. |
| **9.3** Dans chaque page web, chaque liste est-elle correctement structurée ? | C | axe `list` and `listitem` (axe, 15 pages). |
| **9.4** Dans chaque page web, chaque citation est-elle correctement indiquée ? | NA | No quotation on the audited pages. |

## 10. Présentation de l’information

| Criterion | Status | Evidence |
|---|---|---|
| **10.1** Dans le site web, des feuilles de styles sont-elles utilisées pour contrôler la présentation de l’information ? | C | Presentation is in the stylesheets. |
| **10.2** Dans chaque page web, le contenu visible porteur d’information reste-t-il présent lorsque les feuilles de styles sont désactivées ? | NT | Not tried without styles. |
| **10.3** Dans chaque page web, l’information reste-t-elle compréhensible lorsque les feuilles de styles sont désactivées ? | NT | Same as 10.2. |
| **10.4** Dans chaque page web, le texte reste-t-il lisible lorsque la taille des caractères est augmentée jusqu’à 200 %, au moins (hors cas particuliers) ? | NT | Text-only zoom to 200 % not tried; full-page zoom is covered by 10.11. |
| **10.5** Dans chaque page web, les déclarations CSS de couleurs de fond d’élément et de police sont-elles correctement utilisées ? | NT | To review. |
| **10.6** Dans chaque page web, chaque lien dont la nature n’est pas évidente est-il visible par rapport au texte environnant ? | NT | Links inside editorial text: to review. |
| **10.7** Dans chaque page web, pour chaque élément recevant le focus, la prise de focus est-elle visible ? | C | Every tab stop of 9 pages (home, category, product, search, contact, sign-in, sign-up, content, cart) changes look on focus, measured on the computed styles at 1440px. Fixed in this audit: the variant selector of the product page took the focus without showing it. |
| **10.8** Pour chaque page web, les contenus cachés ont-ils vocation à être ignorés par les technologies d’assistance ? | NT | To review: off-canvas drawers are made inert when closed. |
| **10.9** Dans chaque page web, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle respectée ? | NT | To review by hand. |
| **10.10** Dans chaque page web, l’information ne doit pas être donnée par la forme, taille ou position uniquement. Cette règle est-elle implémentée de façon pertinente ? | NT | Same as 10.9. |
| **10.11** Pour chaque page web, les contenus peuvent-ils être présentés sans perte d’information ou de fonctionnalité et sans avoir recours soit à un défilement vertical pour une fenêtre ayant une hauteur de 256 px, soit à un défilement horizontal pour une fenêtre ayant une largeur de 320 px (hors cas particuliers) ? | C | No element sticks out of a 320px viewport on the 10 pages of the sample (test). Fixed in this audit: the account page was 330px wide. |
| **10.12** Dans chaque page web, les propriétés d’espacement du texte peuvent-elles être redéfinies par l’utilisateur sans perte de contenu ou de fonctionnalité (hors cas particuliers) ? | NT | Text spacing override not tried. |
| **10.13** Dans chaque page web, les contenus additionnels apparaissant à la prise de focus ou au survol d’un composant d’interface sont-ils contrôlables par l’utilisateur (hors cas particuliers) ? | NT | The tooltip of the email field shows on hover and focus: dismissing it with Escape is to try. |
| **10.14** Dans chaque page web, les contenus additionnels apparaissant via les styles CSS uniquement peuvent-ils être rendus visibles au clavier et par tout dispositif de pointage ? | NT | To review. |

## 11. Formulaires

| Criterion | Status | Evidence |
|---|---|---|
| **11.1** Chaque champ de formulaire a-t-il une étiquette ? | C | axe `label` and `select-name` (axe, 15 pages). |
| **11.2** Chaque étiquette associée à un champ de formulaire est-elle pertinente (hors cas particuliers) ? | NT | Label relevance needs a human. |
| **11.3** Dans chaque formulaire, chaque étiquette associée à un champ de formulaire ayant la même fonction et répétée plusieurs fois dans une même page ou dans un ensemble de pages est-elle cohérente ? | NT | To review across the address forms. |
| **11.4** Dans chaque formulaire, chaque étiquette de champ et son champ associé sont-ils accolés (hors cas particuliers) ? | C | Labels sit above their field in the Input, Select and TextArea components. |
| **11.5** Dans chaque formulaire, les champs de même nature sont-ils regroupés, si nécessaire ? | NT | To review: address and checkout forms. |
| **11.6** Dans chaque formulaire, chaque regroupement de champs de même nature a-t-il une légende ? | NT | The variant selector is a `fieldset`; its legend and the other groups are to review. |
| **11.7** Dans chaque formulaire, chaque légende associée à un regroupement de champs de même nature est-elle pertinente ? | NT | Same as 11.6. |
| **11.8** Dans chaque formulaire, les items de même nature d’une liste de choix sont-ils regroupés de manière pertinente ? | NT | To review. |
| **11.9** Dans chaque formulaire, l’intitulé de chaque bouton est-il pertinent (hors cas particuliers) ? | NT | Button labels read on the audited pages; a full pass is to do. |
| **11.10** Dans chaque formulaire, le contrôle de saisie est-il utilisé de manière pertinente (hors cas particuliers) ? | NT | Each field in error carries `aria-invalid` and `aria-describedby` pointing to its message, and the focus moves to the error summary. How required fields are announced is to review. |
| **11.11** Dans chaque formulaire, le contrôle de saisie est-il accompagné, si nécessaire, de suggestions facilitant la correction des erreurs de saisie ? | NT | Messages say what is wrong ("This value is not a valid email address."); suggestions to review form by form. |
| **11.12** Pour chaque formulaire qui modifie ou supprime des données, ou qui transmet des réponses à un test ou à un examen, ou dont la validation a des conséquences financières ou juridiques, les données saisies peuvent-elles être modifiées, mises à jour ou récupérées par l’utilisateur ? | NT | Order placement and address deletion: confirmation steps to review. |
| **11.13** La finalité d’un champ de saisie peut-elle être déduite pour faciliter le remplissage automatique des champs avec les données de l’utilisateur ? | C | axe `autocomplete-valid` on the 5 forms of the sample. Fixed in this audit: the contact name field. The address forms are not in the sample. |

## 12. Navigation

| Criterion | Status | Evidence |
|---|---|---|
| **12.1** Chaque ensemble de pages dispose-t-il de deux systèmes de navigation différents, au moins (hors cas particuliers) ? | C | Main menu, search and footer links on every page. |
| **12.2** Dans chaque ensemble de pages, le menu et les barres de navigation sont-ils toujours à la même place (hors cas particuliers) ? | C | Header and footer come from the shared layouts on every page. |
| **12.3** La page « plan du site » est-elle pertinente ? | NA | No site map page; 12.1 is met by the menu and the search. |
| **12.4** Dans chaque ensemble de pages, la page « plan du site » est-elle accessible à partir d’une fonctionnalité identique ? | NA | Same as 12.3. |
| **12.5** Dans chaque ensemble de pages, le moteur de recherche est-il atteignable de manière identique ? | C | The search sits in the header of every page. |
| **12.6** Les zones de regroupement de contenus présentes dans plusieurs pages web (zones d’en-tête, de navigation principale, de contenu principal, de pied de page et de moteur de recherche) peuvent-elles être atteintes ou évitées ? | C | The header, navigation, main content and footer are landmarks. |
| **12.7** Dans chaque page web, un lien d’évitement ou d’accès rapide à la zone de contenu principal est-il présent (hors cas particuliers) ? | C | Added in this audit: the first tab stop of every page is a link to `#main-content`, and activating it moves the focus there (test). |
| **12.8** Dans chaque page web, l’ordre de tabulation est-il cohérent ? | NT | The tab order was walked on 9 pages; whether it follows the reading order is to judge by hand. |
| **12.9** Dans chaque page web, la navigation ne doit pas contenir de piège au clavier. Cette règle est-elle respectée ? | C | Tabbing through each of the 9 pages comes back to its first element: no trap. Open drawers and modals are to try. |
| **12.10** Dans chaque page web, les raccourcis clavier n’utilisant qu’une seule touche (lettre minuscule ou majuscule, ponctuation, chiffre ou symbole) sont-ils contrôlables par l’utilisateur ? | NT | To review. |
| **12.11** Dans chaque page web, les contenus additionnels apparaissant au survol, à la prise de focus ou à l’activation d’un composant d’interface sont-ils si nécessaire atteignables au clavier ? | NT | Header menus and drawers: reachable by keyboard, to review. |

## 13. Consultation

| Criterion | Status | Evidence |
|---|---|---|
| **13.1** Pour chaque page web, l’utilisateur a-t-il le contrôle de chaque limite de temps modifiant le contenu (hors cas particuliers) ? | NT | To review: session expiry during checkout. |
| **13.2** Dans chaque page web, l’ouverture d’une nouvelle fenêtre ne doit pas être déclenchée sans action de l’utilisateur. Cette règle est-elle respectée ? | C | No link of the audited pages opens a new window. A footer link the merchant sets to open one is the merchant's. |
| **13.3** Dans chaque page web, chaque document bureautique en téléchargement possède-t-il, si nécessaire, une version accessible (hors cas particuliers) ? | NA | PDF documents are out of scope. |
| **13.4** Pour chaque document bureautique ayant une version accessible, cette version offre-t-elle la même information ? | NA | Same as 13.3. |
| **13.5** Dans chaque page web, chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) a-t-il une alternative ? | NA | No cryptic content in the theme. |
| **13.6** Dans chaque page web, pour chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) ayant une alternative, cette alternative est-elle pertinente ? | NA | Same as 13.5. |
| **13.7** Dans chaque page web, les changements brusques de luminosité ou les effets de flash sont-ils correctement utilisés ? | NT | To review. |
| **13.8** Dans chaque page web, chaque contenu en mouvement ou clignotant est-il contrôlable par l’utilisateur ? | NT | Carousels: autoplay and pause to review. |
| **13.9** Dans chaque page web, le contenu proposé est-il consultable quelle que soit l’orientation de l’écran (portrait ou paysage) (hors cas particuliers) ? | NT | To review. |
| **13.10** Dans chaque page web, les fonctionnalités utilisables ou disponibles au moyen d’un geste complexe peuvent-elles être également disponibles au moyen d’un geste simple (hors cas particuliers) ? | NT | Product gallery gestures: to review. |
| **13.11** Dans chaque page web, les actions déclenchées au moyen d’un dispositif de pointage sur un point unique de l’écran peuvent-elles faire l’objet d’une annulation (hors cas particuliers) ? | NT | To review. |
| **13.12** Dans chaque page web, les fonctionnalités qui impliquent un mouvement de l’appareil ou vers l’appareil peuvent-elles être satisfaites de manière alternative (hors cas particuliers) ? | NA | No motion-driven feature. |
