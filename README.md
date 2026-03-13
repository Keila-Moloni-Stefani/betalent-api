## Desafio Back-end BeTalent – Nível 1

API RESTful em AdonisJS 7 para gerenciamento de pagamentos multi-gateway, focada no **Nível 1** do desafio (valor da compra vem direto pela API e gateways sem autenticação).

### ✅ Stack
- **Node.js / AdonisJS 7**
- **MySQL** (via Docker)
- **Lucid ORM**
- **VineJS** para validação
- **Japa** para testes

---

## Níveis implementados

- **Nível 1 (implementado)**
  - Valor da compra vem direto pela API (`amount` em centavos).
  - Gateways sem autenticação (quando usando os mocks).
  - Fallback entre múltiplos gateways respeitando `priority`.
  - CRUDs e rotas privadas protegidas por auth e role.

---

## Requisitos

- Node.js 20+ (para desenvolvimento local)
- MySQL 8+ instalado localmente **ou** Docker + Docker Compose

---

## Como rodar o projeto

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/Keila-Moloni-Stefani/betalent-api.git
cd betalent-api
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Gerar e preencher `APP_KEY`:

```bash
npx node ace generate:key
```

O `.env` contém exemplos para dois cenários:

- **Desenvolvimento local (sem Docker, usando MySQL instalado na máquina)**  
  Exemplo:
  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_USER=betalent
  DB_PASSWORD=betalent
  DB_DATABASE=betalent
  ```

- **Ambiente com Docker Compose (MySQL dentro do compose)**  
  Exemplo:
  ```env
  DB_CONNECTION=mysql
  DB_HOST=mysql
  DB_PORT=3306
  DB_USER=betalent
  DB_PASSWORD=betalent
  DB_DATABASE=betalent
  ```

Além disso:

- URLs dos mocks de gateway (padrão do enunciado):
  - `GATEWAY1_URL=http://localhost:3001`
  - `GATEWAY2_URL=http://localhost:3002`
- Flag para facilitar testes sem Docker:
  - `GATEWAYS_FAKE_SUCCESS=true` → **simula sucesso** no primeiro gateway ativo, sem chamar as APIs externas.

### 3. Rodar migrations e subir o servidor: modo simples, sem Docker

1. Certifique‑se de que o MySQL local está rodando e que o banco `betalent` existe.
2. Rode:

```bash
npx node ace migration:run
npx node ace serve --watch
```

A API ficará disponível em `http://localhost:3333`.

### 4. Rodar com Docker (App + MySQL + Gateways Mock)

> Observação: em algumas máquinas o Docker Desktop pode não iniciar corretamente.
> A stack Docker já está preparada; localmente você pode optar por usar apenas o MySQL instalado na máquina.

```bash
docker compose up -d
docker compose exec app node ace migration:run
```

### 5. Rodar testes

```bash
node ace test
```

---

## Modelagem de Dados

Tabelas principais (MySQL):

- `users`
  - `id`
  - `full_name`
  - `email`
  - `password`
  - `role` (`user` ou `admin`)
  - `created_at`, `updated_at`
- `gateways`
  - `id`
  - `name` (ex.: `gateway1`, `gateway2`)
  - `is_active`
  - `priority`
  - `created_at`, `updated_at`
- `clients`
  - `id`
  - `name`
  - `email`
  - `created_at`, `updated_at`
- `products`
  - `id`
  - `name`
  - `amount` (em centavos)
  - `created_at`, `updated_at`
- `transactions`
  - `id`
  - `client_id`
  - `gateway_id`
  - `external_id`
  - `status` (`paid`, `failed`, `refunded`)
  - `amount` (em centavos)
  - `card_last_numbers`
  - `created_at`, `updated_at`
- `transaction_products`
  - `id`
  - `transaction_id`
  - `product_id`
  - `quantity`

---

## Fluxo Multi-Gateway (Nível 1)

Implementado em `app/services/payment_gateway_service.ts`:

- Busca `gateways` ativos ordenados por `priority`.
- Para cada gateway:
  - **Gateway 1** (`GATEWAY1_URL`):
    - `POST /transactions`
  - **Gateway 2** (`GATEWAY2_URL`):
    - `POST /transacoes`
- Se algum gateway retornar sucesso, encerra o loop e grava a transação como `paid`.
- Se todos falharem, a API responde erro 400 com `"Payment failed on all gateways"`.
- Reembolso:
  - Gateway 1: `POST /transactions/:id/charge_back`
  - Gateway 2: `POST /transacoes/reembolso`

### Modo "fake" para quem não tem Docker

Para facilitar testes em ambientes sem Docker ou sem os containers dos mocks:

- A variável `GATEWAYS_FAKE_SUCCESS=true` faz o serviço de pagamento:
  - Ignorar chamadas HTTP reais aos mocks.
  - Considerar o primeiro gateway ativo (`gateways.is_active = true`, menor `priority`) como bem‑sucedido.
  - Criar a transação como `paid` com um `external_id` fake.
- Para reproduzir o comportamento real do enunciado:
  - Suba os mocks com Docker conforme a documentação do desafio.
  - Ajuste o `.env`:
    ```env
    GATEWAYS_FAKE_SUCCESS=false
    GATEWAY1_URL=http://localhost:3001
    GATEWAY2_URL=http://localhost:3002
    ```

---

## Autenticação e Autorização

- Autenticação JWT baseada no template de API do Adonis:
  - `POST /api/v1/auth/signup`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout` (requer token).
- Middleware `auth` protege rotas privadas.
- Middleware `role` (`role_middleware.ts`) restringe a roles específicos:
  - Para este desafio, `admin` controla CRUD de usuários e produtos e reembolsos.

---

## Rotas

Base: `http://localhost:3333/api/v1`

### Rotas Públicas

- **POST `/auth/signup`**
  - Cria usuário e já retorna token.
  - Body:
    - `fullName` (opcional)
    - `email`
    - `password`
    - `passwordConfirmation`

- **POST `/auth/login`**
  - Autentica e retorna token.

- **POST `/purchase`**
  - Realiza compra informando valor (Nível 1).
  - Body:
    - `clientName`
    - `clientEmail`
    - `amount` (valor da compra em centavos)
    - `cardNumber` (16 dígitos)
    - `cvv` (3 dígitos)
    - `productId` (opcional)
    - `quantity` (opcional, default 1)

### Rotas Privadas (requer Bearer token)

#### Conta / Perfil

- **GET `/account/profile`**
  - Retorna dados do usuário logado.

#### Gateways

- **GET `/gateways`**
  - Lista gateways.

- **POST `/gateways/:id/toggle`**
  - Ativa/desativa um gateway.

- **POST `/gateways/:id/priority`**
  - Body: `{ "priority": number }`
  - Altera ordem de prioridade.

#### Usuários (role `admin`)

- **GET `/users`**
- **POST `/users`**
- **GET `/users/:id`**
- **PUT `/users/:id`**
- **DELETE `/users/:id`**

#### Produtos (role `admin`)

- **GET `/products`**
- **POST `/products`**
- **GET `/products/:id`**
- **PUT `/products/:id`**
- **DELETE `/products/:id`**

#### Clientes

- **GET `/clients`**
  - Lista todos os clientes.
- **GET `/clients/:id`**
  - Detalhes do cliente + transações.

#### Transações

- **GET `/transactions`**
- **GET `/transactions/:id`**
- **POST `/transactions/:id/refund`** (role `admin`)
  - Realiza reembolso no gateway e marca transação como `refunded`.

---

## Testes

Principais suites em `tests/functional`:

- `auth_and_purchase.spec.ts`
  - Cadastro e login retornando token.
  - Chamada da rota pública de compra.
- `protected_routes.spec.ts`
  - Garante que produtos exigem autenticação.
  - Garante que `admin` consegue criar produto.

Rodar:

```bash
node ace test
```

---

## Pendências e extensões (Nível 2)

Não implementado neste projeto (por foco no **Nível 1**):

- Cálculo do valor da compra a partir de `product_id` + `quantity` (Nível 2).
- Uso de autenticação dos gateways externos (headers e Bearer token).
- Sincronização mais avançada de status com os gateways externos.
- Paginação e filtros nas listagens.
- Testes adicionais cobrindo reembolso, erros dos gateways e cenários de falha.

Esses pontos podem ser evoluídos em uma próxima iteração.

---

Teste Prático Back-end BeTalent

Desenvolvido por Keila Moloni Stefani
