# WhatsApp API

Uma API RESTful para interação com WhatsApp usando a biblioteca whatsapp-web.js com suporte a múltiplas instâncias.

## 🚀 Funcionalidades

- Gerenciamento de múltiplas instâncias do WhatsApp
- Conexão com WhatsApp via QR Code
- Sistema de Webhooks para eventos
- Envio de mensagens
- Gerenciamento de estado de conexão
- Suporte a diferentes formatos de QR code (JSON, PNG, SVG)

## 📋 Pré-requisitos

- Node.js >= 16
- npm ou yarn
- Chrome/Chromium (para o puppeteer)

## 🔧 Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd whatsapp-api

# Instale as dependências
npm install
```

## 🚀 Fluxo de Uso

### 1. Criar um Cliente
```http
POST /clients
Content-Type: application/json

{
    "phoneNumber": "5511999999999"
}
```
- Cria e inicializa um novo cliente WhatsApp
- Retorna status inicial e informações do cliente

### 2. Configurar Webhook
```http
POST /webhook
Content-Type: application/json

{
    "phoneNumber": "5511999999999",
    "url": "https://seu-webhook.com/endpoint"
}
```
- Configura URL para receber eventos
- Deve ser configurado logo após criar o cliente

### 3. Obter QR Code
```http
GET /clients/qr?phoneNumber=5511999999999&output=json
```
Parâmetros de query:
- `phoneNumber`: Número do cliente
- `output`: Formato de saída ('json', 'png', 'svg')

### 4. Verificar Status
```http
GET /clients/status?phoneNumber=5511999999999
```

### 5. Enviar Mensagem
```http
POST /messages
Content-Type: application/json

{
    "phoneNumber": "5511999999999",
    "to": "5511888888888",
    "message": "Sua mensagem aqui"
}
```

### 6. Listar Clientes
```http
GET /clients
```

### 7. Remover Cliente
```http
DELETE /clients?phoneNumber=5511999999999
```

## 🔄 Eventos do Webhook

O webhook configurado receberá os seguintes eventos:

- `qr`: Quando um novo QR code é gerado
  ```json
  {
    "event": "qr",
    "clientId": "5511999999999",
    "data": {
      "qr": "qr-code-string"
    }
  }
  ```

- `ready`: Quando o cliente está conectado e pronto
  ```json
  {
    "event": "ready",
    "clientId": "5511999999999",
    "data": {
      "status": "ready"
    }
  }
  ```

- `message`: Quando uma mensagem é recebida
  ```json
  {
    "event": "message",
    "clientId": "5511999999999",
    "data": {
      "from": "5511888888888",
      "body": "mensagem recebida",
      "timestamp": "timestamp",
      "type": "tipo-da-mensagem"
    }
  }
  ```

- `disconnected`: Quando o cliente é desconectado
  ```json
  {
    "event": "disconnected",
    "clientId": "5511999999999",
    "data": {
      "status": "disconnected"
    }
  }
  ```

## 🛠️ Tecnologias

- [Fastify](https://www.fastify.io/)
- [whatsapp-web.js](https://wwebjs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://github.com/colinhacks/zod)

## 💡 Melhores Práticas

1. Sempre criar o cliente antes de qualquer outra operação
2. Configurar webhook imediatamente após criar o cliente
3. Verificar status antes de enviar mensagens
4. Monitorar eventos do webhook para controle do estado da conexão
5. Tratar reconexões quando necessário

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de submeter um PR.

## 📝 Licença

Este projeto está sob a licença MIT com atribuição - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## ✨ Autor

Bruno Vieira