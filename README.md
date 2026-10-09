# Dne Digital

Web app responsivo inspirado nas telas fornecidas, pronto para GitHub Pages. Feito em HTML, CSS e JavaScript, sem build, npm, serviços de terceiros ou dependências externas.

## Funcionalidades

- Abertura inspirada na segunda imagem, com o logo DNE.
- Formulário com nome, CPF/CIN, nascimento, RG, código, instituição, curso, nível, validade informada e foto opcional.
- Carteirinha digital com todos os campos e os logos UNE, UBES e ANPG enviados.
- Foto comprimida no dispositivo e armazenada junto do perfil.
- Dados persistidos em IndexedDB no navegador. Somente uma prévia por navegador/endereço base do app.
- Edição, acesso à prévia salva por CPF ou código e nascimento, saída e exclusão dos dados.
- QR Code real que codifica apenas `DNE DIGITAL - DEMONSTRACAO` e um ID aleatório local. Não contém CPF, nome ou foto, não abre um serviço de validação e não é um QR de emissão oficial.
- Layout que ocupa o viewport, botão de tela cheia e PWA com manifest e service worker para uso offline após o primeiro carregamento.

## Publicar no GitHub Pages

1. Crie um repositório, por exemplo `dne-digital`.
2. Extraia o ZIP e envie **o conteúdo da pasta `dne-digital`**, incluindo a pasta `assets`, à raiz do repositório. O `index.html` deve ficar na raiz. Não envie apenas o ZIP.
3. Em **Settings → Pages → Build and deployment**, selecione **Deploy from a branch**.
4. Selecione a branch **main**, pasta **/ (root)** e clique em **Save**.
5. Aguarde a publicação. O endereço será `https://SEU-USUARIO.github.io/dne-digital/` se esse for o nome do repositório.

Todos os caminhos são relativos, por isso o app funciona em subpastas do GitHub Pages. O `.nojekyll` evita processamento desnecessário pelo Jekyll.

Referência: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Testar localmente

Dentro da pasta do projeto, execute:

```bash
python3 -m http.server 8080
```

Abra `http://localhost:8080`. Use um servidor HTTP para testar PWA, armazenamento e modo offline. Nenhuma compilação é necessária. Evite usar `file://`, que tem suporte variável a armazenamento e não permite service worker.

## Fluxo

1. Abra o app: a tela de acesso é exibida.
2. Se não existir prévia local, informe CPF/código e nascimento e clique em **Entrar**: o formulário abre com esses dados. Ou clique em **Preencher meus dados**.
3. Complete os campos obrigatórios e, se quiser, adicione foto e validade. Clique em **Salvar e ver carteirinha**.
4. A tela seguinte exibe os dados. **Editar dados** reabre o formulário.
5. **Sair da carteirinha** volta à tela de abertura sem excluir o perfil. Para reabri-lo, use o CPF/código e nascimento salvos.
6. **Preencher meus dados** reabre o perfil local para edição mesmo sem verificar CPF/nascimento; esse é um protótipo local, não um controle de acesso.
7. **Apagar dados** remove o perfil após a confirmação.

A validade é um campo visual definido pelo usuário, sem atestar matrícula ou status. Sem foto, a tela mostra iniciais. Sem código informado, é criado um código com prefixo `DEMO-`. Não há verificação de dígitos do CPF nesta versão; apenas máscara de entrada.

## Tela cheia e instalação

O layout usa `100dvh`, `100vh` de fallback e safe-area para ocupar a área disponível. No navegador, o botão ⛶ solicita tela cheia se a plataforma permitir. Não é possível obrigar um navegador comum a ocultar sua barra ao abrir a página.

O manifest pede `display: fullscreen`. O comportamento final depende do navegador/sistema; alguns usam modo standalone. No Android/desktop, use **Instalar app** ou a opção de instalação do navegador. No iPhone/iPad, abra no Safari → Compartilhar → Adicionar à Tela de Início. HTTPS é necessário fora de localhost. A disponibilidade da instalação depende também dos critérios do navegador.

Após o primeiro carregamento online, a interface pode abrir offline. O service worker armazena somente arquivos estáticos deste projeto, não o perfil. Ao atualizar arquivos estáticos, incremente `v1` em `service-worker.js` para renovar o cache.

## Arquivos

```text
dne-digital/
  index.html             Estrutura das três telas
  styles.css             Layout responsivo e estilos
  app.js                 Formulários, foto, armazenamento e navegação
  qr.js                  Gerador QR de demonstração, sem dependências
  manifest.webmanifest   Nome, ícone e modo de exibição da PWA
  service-worker.js      Cache dos arquivos estáticos
  .nojekyll              Configuração para GitHub Pages
  assets/
    logo-dne.png         Primeira imagem enviada, sem alteração
    logos-entidades.png  Sexta imagem enviada, sem alteração
    icon-192.png         Ícone de instalação derivado do logo
    icon-512.png         Ícone de instalação derivado do logo
```

As imagens 2 a 5 serviram como referência de interface. As fotos de exemplo dessas imagens não foram usadas como foto do usuário.

## Escopo e próximas integrações

Esta entrega é um **protótipo funcional de interface**, identificado na carteirinha como demonstração e sem validade documental. Não é o aplicativo oficial de um emissor.

O acesso local por CPF/código e nascimento **não é autenticação segura**. Os dados não são enviados a servidor e não sincronizam entre dispositivos. Quem tiver acesso ao mesmo perfil do navegador pode visualizar/editar a prévia. Limpar os dados do site remove os dados pessoais. Se o armazenamento estiver bloqueado, o app funciona na sessão e informa essa limitação.

GitHub Pages entrega arquivos estáticos: para uso real com contas e emissão são necessários backend, autenticação, autorização, banco de dados, política de tratamento dos dados e integração com o emissor.

Para transformar esta versão em um produto integrado, ainda é necessário definir:

- API/backend responsável por cadastro, acesso e retorno de carteirinhas já emitidas.
- Emissor e endpoint oficial para validar códigos/QR, status e validade.
- Regras de autorização: quem pode editar dados de uma carteirinha emitida.
- Integração Apple Wallet/Google Wallet. A entrega não inclui um botão que simule a criação de um passe oficial. Apple Wallet exige um passe assinado e serviços do emissor.


## Verificação

Foi verificada a sintaxe JavaScript e o fluxo de cadastro, exibição, edição, saída/retorno, comparação de dados de acesso, exclusão e tratamento de conteúdo HTML como texto em um ambiente DOM simulado, com armazenamento simulado. O gerador QR foi comparado a uma implementação independente. Foram conferidos os caminhos dos arquivos e o manifest.

O ambiente de execução não disponibilizou um navegador e o download do Chromium falhou. Portanto, renderização visual, upload de foto/canvas, IndexedDB real, service worker offline, instalação PWA e modo de tela cheia ainda precisam de um teste em navegador/dispositivo. Há um checklist em `TESTES-MANUAIS.md`.
