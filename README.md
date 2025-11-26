# Hirable.io - Frontend

Plataforma de conexão entre candidatos e empresas para oportunidades de emprego.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Como Executar](#como-executar)
- [Testes E2E](#testes-e2e)

## 🎯 Sobre o Projeto

Hirable.io é uma plataforma web que conecta candidatos a oportunidades de emprego. O frontend é construído com Next.js 14, React e TypeScript, oferecendo uma experiência moderna e responsiva.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com SSR
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Cypress** - Testes E2E

## 💻 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Backend rodando em `http://localhost:3021`

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

O aplicativo estará disponível em `http://localhost:3000`

---

## 🧪 Testes E2E

### Visão Geral

O projeto possui uma suite de testes end-to-end (E2E) implementada com Cypress para validar os fluxos principais da aplicação:

- **Fluxo de Candidato**: Cadastro, login, candidatura a vagas e visualização de candidaturas
- **Fluxo de Empresa**: Cadastro, login e criação de vagas de emprego

### Estrutura de Arquivos

```
cypress/
├── e2e/
│   ├── candidate/
│   │   └── candidate-flow.cy.ts    # 4 testes do fluxo de candidato
│   └── employer/
│       └── employer-flow.cy.ts      # 3 testes do fluxo de empresa
├── fixtures/
│   └── test-data.json               # Dados base para testes
├── support/
│   ├── commands.ts                  # Comandos customizados do Cypress
│   ├── e2e.ts                       # Configuração global
│   ├── test-helpers.ts              # Geradores de dados de teste
│   └── types.ts                     # Interfaces TypeScript
└── downloads/                       # Arquivos baixados (gitignored)
```

### 📦 Pré-requisitos para Testes

⚠️ **IMPORTANTE**: Os testes E2E requerem:

1. **Backend rodando** em `http://localhost:3021`
2. **Frontend rodando** em `http://localhost:3000`
3. **Banco de dados** acessível e funcional
4. **Dependências instaladas**: `npm install`

> 💡 **Dica**: Execute os testes de empresa primeiro para criar vagas no sistema, facilitando os testes de candidato.

### 🎬 Comandos de Execução

#### Modo Interativo (Desenvolvimento)
```bash
# Abre interface visual do Cypress
npm run cypress:open
# ou
npm run test:e2e:ui
```

#### Modo Headless (CI/CD)
```bash
# Executa todos os testes em modo headless
npm run cypress:run
# ou
npm run test:e2e
```

#### Executar Testes Específicos
```bash
# Apenas testes de candidato
npm run cypress:run -- --spec "cypress/e2e/candidate/**"

# Apenas testes de empresa
npm run cypress:run -- --spec "cypress/e2e/employer/**"

# Arquivo específico
npx cypress run --spec "cypress/e2e/candidate/candidate-flow.cy.ts"
```

### 🧪 Cenários de Teste

#### Fluxo de Candidato (4 testes)

| ID | Cenário | Validações |
|----|---------|------------|
| CT-01 | Criar conta de candidato | Redirecionamento, mensagem de sucesso |
| CT-02 | Login como candidato | Acesso ao feed de vagas |
| CT-03 | Candidatar-se a vaga | Envio de candidatura, feedback visual |
| CT-04 | Ver candidaturas enviadas | Lista de candidaturas, vaga aplicada aparece |

#### Fluxo de Empresa (3 testes)

| ID | Cenário | Validações |
|----|---------|------------|
| ET-01 | Criar conta de empresa | Redirecionamento, mensagem de sucesso |
| ET-02 | Login como empresa | Acesso ao dashboard |
| ET-03 | Criar vaga de emprego | Vaga criada, aparece no dashboard |

### 🔧 Infraestrutura de Testes

#### Comandos Customizados

O projeto inclui comandos Cypress reutilizáveis:

```typescript
// Cadastro de candidato
cy.signupCandidate({
  fullName: 'João Silva',
  email: 'joao@test.com',
  phone: '11999999999',
  password: 'senha123',
  confirmPassword: 'senha123'
});

// Cadastro de empresa
cy.signupEmployer({
  companyName: 'Acme Corp',
  contactName: 'Maria Santos',
  cnpj: '12345678901234',
  email: 'acme@test.com',
  phone: '11988888888',
  password: 'senha123',
  confirmPassword: 'senha123'
});

// Login (candidato ou empresa)
cy.login('user@test.com', 'senha123');
```

#### Geração Dinâmica de Dados

Os testes geram dados únicos automaticamente usando timestamps:

```typescript
import { TestDataGenerator } from '../support/test-helpers';

// Gera dados únicos para cada execução
const candidateData = TestDataGenerator.generateCandidateData();
// Email: candidato-1732645123456@test.com (timestamp único)

const employerData = TestDataGenerator.generateEmployerData();
const vacancyData = TestDataGenerator.generateVacancyData();
```

### 📊 Resultados Esperados

✅ **Suite completa**: 7 testes  
✅ **Tempo de execução**: < 30 segundos  
✅ **Vídeos**: Gerados automaticamente em `cypress/videos/`  
✅ **Screenshots**: Capturados em falhas em `cypress/screenshots/`

### 🐛 Troubleshooting

#### 1. "Connection refused" ao executar testes
**Causa**: Backend não está rodando  
**Solução**: Inicie o backend em `http://localhost:3021`

```bash
# No diretório do backend
npm run dev
```

#### 2. Teste CT-03 falha: "No element found"
**Causa**: Não há vagas disponíveis no sistema  
**Solução**: Execute os testes de empresa primeiro para criar vagas

```bash
npm run cypress:run -- --spec "cypress/e2e/employer/**"
```

#### 3. Timeouts frequentes
**Causa**: Backend ou frontend lento  
**Solução**: Aumente os timeouts em `cypress.config.ts`

```typescript
export default defineConfig({
  e2e: {
    defaultCommandTimeout: 15000, // padrão: 10000
    pageLoadTimeout: 45000,       // padrão: 30000
  },
});
```

#### 4. "Email já cadastrado"
**Causa**: Execução anterior deixou usuário no banco  
**Solução**: 
- Os testes geram emails únicos por execução (timestamp muda)
- Limpe o banco de dados se necessário
- Aguarde alguns segundos entre execuções

#### 5. Cypress não inicia
**Causa**: Problema de instalação ou permissões  
**Solução**:

```bash
# Reinstalar Cypress
npm install -D cypress --force

# Verificar instalação
npx cypress verify

# Limpar cache
npx cypress cache clear
npx cypress install
```

### 📝 Configuração

#### cypress.config.ts

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    video: true,
    screenshotOnRunFailure: true,
  },
});
```

#### cypress.env.json (não versionado)

```json
{
  "API_URL": "http://localhost:3021",
  "FRONTEND_URL": "http://localhost:3000"
}
```

### 🔒 Arquivos Ignorados

Os seguintes arquivos/pastas são ignorados pelo Git:

- `cypress/videos/` - Vídeos das execuções
- `cypress/screenshots/` - Screenshots de falhas
- `cypress/downloads/` - Arquivos baixados em testes
- `cypress.env.json` - Variáveis de ambiente locais

### 📖 Documentação Adicional

- [Documentação do Cypress](https://docs.cypress.io)
- [PRD dos Testes](../tasks/prd-testes-automatizados-cypress/prd.md)
- [Especificação Técnica](../tasks/prd-testes-automatizados-cypress/techspec.md)

---

## 📄 Licença

Este projeto faz parte de um trabalho acadêmico da UnB.
