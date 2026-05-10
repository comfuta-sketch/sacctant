
## O que vai mudar

Hoje o cliente cadastra-se só com CPF + senha e o e-mail real só aparece depois, no formulário de IRPF. Vamos mover o e-mail para o cadastro e adicionar verificação por código, melhorar a UX da senha e criar um fluxo de recuperação seguro.

## 1. Cadastro de Cliente (aba Cliente em `/auth`)

Novos campos no formulário **Cadastro**:
- Nome completo (já existe)
- CPF (já existe)
- **E-mail real** (novo, obrigatório, validado com Zod)
- **Senha** com botão de olho 👁 para mostrar/ocultar
- **Confirmar senha** com botão de olho — precisa bater com a senha

Fluxo:
1. Usuário preenche e clica em **Criar conta**.
2. Chamamos `supabase.auth.signUp` com o **e-mail real** (não mais `cpf@cliente.sacctant.app`), guardando CPF e nome em `user_metadata`. O trigger `handle_new_user` continua criando o `profiles` e o `user_roles` normalmente — só precisa salvar o e-mail real (já faz).
3. A tela troca para **"Confirme seu e-mail"**: input de 6 dígitos (componente `InputOTP` já existe) + botão "Reenviar código".
4. Verificamos com `supabase.auth.verifyOtp({ email, token, type: 'signup' })`. Sucesso → redireciona para `/cliente`.

> Observação importante: como o cliente passa a se cadastrar com e-mail real, o **login** também muda — o cliente digita **CPF + senha**, mas internamente buscamos o e-mail real pelo CPF (consulta na tabela `profiles` via uma server function pública/limitada) e fazemos `signInWithPassword` com esse e-mail. Isso preserva a UX "login por CPF".

## 2. Login (aba Cliente)

- Adicionar botão de olho no campo senha.
- Trocar o `cpfToInternalEmail` por uma chamada que resolve `cpf → email` no servidor (server function `resolveClientEmailByCpf`, sem expor outros dados).
- Mensagens de erro amigáveis quando o e-mail ainda não foi confirmado ("Verifique seu e-mail antes de entrar — clique aqui para reenviar o código").

## 3. Esqueci minha senha

Novo link **"Esqueci minha senha"** abaixo do botão Entrar (aba Cliente).

Tela `/auth/recuperar`:
1. Pede **CPF + e-mail**.
2. Server function valida que **os dois batem** com o mesmo `profiles`. Sem vazar se um existe sem o outro (sempre responde "se os dados conferirem, enviaremos um link").
3. Se baterem, dispara `supabase.auth.resetPasswordForEmail(email, { redirectTo: <origin>/auth/redefinir })`.

Tela `/auth/redefinir`:
- Lê o token recovery do hash da URL.
- Dois campos: nova senha + confirmar nova senha (ambos com olho).
- `supabase.auth.updateUser({ password })` → redireciona para `/cliente`.

## 4. Configuração de auth

- **Não** ativar auto-confirm — o ponto é justamente exigir o código.
- Usar remetente padrão do Lovable (escolha do usuário).
- HIBP (proteção contra senhas vazadas): manter desativado salvo pedido futuro.

## 5. Componentes/arquivos afetados

```text
src/routes/auth.tsx                  edit  (campos novos, etapa OTP, olho na senha, link "esqueci")
src/routes/auth.recuperar.tsx        new   (CPF + e-mail → envia link)
src/routes/auth.redefinir.tsx        new   (define nova senha após link)
src/components/PasswordInput.tsx     new   (input com botão de olho, reutilizável)
src/lib/auth-helpers.ts              edit  (remover dependência de cpf→email fake)
src/lib/auth.functions.ts            new   (server fns: resolveClientEmailByCpf, verifyCpfEmailMatch)
```

A estrutura de rota usa o padrão flat do TanStack: `auth.recuperar.tsx` e `auth.redefinir.tsx` (irmãs de `auth.tsx`, sem layout pai com Outlet — `auth.tsx` continua independente).

## 6. Estética

Mantém o design atual: cards brancos, bordas finas, foco azul-marinho. O botão de olho usa `lucide-react` (`Eye` / `EyeOff`) dentro do input, posicionado à direita, mesma altura do campo. O input OTP usa o componente shadcn `InputOTP` já presente no projeto.

## 7. Detalhes técnicos

- **Validação Zod** em todos os formulários (e-mail válido, senha ≥ 8 caracteres com letra+número, confirmação igual).
- **Server function `resolveClientEmailByCpf(cpf)`** usa `supabaseAdmin` (service role) e retorna `{ email }` ou `null`. Nunca expõe outros campos. Rate-limit básico via verificação de CPF válido antes de consultar.
- **Server function `verifyCpfEmailMatch(cpf, email)`** retorna `boolean` sem revelar qual dos dois falhou.
- Migrações: nenhuma — schema atual já suporta (e-mail real cabe em `profiles.email` e `auth.users.email`).
- Clientes **antigos** (cadastrados antes desta mudança) com e-mail interno `@cliente.sacctant.app`: continuam funcionando porque o login passa a resolver pelo `profiles.email`. Para esses, o `profiles.email` é o interno — uma nota "Atualize seu e-mail" pode aparecer em `/cliente`, mas isso fica para outra entrega se você quiser.

## Fora do escopo (confirmado)

- SMS / validação por celular (precisaria Twilio).
- Configuração de domínio próprio para os e-mails (você escolheu manter o remetente padrão por enquanto).
