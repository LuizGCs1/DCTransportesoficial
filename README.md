# DC Transportes — Publicação do Site

Este repositório contém o site estático `dc-transportes.html` e instruções para publicar o site em HTTPS para que os formulários funcionem de qualquer computador.

Recomendo publicar em **GitHub Pages** (gratuito e com HTTPS automático). Se preferir Netlify, também explico o processo.

## Opção A — Publicar no GitHub Pages (recomendado)

Pré-requisitos:
- Git instalado
- Conta no GitHub
- (Opcional) `gh` CLI instalado para criar repositório via terminal

Passos rápidos:

1. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Site DC Transportes"
```

2a. Criar repositório com `gh` (recomendado):

```bash
gh repo create SEU_USUARIO/SEU_REPO --public --source=. --remote=origin --push
```

2b. Ou crie o repositório via github.com e depois conecte e envie:

```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main
```

3. O workflow de GitHub Actions incluído (`.github/workflows/gh-pages.yml`) publicará automaticamente o conteúdo do repositório na branch `gh-pages` sempre que você fizer push na `main`. Após o Actions rodar, o site ficará disponível em:

```
https://SEU_USUARIO.github.io/SEU_REPO/
```

Acesse essa URL; os formulários que usam `https://formsubmit.co` passarão a funcionar porque o site estará servido via HTTPS.

## Opção B — Publicar no Netlify (arrastar e soltar)

- Acesse https://app.netlify.com/drop e arraste a pasta do projeto; o site fica online em poucos minutos com HTTPS.
- Ou use Netlify CLI (`npm i -g netlify-cli`):

```bash
netlify login
netlify init
netlify deploy --dir=. --prod
```

## Observações
- O serviço FormSubmit funciona em qualquer domínio HTTPS. Depois da publicação (GitHub Pages ou Netlify), os formulários enviarão para `dctranportes@gmail.com`.
- Se quiser que eu gere também um backend próprio (Node.js) para enviar e-mails diretamente sem FormSubmit, me avise.

---

Se quiser, posso tentar: criar um repositório template local e gerar um comando pronto `gh repo create` para você copiar e colar. Se preferir, diga o nome do repositório e seu usuário GitHub e eu preparo o comando pronto.