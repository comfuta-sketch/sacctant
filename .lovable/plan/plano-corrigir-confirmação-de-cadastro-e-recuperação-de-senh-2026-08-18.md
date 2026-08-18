# Plano: corrigir confirmação de cadastro e recuperação de senha

## Diagnóstico confirmado

- O backend está saudável.
- O administrador oficial já está com o e-mail confirmado; as tentativas recentes registradas foram recusadas por senha incorreta, não por falta de confirmação.
- A recuperação atual sempre exige CPF e só solicita o e-mail quando CPF + e-mail correspondem. O perfil do administrador não possui CPF, portanto o fluxo exibe uma mensagem de sucesso sem solicitar o envio do link.
- O cadastro de cliente informa que foi enviado um código de 6 dígitos, mas também configura confirmação por link. O retorno desses dois formatos não está tratado de maneira unificada.
- Não há domínio próprio configurado. `marcosmelo.advisory@gmail.com` é uma caixa do Gmail, não um domínio remetente; portanto os e-mails de autenticação continuarão usando o remetente padrão disponível. Um remetente próprio exigirá futuramente um domínio que a MF Advisory possua.

## Implementação

1. **Separar a recuperação por tipo de acesso**
   - Preservar CPF + e-mail para clientes, evitando exposição de contas.
   - Para o acesso administrativo, solicitar somente o e-mail e disparar corretamente o link de recuperação.
   - Manter resposta neutra para não revelar se uma conta existe.
   - Preservar o destino original (`/cliente` ou `/admin`) durante todo o fluxo.

2. **Corrigir o cadastro e a confirmação de e-mail**
   - Tratar corretamente cadastro com sessão imediata versus cadastro pendente de confirmação.
   - Suportar confirmação por link e por código sem prometer um formato diferente do e-mail realmente enviado.
   - Adicionar reenvio de confirmação com feedback claro, bloqueio durante o envio e mensagens para limite de tentativas, código expirado e conta já existente.
   - Usar uma rota pública de retorno para hidratar a sessão antes de encaminhar ao Portal ou Admin, evitando retorno direto a uma área protegida.

3. **Fortalecer a redefinição de senha**
   - Validar explicitamente o retorno de recuperação antes de liberar a troca de senha.
   - Após salvar, encerrar o estado temporário de recuperação e encaminhar para o destino correto.
   - Exibir estados claros para link inválido, expirado, usado ou aberto no navegador errado.

4. **Revisar os fluxos relacionados**
   - Testar cadastro de cliente, reenvio, confirmação, login por CPF, recuperação do cliente, recuperação do administrador, troca de senha e acesso protegido.
   - Conferir chamadas de rede, eventos de autenticação e registros do backend durante os testes.
   - Não alterar as demais funcionalidades da plataforma nem a estrutura de dados.

## Observação sobre entrega

A correção fará a aplicação solicitar os e-mails corretamente. Sem domínio próprio, a entrega depende do remetente padrão e pode cair em spam. Se a MF Advisory adquirir um domínio (por exemplo, `mfadvisory.com.br`), o remetente poderá ser configurado e personalizado depois.