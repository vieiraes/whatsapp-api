# WhatsApp API

Uma API RESTful para interação com WhatsApp usando a biblioteca whatsapp-web.js.

## 🚀 Funcionalidades

- Conexão com WhatsApp via QR Code
- Envio de mensagens
- Sistema de Webhooks para eventos
- Suporte a múltiplas instâncias
- Gerenciamento de estado de conexão

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

# Configure as variáveis de ambiente (se necessário)
cp .env.example .env
```

## 🚀 Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📡 Endpoints

### Inicialização
```http
POST /initialize
```

### Configurar Webhook
```http
POST /webhook
Content-Type: application/json

{
    "url": "https://seu-webhook.com/endpoint"
}
```

### Obter QR Code
```http
GET /qr
```
Parâmetros de query opcionais:
- `output`: Formato de saída ('json', 'png', 'svg')

### Enviar Mensagem
```http
POST /send
Content-Type: application/json

{
    "to": "5511999999999",
    "message": "Sua mensagem aqui"
}
```

### Status
```http
GET /status
```

## 🔄 Eventos do Webhook

A API envia os seguintes eventos para o webhook configurado:

- `qr`: Quando um novo QR code é gerado
- `ready`: Quando o cliente está conectado e pronto
- `message`: Quando uma mensagem é recebida
- `disconnected`: Quando o cliente é desconectado

## 🛠️ Tecnologias

- [Fastify](https://www.fastify.io/)
- [whatsapp-web.js](https://wwebjs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://github.com/colinhacks/zod)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de submeter um PR.

## 📝 Licença

Este projeto está sob a licença MIT com atribuição - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## ✨ Autor

Bruno Vieira