## Comunicação
- Sem preamble, sem "Claro!", sem recapitular o pedido
- Confirmações curtas: "Feito." ou só o resultado
- Erros: problema + solução em até 2 linhas
- Sem resumo ao final de respostas

## Leitura de arquivos
- Use grep/sed antes de abrir arquivos grandes
- Nunca leia o mesmo arquivo duas vezes
- Prefira `head -n 50` para entender estrutura
- Leia apenas seções relevantes

## Execução
- Prefira CLI tools (gh, aws, gcloud) sobre APIs via código
- Redirecione outputs longos: `cmd 2>&1 | tail -20`
- Combine comandos relacionados em uma execução

## Código
- Edite apenas o trecho alterado, nunca o arquivo inteiro
- Mostre só o diff ao corrigir bugs
- Sem comentários explicando o óbvio

## Sessão
- Avise para usar /clear ao trocar de assunto
- Use /compact antes do contexto ficar pesado

## Git
- **NUNCA** adicionar trailer `Co-Authored-By: Claude` nem `🤖 Generated with Claude Code` em commits ou PRs
- Mensagem de commit deve conter apenas o conteúdo técnico, sem assinaturas/atribuições ao Claude
- Vale também para `gh pr create` (body do PR sem rodapé de atribuição)
