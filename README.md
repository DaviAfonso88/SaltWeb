# Site da Juventude SALT

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwind-css\&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/license-MIT-green)

Site oficial da **Juventude SALT**, desenvolvido com foco em **performance, organização de código, escalabilidade e boas práticas de desenvolvimento web moderno**.

---

## 📖 Sobre o projeto

Este projeto é uma **reformulação completa** do antigo site da Juventude SALT. A versão anterior utilizava HTML, CSS e JavaScript puro, apresentando problemas de manutenção, desempenho, falhas em formulários e baixa reutilização de código.

O novo site foi **reescrito do zero** utilizando **React, Next.js e TypeScript**, adotando uma arquitetura moderna, componentes reutilizáveis e um design padronizado e responsivo.

O resultado é uma aplicação rápida, estável, fácil de manter e preparada para crescimento futuro.

---

## 🚀 Tecnologias utilizadas

* **React** – Criação de interfaces reutilizáveis
* **Next.js (App Router)** – Roteamento, SEO e performance
* **TypeScript** – Tipagem estática e maior segurança
* **Tailwind CSS** – Estilização rápida e consistente
* **API Routes (Next.js)** – Backend leve para formulários
* **GitHub Pages** – Hospedagem de JSON externo (Devocionais)
* **Vercel** – Deploy e hospedagem

---

## 🧱 Arquitetura do projeto

O projeto utiliza o **Next.js App Router**, com uma estrutura organizada e intuitiva:

```
app/
 ├─ page.tsx           # Página inicial
 ├─ eventos/
 │   ├─ page.tsx
 │   └─ data.ts
 ├─ devocional/
 │   ├─ page.tsx
 │   └─ (consumo de JSON externo)
 ├─ podcast/
 │   ├─ page.tsx
 │   └─ data.ts
 ├─ api/
 │   └─ contact/
 │       └─ route.ts
components/
 ├─ Header.tsx
 ├─ Footer.tsx
 ├─ CardEvento.tsx
 ├─ CardPodcast.tsx
 └─ ProgramacaoCard.tsx
```

---

## 📦 Gerenciamento de conteúdo

### 📅 Eventos e 🎙️ Podcasts

* Conteúdo armazenado em arquivos `data.ts`
* Separação total entre **dados** e **interface**
* Facilidade de atualização e manutenção
* Reutilização de componentes

### 📖 Devocional

* Conteúdo consumido a partir de um **JSON externo**
* JSON hospedado via **GitHub Pages**
* Atualização do conteúdo sem necessidade de novo deploy
* Preparado para futura integração com API ou CMS Headless

---

## ⚡ Performance e boas práticas

* Componentização e reutilização de código
* ESLint para padronização e qualidade
* Tipagem estática com TypeScript
* Geração estática de páginas quando possível
* Design responsivo e consistente
* Otimização automática do Next.js

---

## 🖼️ Screenshots

### Página Inicial

<img width="1685" height="705" alt="image" src="https://github.com/user-attachments/assets/848a65a4-3065-4b48-99cd-933bb5f034e4" />

### Eventos

<img width="1641" height="713" alt="image" src="https://github.com/user-attachments/assets/253e7090-4c1a-4abb-83bc-fe50eaec4afe" />

### Devocional

<img width="1662" height="631" alt="image" src="https://github.com/user-attachments/assets/bfbabab0-619e-46c8-a983-2bd406aa4131" />

---

## 🛠️ Como rodar o projeto localmente

### Pré-requisitos

* Node.js 18+
* NPM ou Yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-repositorio.git

# Acesse a pasta do projeto
cd seu-repositorio

# Instale as dependências
npm install
```

### Executando o projeto

```bash
npm run dev
```

O projeto estará disponível em:

```
http://localhost:3000
```

---

## 🌍 Deploy

O deploy do projeto é feito automaticamente pela **Vercel**, garantindo:

* Builds otimizados
* CDN global
* Alta disponibilidade
* Excelente performance

---

## 🎯 Objetivo do projeto

Criar um site moderno, rápido e escalável para a Juventude SALT, aplicando boas práticas de desenvolvimento e preparando a base para futuras evoluções, como integração com APIs externas ou CMS Headless.

---

## 👨‍💻 Desenvolvido por

<table>
  <tr>
    <td align="center">
      <a href="#">
         <img src="https://avatars.githubusercontent.com/u/89953265?v=4" width="100px;" alt="Foto de Davi Afonso no GitHub"/><br>
        <sub>
          <b>Davi Afonso</b>
        </sub>
      </a>
    </td>
</table>
