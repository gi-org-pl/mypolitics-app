# Quiz Filozoficzny — lokalny starter migracji

**Status:** skrypt automatyzacji i testy adaptera, nie gotowy branch ani potwierdzona migracja realnych danych. W środowisku autora brak DNS dla GitHuba i API, brak Node 24 i Yarn. Nie wykonano konwersji prawdziwego quizu ani testów React/Playwright. Nie wysłano zmian do GitHuba.

## Uruchomienie (Windows PowerShell)

Wymagania: Python 3.10+, Git z dostępem do prywatnego `gi-org-pl/quiz-conversion-bot`, Node.js 24+, Yarn 1.22+, działająca sieć. Uruchom z rozpakowanego folderu, w nowym katalogu roboczym:

```powershell
npm install -g yarn@1.22
python prepare.py --workspace "$HOME\mypolitics-migration"
```

Skrypt klonuje oba repozytoria, pobiera head PR #202 (`7ff0cb526f75f20b07a8a5ab2c2ed7cb6bdfaeed`), tworzy `feat/migration-philosophical`, uruchamia konwerter, pobiera dodatkowe przypisania odpowiedzi tylko odczytowym GraphQL, generuje mock oraz konfigurację modułów. Następnie uruchamia testy adaptera, lint, TypeScript, Vitest, Chromium E2E i osobny smoke quizu, który ma zapisać screenshoty desktop/mobile. Commit tworzy tylko jeśli wszystkie komendy przejdą; nigdy nie wykonuje push. Jeżeli któraś komenda zawiedzie, zachowuje lokalne pliki i kończy z błędem. Nie uruchamiaj ponownie w tym samym katalogu bez sprawdzenia stanu brancha; skrypt nie resetuje zmian.

Opcja `--skip-app-tests` pozwala przygotować dane bez testów front-endowych i bez commita. Jeżeli zespół wskaże `main` jako nową bazę, w świeżym katalogu użyj `--base origin/main`; nie zmieniaj bazy samodzielnie przed uzgodnieniem. Head PR #202 i main mają rozbieżną historię (możliwe squash merges).

## Ręczny podgląd

Z katalogu `mypolitics-app` otwórz dwa terminale:

```powershell
python migration/filozoficzny/mock_api.py
```

```powershell
$env:VITE_API_URL="http://127.0.0.1:8765/api"
$env:VITE_RESULTS_EMAIL_URL=""
$env:VITE_ANSWER_COUNTS_URL=""
yarn dev --host 127.0.0.1
```

Otwórz `http://127.0.0.1:5173/quizzes/filozoficzny`. W trzecim terminalu można uruchomić `node migration/filozoficzny/smoke.mjs` (po instalacji Chromium). Mock działa wyłącznie na loopback; wyniki są przechowywane w pamięci, znikają po zatrzymaniu serwera. Nie wysyła odpowiedzi do prawdziwego API. Użyj nowych kart przeglądarki/wyczyść dane sesji przy powtarzaniu quizu.

## Założenia do weryfikacji

- Konwerter zachowuje surowy eksport `quiz-data-yH_h8rnNix.json`, lecz sam nie eksportuje mapowań odpowiedzi. Rozszerzone zapytanie pobiera je z pól zdefiniowanych w `mypolitics-app-legacy`. Wymagane są prawdziwe ID; dane syntetyczne istnieją wyłącznie w testach adaptera.
- Układ wyników jest generowany z faktycznych orientacji i osi. Jeżeli istnieją niezależne punktowane orientacje, bieguny osi są wykluczane z rankingu. To założenie projektowe, nie potwierdzona zgodność ze starym widokiem.
- Osie zachowują kolejność lewo/prawo. Odpowiedzi skali mapowane według ustawienia gradacji; neutralna ma zero punktów. Punktacja mocka odwzorowuje podstawową arytmetykę nowego front-endu, nie gwarantuje zgodności z historycznym algorytmem. Przy ważeniu kategorii konieczna jest dodatkowa kontrola zgodności.
- Skrypt celowo zatrzymuje się przy nieobsługiwanych cechach, partiach, kompasach, braku mapowań lub nieznanym ID. Nie należy zastępować braków fikcyjnymi przypisaniami.
- UUID mockowanego projektu, survey, odpowiedzi i modułów są deterministyczne, ale nie są identyfikatorami nowego produkcyjnego API. Po migracji backendowej trzeba podstawić uzgodnione ID i zweryfikować konfigurację. Rejestracja projektu jest ograniczona do dokładnego adresu lokalnego mocka, nie aktywuje quizu produkcyjnie.
- Smoke Playwright używa selektorów ze sprawdzonego brancha, ale nie był wykonywany na realnym quizie. Nietypowa sekwencja pytań lub checkpointów może wymagać dostosowania. Zweryfikuj screenshoty przed PR.

## Push i draft PR (po przejściu wszystkich testów oraz weryfikacji)

```powershell
cd "$HOME\mypolitics-migration\mypolitics-app"
git status
git log -1 --oneline
git push -u origin feat/migration-philosophical
```

Uzgodnij aktualną bazę PR. W GitHub wybierz Draft PR. Dołącz rzeczywiste screenshoty `migration/filozoficzny/screenshots/results-desktop.png` i `results-mobile.png`, oryginalny eksport i konfigurację `result-modules.json`. Nie deklaruj testów, które nie przeszły. Formularz wyboru quizu trzeba wypełnić samodzielnie.
