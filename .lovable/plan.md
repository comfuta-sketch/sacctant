# Refino visual MF Advisory — estética de consultoria global

Objetivo: transformar o site em uma peça minimalista, editorial e de alto valor percebido (referência: McKinsey, Bain, relatórios de private equity), mantendo toda a funcionalidade atual (portal do cliente, wizard IRPF, admin, WhatsApp).

## 1. Nova base cromática (dark dominante)

- Fundo principal: Midnight Blue quase preto (#030316) aplicado como tema padrão do site institucional.
- Superfícies secundárias: cinza titânio muito suave para blocos de contraste e cartões.
- Texto: branco puro para títulos, cinza claro acetinado para parágrafos — alto contraste, sem gradientes coloridos.
- Acento metálico (ouro branco/cobre fosco, ~#D4AF37) reservado a: bordas ativas, indicadores, underline de link ativo e hover de CTA principal. Nunca em áreas grandes.
- O verde esmeralda atual sai de cena como cor de destaque.

## 2. Tipografia editorial

- Montserrat para títulos: caixa alta, peso bold, tracking ampliado (0.06–0.14em conforme escala).
- Inter para textos de apoio, com line-height generoso (1.7–1.8).
- Lora (itálico regular) apenas para citações e frases institucionais.
- Escala reforçada: H1 muito maior que o corpo, com salto claro entre H1, H2, olho de seção (eyebrow) e parágrafo.

## 3. Componentes minimalistas

- Cantos retos: raio 0 (máx. 2px) em botões, cartões, inputs, badges e diálogos.
- CTA primário: bloco monocromático sólido; CTA secundário: ghost com borda de 1px que preenche suavemente no hover (com fio metálico).
- Sombras pesadas removidas; profundidade vem de linhas de 1px com opacidade baixa.
- Ícones lineares finos (stroke 1–1.25) e monocromáticos; nada preenchido ou colorido.
- Divisores: grade modernista com linhas de 1px translúcidas (horizontais e verticais entre colunas).

## 4. Ritmo e espaço

- Padding vertical das seções praticamente dobrado; cada seção lida como uma tela independente.
- Container mais estreito para leitura editorial, com colunas assimétricas em blocos institucionais.
- Eyebrow em caixa alta + linha fina acima de cada título de seção.

## 5. Movimento discreto

- Fade-in com deslocamento de poucos pixels ao entrar na viewport (uma vez, sem repetição), com atrasos escalonados.
- Transições de hover em 200–300ms, easing suave; nada pulsante ou infinito.
- Respeito a `prefers-reduced-motion`.

## 6. Marca

- Substituir o placeholder "MF" por uma versão vetorial do monograma enviado (traço fino, monocromático), em versão clara para o header dark e reduzida no rodapé.
- Lockup: monograma + "MF ADVISORY" em Montserrat caixa alta com tracking, e "Inteligência para Decisões" como linha fina em caixa alta.

## Escopo das telas

- Home: hero editorial, aviso de retenção, diferenciais em grade com divisores, bloco institucional, serviços por categoria, checklist IRPF, rodapé.
- /quem-somos, /servicos, /contato: mesmo sistema aplicado.
- Header, footer, diálogos (canais de atendimento, WhatsApp rápido, wizard IRPF), auth/recuperar/redefinir, portal do cliente e admin: herdam tokens, botões, inputs e tipografia novos — sem mudanças de lógica.

## Notas técnicas

- Tokens redefinidos em `src/styles.css` (oklch): `--background`, `--foreground`, `--muted`, `--border`, mais novos tokens `--midnight`, `--titanium`, `--gold`; radius global para 0.125rem; famílias `--font-display` (Montserrat), `--font-sans` (Inter), `--font-serif` (Lora).
- Fontes carregadas por `<link>` no `head` de `src/routes/__root.tsx` (sem `@import` remoto no CSS).
- Utilitários novos via `@utility`: `reveal` (fade-in on scroll), `eyebrow`, `hairline`, `btn-ghost-gold`.
- Componente utilitário `Reveal` com IntersectionObserver para as transições de scroll.
- Ajustes de classes nos componentes `site/*`, rotas institucionais e diálogos; nenhuma alteração em migrations, server functions ou regras de negócio.
