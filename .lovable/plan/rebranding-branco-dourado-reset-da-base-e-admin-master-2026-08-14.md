# Rebranding Branco & Dourado + Reset da Base e Admin Master

## Parte 1 — Nova identidade visual (tema claro)

O site inteiro usa tokens semânticos centralizados, então a virada de dark para claro é feita na base do design system e propaga para todas as páginas, portal e admin.

- Fundo principal: Branco Puro `#FFFFFF`.
- Superfícies secundárias (cards, blocos alternados, sidebar, footer): Off-White `#F8F9FA`.
- Tipografia: Cinza Carvão `#1A1A1A` para títulos/texto forte, cinza médio para texto de apoio.
- Acento: Dourado Premium `#D4AF37` (hover/estados ativos em `#C5A059`) em botões primários, ícones, links e underlines de navegação.
- Bordas finas de 1px em cinza claro; cantos retos mantidos (radius 0/2px).
- Sombras difusas e amplas nos cards: `0 10px 30px rgba(0,0,0,0.03)`, como token reutilizável.
- Ícones lineares hiper-finos (stroke 1–1.25) padronizados.
- Revisão de contraste: botões `btn-solid`/`btn-ghost`, badges de status do Kanban, campos de formulário e overlays de diálogos ajustados para o fundo claro.
- Manutenção do monograma e da tipografia Montserrat / Inter / Lora.

## Parte 2 — Reset da base e Admin Master

Situação atual: 5 usuários de teste, 5 registros em clientes e 5 em perfis, com 1 admin e 4 clientes de teste.

Sequência:

1. Limpeza dos dados públicos de teste: remoção dos registros de documentos, contratos, solicitações e mensagens, cadastros de clientes, perfis e papéis. Nenhuma estrutura de tabela é alterada.
2. Limpeza dos usuários de teste da autenticação e criação do usuário Master oficial (`marcosmelo.advisory@gmail.com`, com a senha informada e e-mail já confirmado). Isso é feito por uma rotina administrativa interna executada uma única vez com credencial privilegiada do backend — você não precisa rodar SQL manualmente.
3. Concessão do papel de administrador ao novo usuário. Importante: neste projeto o papel de admin fica em uma tabela dedicada de papéis, não como uma flag na tabela de perfis — esse é o padrão seguro e é o que o site já usa para liberar o backoffice. O gatilho existente já concede admin automaticamente a esse e-mail; a rotina garante o papel de forma explícita.
4. Após a execução, a rotina de setup é removida do projeto para não ficar acessível.

Observação de segurança: a senha informada nesta conversa fica registrada no histórico. Recomendo trocá-la pelo fluxo "Esqueci minha senha" após o primeiro acesso.

## Parte 3 — Login e proteção de rotas

- Tela de login (`/auth`, recuperação e redefinição) restilizada: fundo branco, card off-white com sombra difusa, inputs de borda fina, botão dourado, aviso LGPD discreto.
- O painel administrativo continua restrito: sem sessão vai para o login; com sessão sem papel de admin é redirecionado para a área do cliente. Vou reforçar a verificação para que nada do Kanban, Gestor de Contratos ou Central de Resolução renderize antes da confirmação do papel de admin, e que o acesso direto pela URL seja bloqueado.
- Cabeçalho já reflete a sessão (Painel/Minha Área) e será validado com o novo tema.

## Detalhes técnicos

- `src/styles.css`: remapeamento dos tokens em `:root` (background, foreground, card, muted, border, input, ring, sidebar, chart) para a paleta clara; tokens de marca (`--navy`, `--navy-deep`, `--graphite`, `--soft-gray`, `--emerald` → dourado) reapontados para manter as centenas de usos existentes válidos; novo token `--shadow-card`; ajuste das utilidades `btn-solid`, `btn-ghost`, `eyebrow` e `hairline`.
- Ajustes pontuais onde há valores dependentes de fundo escuro (glows com `blur`, overlays, `backdrop-blur` do header, cores fixas de coluna do Kanban).
- Limpeza de dados públicos via ferramenta de dados (DELETE em ordem de dependência).
- Rotina de reset/seed de autenticação: server function temporária usando o cliente administrativo do backend (`auth.admin.listUsers`, `deleteUser`, `createUser` com `email_confirm: true`) protegida por um token de uso único, chamada uma vez e depois excluída.
- Nenhuma alteração de schema é necessária.

## Resultado

Site inteiro em branco e dourado, base zerada e um único usuário administrador oficial pronto para o seu primeiro acesso em `/auth`.
