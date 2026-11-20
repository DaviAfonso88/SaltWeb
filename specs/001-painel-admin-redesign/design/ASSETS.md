# Design de referência — mapa de imagens

Os arquivos `*.dc.html` desta pasta são o canvas aprovado "SALT — Redesign do site"
(https://claude.ai/artifact/CaujQ86r71wdXcNUSb3H5T). Eles referenciam imagens como `/_blob/<id>`;
no código, use os arquivos equivalentes de `public/images/`:

| Blob id | Arquivo no design | Arquivo no repositório |
|---|---|---|
| da82e60b4142e92541242f6e0c9f53c3 | logo-ink.png (logo escuro, gerado a partir do branco) | `public/images/salt-logo-ink.png` (copiar do scratchpad ou recriar a partir do logo branco) |
| 0fbc74fa1fb0c99e917eee4f3e9f0aae | logo-white.png | `public/images/SALT LOGO PRINCIPAL FUNDO ESCURO.png` |
| 322d30a8a32d5180acc12454de2207e6 | symbol-gradient.png | `public/images/SALT SIMBOLO DEGRADE.png` |
| a86568e3b4362d4cdb7021f97e9dea0e | salt-home.jpg | `public/images/salt-home.jpg` |
| e20e29d61d4d4f8e0b3e570c29b7af8c | sobre.jpg | removido; "Quem somos" usa `public/images/acampa-fogueira.jpg` |
| 35745d91a999ab8ac0d02e19d000b8ca | culto-salt.jpg | removido; o card das Sextas SALT usa `public/images/sextas-salt.jpg` |
| 6a9be49d8b98d54f700234ed67fe1390 | celula-jovens.jpg | `public/images/celula-jovens.jpeg` |
| 761a8b3c3dd4f2ebe0ff2a1dc4d56b4b | celula-adolescentes.jpg | `public/images/celula-adolescentes.webp` |
| d694ec708d90e9a506d28e62b9c2697d | discipulado.jpg | removido; o card do Discipulado usa `public/images/discipulado-abraco.jpg` |
| d0c160be313b9d48fd896fc91d12a1a5 | acampa.jpg | `public/images/acampa.jpeg` |
| 1d46987ef5df901e9e83c2467f757713 | acampamento.jpg | removido; a galeria usa as fotos `public/images/acampa-*.jpg` (Acampa SALT 2026) |
| 23c3f5fff960dc33de6e954a91ab39d1 | avalanche.jpg | `public/images/avalanche.jpg` |
| 1da394eace231103600f269996c20920 | invasao.jpg | `public/images/invasão.jpeg` |
| 9157ab4b84ade6d075e42050e377748d | orla.jpg | `public/images/orla.jpeg` |
| 17db8e2a6cfa9c7902233a8b4d4c3f6d | pastor.jpg | `public/images/pastor.jpeg` |
| 3f50a6c1defc54797e05202c8bdc6015 | pescador.jpg | removido da galeria |
| f5217d3534036a159453dcca9820fa2f | turma-de-minas.jpg | `public/images/turma-de-minas.jpeg` |
| a6a1fbaa834f8380a2c900175a0d4f7e | turma-de-minas2.jpg | `public/images/turma-de-minas2.jpeg` |
| 2567839f27e3dd23d1680042f3fefc0c | salt-talks.png | `public/images/salt-talks.png` |
| 8e8db5646308cb090a86ee27dcca9afc | pix.png | removido; o site usa `public/images/pix-pibls.png` (`lib/pix.ts`) |

Tokens do guia de estilo: ver `Estilo.dc.html` e `research.md` (R15).
