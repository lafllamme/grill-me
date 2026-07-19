# Rebranding

Stand: 2026-07-19

Dieses Dokument ist ein offenes Arbeitsdokument fuer die laufende Rebranding- und Design-Recherche.

Es ist bewusst noch kein verbindliches Design-System-Dokument. Ziel ist, Richtungsentscheidungen, Beobachtungen und Design-Hypothesen festzuhalten, bevor daraus spaeter feste Regeln, Tokens und Komponenten-Standards abgeleitet werden.

## Produktkern

`Grillme` ist keine allgemeine Chat-Oberflaeche und kein generischer AI-Assistant.

Der Produktkern ist:

- Ein GitHub-Handle oder Repo wird eingespeist.
- Die Anwendung erzeugt einen Roast plus technisches Feedback.
- Der Fokus der Experience liegt auf Erwartung, Analyse, Reveal und Wirkung des Outputs.

Die zentrale Funktion ist also nicht "Chatten", sondern ein zugespitzter, agentischer Review-Moment.

## Rebranding-Ziel

Die Website soll staerker um die Hauptfunktion gebaut werden, statt aus mehreren halbgekoppelten Showcase-Komponenten zu bestehen.

Die neue Richtung soll:

- minimalistischer
- fokussierter
- klarer in der Hierarchie
- agentischer in der Anmutung
- hochwertiger und bewusster in der Flaechenverwendung

werden.

Wichtig:

- Die Seite soll nicht wie ein Chatbot-Produkt aussehen.
- Die Seite soll nicht wie eine zufaellige Sammlung von Landingpage-Bloecken wirken.
- Die Hero- und Result-Experience sollen als Hauptbuehne lesbar sein.

## Aktuelle Beobachtung

Der aktuelle Stand funktioniert visuell bereits besser als vorher, vor allem durch den neuen animierten Hintergrund.

Das groesste Problem ist im Moment aber nicht mehr nur die Farbpalette, sondern die gesamte `design system language`:

- grosse, voll deckende schwarze Sections schlucken die Bewegung des Hintergrunds
- der visuelle Fokus liegt noch nicht konsequent genug auf dem Roast-/Feedback-Moment
- wichtige Inhalte passieren in Komponenten, die aktuell eher wie einzelne Inseln als wie eine bewusst gefuehrte Gesamtkomposition wirken

Die aktuelle Seite fuehlt sich daher eher wie:

- mehrere brauchbare Komponenten
- plus ein randomes Ausgabeelement
- plus ein gutes Background-Experiment

an, statt wie ein einziges bewusst gebautes Produktbild.

## Vorlaeufige Richtungsentscheidungen

Diese Punkte gelten aktuell als Arbeitsrichtung:

- Die Markenrichtung verschiebt sich von Orange/Kastanienbraun zu Signal Red.
- `#FF0059` ist ein valider Referenzpunkt, aber noch keine finale Markenfarbe.
- Der animierte Prism-Hintergrund bleibt ein zentraler Bestandteil der visuellen Identitaet.
- Das Layout soll so umgebaut werden, dass der Background sichtbar bleiben darf und nicht von grossen opaken Flaechen erstickt wird.
- Die Hauptinteraktion und der Roast-Output sollen die primaere Buehne der Seite werden.
- Sekundaere Inhalte muessen kuenftig die Hauptbuehne staerken, nicht mit ihr konkurrieren.

## Bestaetigter Prototyp-Stand

`/test-2` bildet die aktive Homepage- und Roast-Exploration ab. Der aktuelle Stand bestaetigt folgende Muster fuer die weitere Ausarbeitung:

- Das GitHub-Ziel wird in einer grossen, ruhigen Prompt-Surface erfasst; Roast-Intensitaet und Submit bleiben sekundaere Controls innerhalb derselben Flaeche.
- Nach Submit scrollt die Seite weich in eine eigenstaendige Live-Roast-Buehne.
- Reale SSE-Statusphasen werden als einklappbare Prozesshistorie dargestellt. Die UI erfindet keine verborgene Chain-of-Thought.
- Der aktive Prozess verwendet `RebrandTextShimmer` nach dem AI-Elements-Shimmer-Prinzip: Ein einzelner transparenter Text-Layer kombiniert eine dauerhaft lesbare, gedeckte Basis mit einem separaten animierten Signal-Red-Gradienten.
- Der Shimmer berechnet seine Breite aus der Textlaenge, laeuft linear in zwei Sekunden und bleibt auch zwischen den Highlight-Passes lesbar. Bei `prefers-reduced-motion` wird nur die statische Basisfarbe gerendert.
- Titel, Roast-Zeilen und Feedback werden nach Eingang progressiv wortweise eingeblendet. Die Praesentationsanimation darf den Transport nicht verlangsamen oder Events zurueckhalten.
- Die Live-Surface waechst mit dem eintreffenden Inhalt, statt zwischen separaten Lade- und Ergebnis-Komponenten hart umzuschalten.
- `prefers-reduced-motion` muss die progressive Textanimation ueberspringen und Inhalte direkt vollstaendig anzeigen.

Der Prototyp ist noch kein finaler Produktionsvertrag. Insbesondere Typografie-Rhythmus, Reveal-Geschwindigkeit, Quellenbezug und die Gewichtung der Feedback-Sektion bleiben Stellschrauben.

## Gestalterische Hypothesen

Folgende Annahmen sollen in der Recherche und in spaeteren Explorationsphasen geprueft werden:

- Weniger, aber bewusstere Flaechen werden das Produkt hochwertiger wirken lassen.
- Der Hintergrund gewinnt an Wert, wenn Content als Inseln, Fenster oder getoente Layer darueber liegt statt als Vollflaechen.
- Signal Red kann die Seite erwachsener, schaerfer und weniger generisch machen als die bisherige Ember-Logik, solange Rot als Signal statt als Flaeche eingesetzt wird.
- Die "agentische" Wirkung entsteht eher durch Rhythmus, Reveal, Framing und Fokus als durch klassische Chat-UI-Muster.

## Workflow fuer die naechste Phase

Die naechste Phase startet nicht mit Code, sondern mit visueller Recherche und Strukturarbeit.

Reihenfolge:

1. Inspirationsquellen sammeln.
2. Pro Referenz festhalten, was konkret adaptiert werden soll.
3. Wiederkehrende Muster in Layout, Flaechenlogik, Dichte, Motion und Fokus notieren.
4. Daraus eine neue strukturelle Designrichtung ableiten.
5. Nach der Auswahl von Signal Red jetzt Layout, Komponenten und semantische Produktions-Tokens verfestigen.

## Worauf bei Inspiration zu achten ist

Nicht nur "sieht gut aus", sondern gezielt beobachten:

- Wie viel vom Background bleibt sichtbar?
- Welche Flaechen sind deckend, welche transluzent?
- Wie wird Fokus auf das Hauptelement gelenkt?
- Wie viel Negativraum wird genutzt?
- Ist das Layout blockig, inselartig, editorial oder buehnenhaft?
- Wirkt das Produkt eher wie Tool, Performance, System, Magazin oder Interface?

## Vokabular fuer die Recherche

Hilfreiche Such- und Denkbegriffe fuer die weitere Exploration:

- full-bleed animated background
- content islands
- translucent scrims
- windowed sections
- editorial negative space
- stage-first layout
- reveal-driven interface
- agentic product framing

## Noch offen

Diese Punkte sind noch nicht entschieden:

- finale Produktionsmigration der bestaetigten Signal-Red-Richtung
- welche Rolle das bisherige Terminal-/Output-Element in der finalen Komposition spielt
- wie stark die Landing selbst schon die Result-Experience vorwegnimmt
- welche Sections erhalten bleiben, verschmelzen oder komplett ersetzt werden
- ob Commit- und Datei-Quellen spaeter direkt an einzelne Roast-Zeilen gekoppelt werden
- finale Geschwindigkeiten fuer Shimmer, Statuswechsel und Wort-Reveal
- Verhalten bei sehr langen Titeln, vielen Roast-Zeilen und langsamen Streams

## Status

Dieses Dokument wird in der Recherchephase fortlaufend erweitert.

Die vollstaendige Referenzanalyse ist unter [`design-system/research/`](./design-system/research/README.md) dokumentiert. Die aktuelle Synthese ist [`design-direction.md`](./design-system/research/design-direction.md). `/test-1` bewahrt die erste Studie; `/test-2` ist die aktive Homepage-Komposition, aber noch kein Produktionsvertrag.

Komponentenreferenz fuer den aktiven Prozess-Shimmer: [AI Elements Shimmer](https://elements.ai-sdk.dev/components/shimmer). Die Grillme-Variante uebernimmt Bewegungsmodell und dynamischen Spread, verwendet aber die Signal-Red-Palette statt eines neutralen Theme-Highlights.

Sobald sich die Richtung stabilisiert, muessen daraus spaeter folgen:

- ein verbindliches Farbmodell
- neue semantische Tokens
- Layout- und Surface-Regeln
- klare Regeln fuer Background-Sichtbarkeit
- ueberarbeitete Komponenten- und Landing-Struktur
