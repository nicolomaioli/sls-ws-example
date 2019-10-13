# sls-ws-poc

## Resources

- Architecture: [Building Real Time Applications using WebSocket APIs Supported by Amazon API Gateway](https://www.youtube.com/watch?v=3SCdzzD0PdQ)
- Serverless Framework documentation: [Websocket](https://serverless.com/framework/docs/providers/aws/events/websocket/)
- Example project: [AWS Simple WebSockets Chat App](https://github.com/aws-samples/simple-websockets-chat-app)

## Run

If you already have `aws-cli` configured, `serverless` will use that configuration to deploy. Otherwise, refer to the [AWS quick start](https://serverless.com/framework/docs/providers/aws/guide/quick-start/).

```bash
npm ci
npm run deploy
npm start -- -c wss://your-api-endpoint-here
```
