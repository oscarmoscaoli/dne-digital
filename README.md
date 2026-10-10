# Dne Digital — Interface web, edição com recursos extraídos do APK

**Versão atualizada:** preserva o projeto web anterior, os textos e botões já aprovados e o fluxo de login → carteirinha. Substitui elementos gráficos pelos recursos originais extraídos do APK fornecido e melhora o acabamento visual no celular/desktop. O botão pequeno **Configurar carteirinha** permanece somente abaixo do conteúdo da primeira tela: é preciso rolar para baixo para encontrá-lo.

**Aviso:** este é um protótipo local de interface sem autenticação do emissor, sem assinatura e sem emissão ou validação de documento. A prévia da carteirinha tem aviso visível e o QR armazena apenas um ID de demonstração. Nenhuma credencial é gerada.

**Publicação:** descompacte o arquivo ZIP e envie todos os arquivos que estão dentro da pasta `dne-digital/` para a raiz do repositório GitHub. Em Settings → Pages, publique a branch `main` a partir de `/ (root)`. Não envie apenas o arquivo ZIP.

**Recursos integrados do APK:** ícone/splash original, logo DNE horizontal, logos UNE/UBES/ANPG, selo oficial do botão Apple Wallet (apenas visual), figura da carteirinha, ilustração de comemoração e linha decorativa. Todos estão em `assets/`, funcionam offline depois do primeiro carregamento e não precisam de CDN.

**Atenção a direitos e marca:** os elementos extraídos continuam pertencendo aos respectivos titulares. Confirme sua autorização para republicá-los. Não apresente este projeto como app oficial, nem utilize seu QR como validador.

---

# Dne Digital

Web app responsivo inspirado nas telas fornecidas, pronto para GitHub Pages. Feito em HTML, CSS e JavaScript, sem build, npm, serviços de terceiros ou dependências externas.

## Funcionalidades

- Textos e botões da abertura reproduzidos da segunda imagem, com o logo DNE.
- Botão pequeno **Configurar carteirinha** após a área inicial da tela de login, acessível ao rolar para baixo.
- Formulário com nome, CPF/CIN, nascimento, RG, código, instituição, curso, nível, validade informada e foto opcional.
- Carteirinha digital com os rótulos e botões das referências e os logos UNE, UBES e ANPG enviados. O CPF permanece no cadastro e no acesso, sem uma linha extra na tela da carteirinha.
- Foto comprimida no dispositivo e armazenada junto do perfil.
- Dados persistidos em IndexedDB no navegador. Somente uma prévia por navegador/endereço base do app.
- Configuração dos dados a partir da tela de login, acesso por CPF ou código e nascimento, saída pelo logo DNE e exclusão no painel de configuração.
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

1. Abra o app: a tela de login mostra os textos da imagem enviada.
2. Para configurar os dados, **role para baixo**. O botão pequeno **Configurar carteirinha** fica após um bloco que ocupa pelo menos a altura da tela; assim ele não aparece na área inicial, inclusive em telas altas.
3. Clique no botão, preencha os campos e escolha a foto. **Salvar e ver carteirinha** abre a tela seguinte com os dados.
4. Para voltar ao login, toque no **logo DNE** no canto superior da carteirinha. Role até **Configurar carteirinha** para editar os dados salvos.
5. **Entrar** abre a carteirinha quando CPF/código e nascimento correspondem ao cadastro local. Sem cadastro salvo, abre o formulário com os dados informados.
6. O painel de configuração reúne **Instalar app**, **Sobre esta versão** e **Apagar dados**. A exclusão pede confirmação.

O botão **Solicite ou acompanhe** abre `https://www.documentodoestudante.com.br/`. O texto **Valide sua carteirinha no Meia-Entrada.org** preserva a grafia da imagem e aponta para `https://www.meiaentrada.org.br/`, endereço de validação indicado no site do emissor.

O banner preserva literalmente **Uhul! Chegou!** e **Desbloquei seu DNE físico e aproveite.**, inclusive a grafia da referência. Ele é visual, sem consulta a status de entrega. O cadeado informa que o desbloqueio depende da integração com o emissor.

**Adicionar à Carteira da Apple** reproduz o rótulo e o botão preto da referência. Ao clicar, explica que é necessário um passe assinado; esta entrega não emite passes.

Na carteirinha, os rótulos são **Ins. Ensino:**, **Curso:**, **Nível de ensino:**, **RG:**, **Data de Nasc.** e **Validade:**. A validade usa o formato da referência, por exemplo **Mar/2027**. Os valores vêm do cadastro, sem copiar a identidade dos exemplos.

A validade é visual, sem atestar matrícula ou status. Sem foto, aparecem iniciais. Sem código, é criado um código com prefixo `DEMO-`. O QR continua contendo apenas um identificador de demonstração. Não há verificação de dígitos do CPF, apenas máscara de entrada.

## Tela cheia e instalação

O layout usa `100dvh`, `100vh` de fallback e safe-area para ocupar a área disponível. No navegador, o botão ⛶ solicita tela cheia se a plataforma permitir. Não é possível obrigar um navegador comum a ocultar sua barra ao abrir a página.

O manifest pede `display: fullscreen`. O comportamento final depende do navegador/sistema; alguns usam modo standalone. No Android/desktop, use **Instalar app** ou a opção de instalação do navegador. No iPhone/iPad, abra no Safari → Compartilhar → Adicionar à Tela de Início. HTTPS é necessário fora de localhost. A disponibilidade da instalação depende também dos critérios do navegador.

Após o primeiro carregamento online, a interface pode abrir offline. O service worker armazena somente arquivos estáticos deste projeto, não o perfil. Esta atualização usa o cache `v2`. Ao atualizar arquivos estáticos novamente, incremente `v2` em `service-worker.js` para renovar o cache.

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

Esta entrega é um **protótipo funcional de interface** sem validade documental. As telas principais preservam os textos das referências; a explicação do protótipo fica na configuração e em **Sobre esta versão**. O QR e os códigos gerados continuam identificados como demonstração. Não é o aplicativo oficial de um emissor.

O acesso local por CPF/código e nascimento **não é autenticação segura**. Os dados não são enviados a servidor e não sincronizam entre dispositivos. Quem tiver acesso ao mesmo perfil do navegador pode visualizar/editar a prévia. Limpar os dados do site remove os dados pessoais. Se o armazenamento estiver bloqueado, o app funciona na sessão e informa essa limitação.

GitHub Pages entrega arquivos estáticos: para uso real com contas e emissão são necessários backend, autenticação, autorização, banco de dados, política de tratamento dos dados e integração com o emissor.

Para transformar esta versão em um produto integrado, ainda é necessário definir:

- API/backend responsável por cadastro, acesso e retorno de carteirinhas já emitidas.
- Emissor e endpoint oficial para validar códigos/QR, status e validade.
- Regras de autorização: quem pode editar dados de uma carteirinha emitida.
- Integração Apple Wallet/Google Wallet. O botão Apple Wallet está presente para reproduzir a referência e abre uma explicação; não simula emissão bem-sucedida. Apple Wallet exige um passe assinado e serviços do emissor.


## Verificação

Foi verificada a sintaxe JavaScript e o fluxo de cadastro, exibição, edição, saída/retorno, comparação de dados de acesso, exclusão e tratamento de conteúdo HTML como texto em um ambiente DOM simulado, com armazenamento simulado. O gerador QR foi comparado a uma implementação independente. Foram conferidos os caminhos dos arquivos e o manifest.

O ambiente de execução não disponibilizou um navegador e o download do Chromium falhou. Portanto, renderização visual, upload de foto/canvas, IndexedDB real, service worker offline, instalação PWA e modo de tela cheia ainda precisam de um teste em navegador/dispositivo. Há um checklist em `TESTES-MANUAIS.md`.

## Atualizar uma instalação existente

Substitua no repositório os arquivos do projeto pelos arquivos deste ZIP, inclusive `service-worker.js`, `index.html`, `styles.css` e `app.js`. A versão do cache passou de `v1` para `v2`; ela remove os arquivos estáticos antigos após a atualização do service worker. Se a versão anterior ainda aparecer, feche e reabra o app, ou recarregue a página. O armazenamento IndexedDB usa o mesmo endereço base e preserva o cadastro existente.
