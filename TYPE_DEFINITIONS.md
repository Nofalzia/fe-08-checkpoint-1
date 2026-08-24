# AI SDK Type Definitions - Chat Types

## 1. ChatStatus Type

**Location:** `node_modules/ai/dist/index.d.ts:5411`

```typescript
type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';
```

### Possible Values:
- **`'submitted'`** - The message has been sent to the API and awaiting the start of the response stream
- **`'streaming'`** - The response is actively streaming in from the API, receiving chunks of data
- **`'ready'`** - The full response has been received and processed; a new user message can be submitted
- **`'error'`** - An error occurred during the API request, preventing successful completion

---

## 2. UIMessage Type Definition

**Location:** `node_modules/ai/dist/index.d.ts:1901-2028`

```typescript
interface UIMessage<METADATA = unknown, DATA_PARTS extends UIDataTypes = UIDataTypes, TOOLS extends UITools = UITools> {
  /**
   * A unique identifier for the message.
   */
  id: string;

  /**
   * The role of the message.
   */
  role: 'system' | 'user' | 'assistant';

  /**
   * The metadata of the message.
   */
  metadata?: METADATA;

  /**
   * The parts of the message. Use this for rendering the message in the UI.
   *
   * System messages should be avoided (set the system prompt on the server instead).
   * They can have text parts.
   *
   * User messages can have text parts and file parts.
   *
   * Assistant messages can have text, reasoning, tool invocation, and file parts.
   */
  parts: Array<UIMessagePart<DATA_PARTS, TOOLS>>;
}
```

### Message Parts Types:

#### TextUIPart
```typescript
type TextUIPart = {
  type: 'text';
  text: string;
  state?: 'streaming' | 'done';
  providerMetadata?: ProviderMetadata;
};
```

#### ReasoningUIPart
```typescript
type ReasoningUIPart = {
  type: 'reasoning';
  id?: string;
  text: string;
  state?: 'streaming' | 'done';
  providerMetadata?: ProviderMetadata;
};
```

#### ToolUIPart
```typescript
type ToolUIPart<TOOLS extends UITools> = {
  type: 'tool-invocation' | 'tool-result';
  toolName: string;
  toolCallId: string;
  // For tool-invocation parts:
  input?: unknown;
  // For tool-result parts:
  output?: unknown;
  error?: string;
};
```

#### FileUIPart
```typescript
type FileUIPart = {
  type: 'file';
  mediaType: string;
  filename?: string;
  url: string;
  providerReference?: ProviderReference;
  providerMetadata?: ProviderMetadata;
};
```

### How to Access Message Content:

```typescript
// Accessing text content from a message:
const message: UIMessage = /* ... */;

// Get text from text parts:
const textContent = message.parts
  .filter((part): part is TextUIPart => part.type === 'text')
  .map(part => part.text)
  .join('');

// Get all parts:
message.parts.forEach(part => {
  switch (part.type) {
    case 'text':
      console.log('Text:', part.text);
      break;
    case 'reasoning':
      console.log('Reasoning:', part.text);
      break;
    case 'tool-invocation':
      console.log('Tool:', part.toolName, 'Input:', part.input);
      break;
    case 'file':
      console.log('File:', part.filename, 'Type:', part.mediaType);
      break;
  }
});
```

---

## 3. sendMessage Method

**Location:** `node_modules/ai/dist/index.d.ts:5500-5510`

### Method Signature:
```typescript
sendMessage: (
  message?: (
    CreateUIMessage<UI_MESSAGE> & {
      text?: never;
      files?: never;
      messageId?: string;
    }
  ) | {
    text: string;
    files?: FileList | FileUIPart[];
    metadata?: InferUIMessageMetadata<UI_MESSAGE>;
    parts?: never;
    messageId?: string;
  } | {
    files: FileList | FileUIPart[];
    metadata?: InferUIMessageMetadata<UI_MESSAGE>;
    parts?: never;
    messageId?: string;
  },
  options?: ChatRequestOptions
) => Promise<void>;
```

### Valid Message Shapes:

#### Option 1: Text Message
```typescript
await sendMessage({
  text: "Hello, assistant!",
  metadata?: { /* optional metadata */ },
  messageId?: "msg-123"  // optional, for editing existing messages
});
```

#### Option 2: File Message
```typescript
await sendMessage({
  files: new FileList(), // or FileUIPart[]
  metadata?: { /* optional metadata */ },
  messageId?: "msg-123"
});
```

#### Option 3: Text + Files Message
```typescript
await sendMessage({
  text: "Here's an image:",
  files: [
    {
      type: 'file',
      mediaType: 'image/png',
      url: 'data:image/png;base64,...',
      filename?: 'image.png'
    }
  ],
  metadata?: { /* optional metadata */ }
});
```

#### Option 4: Custom Message (using parts)
```typescript
await sendMessage({
  // Use CreateUIMessage structure with parts
  parts: [
    { type: 'text', text: 'Hello' }
  ],
  metadata?: { /* optional metadata */ }
});
```

### Request Options:
```typescript
type ChatRequestOptions = {
  /**
   * Additional headers that should be passed to the API endpoint.
   */
  headers?: Record<string, string> | Headers;

  /**
   * Additional body JSON properties that should be sent to the API endpoint.
   */
  body?: object;

  /**
   * Additional metadata to pass with the request.
   */
  metadata?: unknown;
};
```

---

## 4. ChatInit Interface

**Location:** `node_modules/ai/dist/index.d.ts:5446-5500`

```typescript
interface ChatInit<UI_MESSAGE extends UIMessage> {
  /**
   * A unique identifier for the chat. If not provided, a random one will be
   * generated.
   */
  id?: string;

  messageMetadataSchema?: FlexibleSchema<UI_MESSAGE['metadata']>;
  dataPartSchemas?: UIDataTypesToSchemas<InferUIMessageData<UI_MESSAGE>>;

  messages?: UI_MESSAGE[];

  /**
   * A way to provide a function that is going to be used for ids for messages and the chat.
   * If not provided the default AI SDK `generateId` is used.
   */
  generateId?: IdGenerator;

  transport?: ChatTransport<UI_MESSAGE>;

  /**
   * Callback function to be called when an error is encountered.
   */
  onError?: ChatOnErrorCallback;

  /**
   * Optional callback function that is invoked when a tool call is received.
   * Intended for automatic client-side tool execution.
   */
  onToolCall?: ChatOnToolCallCallback<UI_MESSAGE>;

  /**
   * Function that is called when the assistant response has finished streaming.
   */
  onFinish?: ChatOnFinishCallback<UI_MESSAGE>;

  /**
   * Optional callback function that is called when a data part is received.
   */
  onData?: ChatOnDataCallback<UI_MESSAGE>;

  /**
   * When provided, this function will be called when the stream is finished or a tool call is added
   * to determine if the current messages should be resubmitted.
   */
  sendAutomaticallyWhen?: (options: {
    messages: UI_MESSAGE[];
  }) => boolean | PromiseLike<boolean>;
}
```

---

## 5. Common Usage Patterns

### Using useChat Hook:
```typescript
import { useChat } from '@ai-sdk/react';

function ChatComponent() {
  const { messages, sendMessage, status, error } = useChat({
    api: '/api/chat',
  });

  const handleSend = async (text: string) => {
    // ✅ Correct: Send text message
    await sendMessage({ text });
    
    // ✅ Correct: Send with metadata
    await sendMessage({
      text,
      metadata: { userId: '123' }
    });
    
    // ✅ Correct: Send files
    await sendMessage({
      files: fileList,
      text: "Here are my files:"
    });
  };

  return (
    <div>
      {/* Check status values */}
      {status === 'submitted' && <p>Sending...</p>}
      {status === 'streaming' && <p>Receiving response...</p>}
      {status === 'ready' && <p>Ready to send</p>}
      {status === 'error' && <p>Error: {error?.message}</p>}

      {/* Display messages */}
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong>
          {msg.parts.map((part, i) => (
            <div key={i}>
              {part.type === 'text' && part.text}
              {part.type === 'reasoning' && `[Reasoning: ${part.text}]`}
              {part.type === 'file' && `[File: ${part.filename}]`}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Error Handling:
```typescript
// ❌ INCORRECT: 'in_progress' is not a valid ChatStatus
if (status === 'in_progress') {
  // This will never be true - valid values are:
  // 'submitted', 'streaming', 'ready', or 'error'
}

// ✅ CORRECT: Use valid ChatStatus values
if (status === 'streaming') {
  console.log('Response is being streamed');
}
```

### Message Content Access:
```typescript
const lastMessage = messages[messages.length - 1];

// ❌ INCORRECT: UIMessage doesn't have a 'content' property
const content = lastMessage.content; // ❌ undefined

// ✅ CORRECT: Access through parts array
const textContent = lastMessage.parts
  .filter(p => p.type === 'text')
  .map(p => (p as TextUIPart).text)
  .join('');
```

---

## Summary of Errors & Fixes

### Error 1: `'in_progress' doesn't match ChatStatus type`
**Cause:** `'in_progress'` is not a valid ChatStatus value.
**Solution:** Use one of: `'submitted'`, `'streaming'`, `'ready'`, `'error'`

### Error 2: `'content' property doesn't exist on UIMessage`
**Cause:** UIMessage stores content in the `parts` array, not in a `content` property.
**Solution:** Access `message.parts` and filter by type to get text or other content.

### Error 3: Incorrect sendMessage message shape
**Cause:** Message object doesn't match one of the valid shapes.
**Solution:** Use either `{ text: string }`, `{ files: FileList }`, or `{ text: string, files: FileList }`
