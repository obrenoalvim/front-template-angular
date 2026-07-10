[English](README.md) | Português

# front-template-angular

Template base clone-and-go pra novos projetos frontend: Angular (componentes standalone, Signals, zoneless), SSR, Tailwind CSS v4, um kit de UI copy-in, i18n, dark mode, auth client-side contra uma API REST, e Docker — tudo pré-conectado e testado ponta a ponta, incluindo uma integração real, verificada ao vivo contra o [back-template-nest](https://github.com/obrenoalvim/back-template-nest). Clona, aponta `API_BASE_URL` pro teu backend, começa construindo tua primeira feature em vez da tua quinta integração de auth.

## Stack

- Angular (componentes standalone, change detection zoneless, TypeScript strict)
- Angular SSR (`@angular/ssr`) num servidor Node/Express — meta tags reais por rota, não uma SPA só client-side
- Tailwind CSS v4 (plugin PostCSS, `@custom-variant dark`)
- Angular CDK — `Dialog` (diálogos de confirmação) e `Table` (o exemplo de notes, ordenável)
- Um kit de UI copy-in em `src/app/shared/ui/` (Button, TextField, Card, Dialog, Toast) — teu pra editar, não um pacote caixa-preta
- ngx-translate — `en` (padrão) + `pt`, trocável em runtime, rotas prefixadas por locale (`/en/...`, `/pt/...`)
- Um `ToastService` custom baseado em Signals (não `ngx-toastr` — ver Notas de design)
- Zod — valida as env vars obrigatórias no startup (`src/env.schema.ts`) e sustenta todo schema de Reactive Forms via `zodValidator()`
- `src/app/core/api/api-client.ts` — um `ApiClient` só encapsulando `HttpClient`, um shape `ApiError` só, sem chamada HTTP crua em componente
- Angular `rxResource()` — estado de cache/loading/retry pro exemplo de notes, sem subscribe+setState manual
- Jest (`jest-preset-angular`, zoneless) + Playwright (fluxo de auth, troca de locale, CRUD de notes)
- ESLint (flat config `angular-eslint`) + Prettier (`prettier-plugin-tailwindcss`) + Husky/lint-staged
- Docker + docker-compose — multi-stage, non-root, com healthcheck
- CI GitHub Actions (build+lint+test, build de imagem Docker, e2e completo) + Dependabot

## Estrutura do projeto

- `src/app/core` — services transversais: `ApiClient`/`ApiError`, `AuthService`/`AuthStorage`/`authGuard`/`authInterceptor`, `ThemeService`, `LocaleService`/`LocaleNavService`/`LocaleLink`/`localeGuard`, `ToastService`, `SeoService`, `zodValidator` + schemas.
- `src/app/shared` — o kit de UI copy-in (`ui/`) e o shell da app (`Header`, `Footer`, `LocaleSwitcher`, `ThemeToggle`).
- `src/app/features` — páginas roteadas: `home`, `auth/{login,register,forgot-password,reset-password}`, `dashboard`, `account`, `notes`.
- `scripts/` — `generate-env.mjs` (escreve `src/environments/environment.ts` a partir das env vars validadas antes de dev/build) e `generate-sitemap.mjs` (escreve `sitemap.xml`/`robots.txt` depois do build).

## Começando

```bash
cp .env.example .env
# edita o .env: aponta API_BASE_URL pro teu backend (inclui o prefixo global
# do próprio backend se ele tiver um, ex: http://127.0.0.1:3000/api), SITE_URL
# pra onde você vai deployar isso
npm install
npm run dev
```

App: <http://localhost:4200>.

## Começando (Docker)

```bash
cp .env.example .env
npm run docker:up
```

App: <http://localhost:4000>. **Acessa no host exato definido em `SITE_URL`** (`localhost:4000` por padrão) — vê a armadilha do allowlist de Host do SSR abaixo se você ver uma página crua sem estilo em vez da app real. `npm run docker:down` pra parar.

## Variáveis de ambiente

Ver `.env.example` pra lista completa e comentada.

| Variável       | Obrigatória | Propósito                                                                                                                        |
| -------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `API_BASE_URL` | sim         | URL base da API REST do backend que esse frontend chama                                                                          |
| `SITE_URL`     | sim         | URL pública desse site — canonical tags, meta OG/Twitter, sitemap/robots, **e o allowlist de Host do SSR (ver Notas de design)** |
| `PORT`         | não         | Porta que o servidor Node do SSR escuta; padrão `4000`                                                                           |

`src/env.schema.ts` valida essas com Zod; `scripts/generate-env.mjs` roda antes de todo `dev`/`build` e falha rápido com mensagem legível se `API_BASE_URL`/`SITE_URL` estiverem ausentes ou não forem URLs válidas. `src/server.ts` valida o mesmo schema de novo no startup do processo (cobre o caso de `environment.ts` ter sido gerado uma vez e o servidor ser subido depois com env vars diferentes, ex: no Docker).

## Auth

Só client-side, contra qualquer API REST que você apontar `API_BASE_URL`. `AuthService` (`src/app/core/auth/auth.service.ts`) espera — verificado ao vivo contra o [back-template-nest](https://github.com/obrenoalvim/back-template-nest) real, não só suposto:

- `POST /auth/register` → `{ id, email }` — **sem token, sem auto-login.** O backend de referência desse template trata verificação de email como um passo separado, então registrar manda o usuário pro `/login`, não pro `/dashboard`. Não tem campo `name` em lugar nenhum — o model de User contra o qual isso foi construído não tem um.
- `POST /auth/login` → `{ accessToken }` **só** — sem objeto de usuário. `AuthService` decodifica o payload do JWT client-side (`sub`/`email`) pra popular `currentUser`; isso é só pra exibição, não uma fronteira de confiança — autorização de verdade continua sendo aplicada server-side em toda chamada de API via o próprio token.
- `POST /auth/forgot-password`, `POST /auth/reset-password`
- `PATCH /account/password` (trocar senha), `DELETE /account` (exige a **senha atual** no body — coletada via campo de formulário na página de Account, já que `ConfirmDialog` só retorna sim/não, não input de texto)

Páginas: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`. `src/app/core/auth/auth.guard.ts` é o **único** guard protegendo `/dashboard`, `/account`, `/notes` — aplicado uma vez numa rota pai, não por página. Feedback via toast em toda ação de auth passa pelo `ToastService`.

Se você apontar isso pra um backend com contrato diferente (um campo `name`, uma resposta de login combinada, etc.), o único arquivo pra mudar é `auth.service.ts` — nada mais referencia os shapes exatos do backend diretamente.

## i18n

Traduções vivem em `public/assets/i18n/en.json` / `pt.json`. Rotas são prefixadas por locale (`/en/login`, `/pt/login`) — `src/app/core/i18n/locale.guard.ts` valida o segmento `:lang`, sincroniza no `LocaleService`, e redireciona locales não-suportados pra `/en`. Sempre linka com a diretiva `appLocaleLink` (`src/app/core/i18n/locale-link.ts`) ou navega com `LocaleNavService.navigate()`/`.path()` — nunca `routerLink`/`Router.navigate` cru, ou o prefixo de locale se perde. Mensagens de validação de formulário são chaves de i18n retornadas pelos schemas Zod (`src/app/core/validators/schemas/auth.schemas.ts`) e renderizadas pelo pipe `translate`, então elas também são traduzidas, não só labels.

## Theming

`src/app/core/theme/theme.service.ts` é um signal (`light`/`dark`), semeado do `localStorage` e depois do `prefers-color-scheme`, trocado no header. A variante dark do Tailwind é conectada via `@custom-variant dark (&:where(.dark, .dark *));` em `src/styles.css` — o service troca a classe `.dark` no `<html>`.

## Busca de dados

Toda chamada de backend passa pelo `ApiClient` (`src/app/core/api/api-client.ts`) — `get`/`post`/`patch`/`delete`, todos retornando `Observable<T>` e normalizando falhas num shape `ApiError { status, message, body }` único. Ele reconhece tanto um body de erro flat `{ message }` quanto o shape próprio aninhado `{ error: { message } }` do back-template-nest (o formato do `AllExceptionsFilter` dele), voltando pro caso genérico graciosamente em ambos os casos. O exemplo de notes (`src/app/features/notes/notes.ts`) envolve `NotesService.list()` num `rxResource({ stream: ... })` pra estado de cache/loading/retry em vez de subscribe+setState manual; `notesResource.value()`, `.isLoading()`, e `.reload()` guiam o template direto.

## Recurso CRUD de exemplo

`/notes` é uma referência completa: `note.model.ts` → `notes.service.ts` (wrapper fino do `ApiClient`) → `notes.ts` (CDK Table, ordenação client-side, criar/deletar via `rxResource`). Copia esse formato pra tua primeira feature de verdade, depois apaga `/notes` (e as entradas de rota/nav) quando não precisar mais da referência.

## SEO

`src/app/core/seo/seo.service.ts` envolve `Title`/`Meta` pra setar tags OpenGraph/Twitter e um `<link>` canonical por rota, derivado de `SITE_URL` mais o path locale-aware da página. Páginas chamam via `translate.get([...]).subscribe(...)`, não `translate.instant()` — ver Notas de design pra entender por que essa distinção importa sob SSR. `scripts/generate-sitemap.mjs` escreve `sitemap.xml`/`robots.txt` depois de todo build — adiciona novas rotas públicas no array `routes` dele (rotas protegidas são deliberadamente excluídas). `public/llms.txt` dá pra agentes de IA/ferramentas de IDE um resumo estruturado curto do projeto.

## Testes

- **Unit** (`npm test`): Jest + `jest-preset-angular` (setup zoneless). Todo service, guard, e interceptor do core tem um spec de verdade; `src/app/shared/ui/button/button.spec.ts` e `text-field.spec.ts` cobrem o kit de UI.
- **E2E** (`npm run test:e2e`): Playwright — `e2e/auth.spec.ts` (register → login-não-dashboard, login → dashboard → logout, toast de login inválido, redirect de guard), `e2e/i18n.spec.ts` (troca de locale, redirect de locale não-suportado), `e2e/notes.spec.ts` (criar/deletar). A suite e2e desse template mocka respostas de `API_BASE_URL` via `page.route()` do Playwright pra rodar standalone sem um backend real — troca por um de verdade (ou aponta pro back-template-nest real) quando quiser.
- `playwright.config.ts` reusa um servidor de dev já rodando localmente (`reuseExistingServer`, forçado a `--host 127.0.0.1` — ver Notas de design) ou builda+sobe o servidor SSR ele mesmo no CI (`workers: 2`, batendo com as restrições de recurso de um runner de CI).

## CI/CD

`.github/workflows/ci.yml` roda três jobs em todo push/PR pra `master`: **build** (lint, format check, testes unit, `ng build` com env vars placeholder), **docker** (builda a imagem de produção, sem push, pra pegar quebra de Dockerfile cedo), **e2e** (instala browsers do Playwright, builda+sobe a app, roda a suite completa). `.github/dependabot.yml` checa `npm` e GitHub Actions semanalmente.

## Docker

`Dockerfile` é multi-stage (`deps` → `build` → `runtime`), roda como usuário non-root, e serve o servidor Node do Angular SSR de verdade (não arquivos estáticos atrás de nginx) pra tanto SSR quanto `/api/health` funcionarem idêntico a um deploy sem Docker. `docker-compose.yml` faz healthcheck em `/api/health` via `wget` contra `127.0.0.1`. **O container tem que ser acessado no host exato nomeado em `SITE_URL`** — ver a próxima seção, essa é a armadilha que realmente vai te pegar.

## Usando como template

1. Renomeia o projeto em `package.json`, `angular.json`, e esse README.
2. `cp .env.example .env`, aponta `API_BASE_URL` pro teu backend real.
3. `npm install && npm run dev`.
4. Apaga `/notes` (página + service + model + rota + links de nav) depois de copiar o padrão pra tua primeira feature de verdade.
5. Adiciona/remove locales em `SUPPORTED_LOCALES` de `src/app/core/i18n/locale.service.ts` e cria um `public/assets/i18n/<code>.json` correspondente.

## Notas de design e armadilhas

- **O allowlist de Host do SSR do Angular 21 rejeita qualquer request cujo header Host não bate com o hostname de `SITE_URL` — silenciosamente, no começo.** Isso é uma feature real de prevenção de SSRF, não um bug desse template, mas vai te pegar: sem configurar, toda request via Docker (ou qualquer deploy real) é rebaixada silenciosamente pra renderização só-client (um warning no console, não um erro) assim que o header Host real não bater. `src/server.ts` deriva `allowedHosts` do hostname de `SITE_URL` e passa isso pro `AngularNodeAppEngine`, o que transforma o descompasso num **400 duro** em vez de um rebaixamento silencioso — então se você ver um 400 (ou, antes desse fix, um shell cru sem estilo `<title>FrontTemplateAngular</title>` em vez da app real), a URL do navegador que você tá usando não bate exatamente com o host de `SITE_URL`. `localhost` e `127.0.0.1` são dois hostnames _diferentes_ pra esse check.
- **O servidor de dev do `ng serve` bind só em `::1` (loopback IPv6), não em `127.0.0.1`.** Conectar via `127.0.0.1:4200` então falha com ECONNREFUSED mesmo com o servidor genuinamente de pé. `playwright.config.ts` força `ng serve --host 127.0.0.1` pras rodadas e2e locais pra que o `baseURL` `127.0.0.1` dele alcance de verdade; o job e2e do CI usa o servidor SSR buildado em vez disso, que não tem esse problema.
- **SSR não tem acesso a `localStorage` — o guard precisa de um cookie também, não só o signal client-side.** `authGuard` originalmente só checava `AuthService.isAuthenticated()` (baseado em `localStorage`), que é sempre `false` server-side. Isso significava que um usuário _de verdade_ logado acessando uma rota protegida via navegação nova (um deep link, ou só dando refresh na página) era renderizado server-side como deslogado e redirecionado erroneamente pro `/login`. Corrigido com um cookie marcador leve, não-`HttpOnly`, `has_session` (nunca o JWT em si) setado/limpo junto com o `localStorage` em `AuthStorage`; `authGuard` lê ele via o token de injeção `REQUEST` do Angular quando rodando server-side, e cai pro signal real no navegador.
- **`translate.instant()` no construtor de um componente retorna a chave crua de i18n durante SSR, não o texto traduzido.** O `en.json`/`pt.json` carregado via HTTP ainda não resolveu quando o SSR constrói a página, então `instant()` retorna silenciosamente `"home.title"` em vez de texto de verdade — e qualquer coisa que capturou esse valor uma vez (como `SeoService.update()`) continua mostrando a coisa errada pra sempre, não só no primeiro paint. `Home`/`NotFound` usam `translate.get([...]).subscribe(...)` em vez disso, que espera a tradução de verdade. O _pipe_ `| translate` usado direto em templates não tem esse problema — é reativo e atualiza quando as traduções carregam — isso só morde chamadas `.instant()` explícitas feitas uma vez, eager, em código.
- **A opção do `rxResource()` é `stream`, não `loader`, nessa versão do Angular.** Vale mencionar porque uma quantidade razoável de código de exemplo da era Angular v20 (e o próprio rascunho de plano original desse template) ainda mostra `loader` — isso é de uma iteração de API anterior e falha ao compilar aqui (`TS2769`).
- **`API_BASE_URL` é assado no bundle do cliente em build time — uma entrada `environment:` do docker-compose em runtime não consegue mudar depois que a imagem existe.** Diferente de `SITE_URL` (lido fresco pelo `server.ts` no startup do processo) ou `PORT`, o navegador que faz as chamadas de API de verdade, não o container, então `API_BASE_URL` tem que estar correto quando `ng build` roda. `Dockerfile` recebe isso como um `ARG` de build; `docker-compose.yml` passa tanto `API_BASE_URL` quanto `SITE_URL` como build args, deliberadamente lendo de `DOCKER_API_BASE_URL`/`DOCKER_SITE_URL` em vez das variáveis de mesmo nome — o Compose auto-carrega o `.env` desse próprio projeto (escrito pro `npm run dev`, apontando pra `:4200`) pra substituição `${...}`, e reusar `SITE_URL` direto ali assaria silenciosamente o host errado em todo `docker compose up --build`, disparando na hora a armadilha do allowlist de Host acima.
- **Biblioteca de toast: custom, não `ngx-toastr`.** `ngx-toastr` assume change detection dirigida por zone.js pros timers de animação dele e vem com o próprio CSS pra sobrescrever; essa app é zoneless e estilizada com Tailwind, então um `ToastService` de ~40 linhas (Signals, auto-dismiss via `setTimeout`) coube melhor sem dependência de runtime extra.
- **A construção da URL de destino do `LocaleSwitcher` tem que evitar uma barra final espúria.** Construindo a URL do novo locale como `` `/${next}${rest}` `` onde `rest` é o path _depois_ do segmento de locale atual: na home page `rest` é `''`, e um fallback ingênuo `|| '/'` ali produz `/pt/` (barra final) em vez de `/pt` — que o router parseia como um segmento de path _extra_ vazio e falha ao dar match contra `{ path: '' }`, caindo no catch-all `NotFound`. Não adiciona esse fallback de volta.
- **`Test.createTestingModule`/CDK `Dialog` marca o resto da página como inerte enquanto um modal tá aberto** — o próprio botão de ação de uma linha de tabela (ex: o "Delete" por-linha das notes) sai da árvore de acessibilidade assim que um `ConfirmDialog` abre por cima. Não usa `.last()` pra desambiguar dois botões de mesmo nome num teste e2e esperando que ambos ainda sejam alcançáveis — uma vez que o dialog tá aberto, tem exatamente um.
- **`api-client.ts` é deliberadamente burro.** Só conhece `HttpClient` + `ApiError` — sem logging, sem lógica de header de auth (isso é trabalho do `authInterceptor`). Mantém assim pra continuar trivialmente testável com `HttpClientTestingModule`.
- **A divisão `dist/front-template-angular/{browser,server}` do `ng build` é estrutural.** `scripts/generate-sitemap.mjs` escreve em `.../browser` (o output estático/público), e o `CMD` do `Dockerfile` aponta pra `.../server/server.mjs`. Se o projeto for renomeado algum dia, atualiza os dois.
