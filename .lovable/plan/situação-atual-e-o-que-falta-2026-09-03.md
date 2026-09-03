# Situação atual e o que falta

## Já implementado

- Recuperação de senha separada por tipo de acesso: cliente exige CPF + e-mail; administrador informa apenas o e-mail e o link de redefinição é disparado corretamente.
- Rota pública de retorno de confirmação (`/auth/confirmar`) que aceita tanto link quanto código, hidrata a sessão e encaminha para Portal ou Admin.
- Redefinição de senha com validação do estado de recuperação e mensagens para link inválido, expirado ou já usado.
- Cadastro trata conta já existente, sessão imediata e confirmação pendente, com reenvio.
- Roteamento das telas de autenticação corrigido (login, recuperar, redefinir e confirmar são rotas independentes).
- Build sem erros.

## O que ainda falta validar

1. **Teste real de ponta a ponta**
   - Criar um cadastro de cliente de teste e confirmar o recebimento do e-mail.
   - Solicitar recuperação de senha na aba Admin com `marcosmelo.advisory@gmail.com` e concluir a troca de senha pelo link.
   - Conferir os registros de autenticação do backend durante os testes e ajustar o que aparecer de erro.

2. **Entrega dos e-mails**
   - Hoje os e-mails saem pelo remetente padrão, sem domínio próprio, então podem cair em spam.
   - `marcosmelo.advisory@gmail.com` é uma caixa Gmail e não pode ser usada como domínio remetente.
   - Para remetente próprio (ex.: `contato@mfadvisory.com.br`) é preciso um domínio da MF Advisory; depois disso configuro os modelos de e-mail com a identidade branco e dourado.

## Detalhes técnicos

Arquivos envolvidos: `src/routes/auth.index.tsx`, `src/routes/auth.recuperar.tsx`, `src/routes/auth.redefinir.tsx`, `src/routes/auth.confirmar.tsx`, `src/lib/auth.functions.ts`. Nenhuma alteração de banco de dados é necessária.
