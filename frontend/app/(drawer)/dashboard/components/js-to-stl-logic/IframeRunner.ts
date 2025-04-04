type ImportMap = {
  imports: Record<string, string>;
};

export type IframeState = {
  iframe: HTMLIFrameElement;
  isLoaded: boolean;
  resolvers: Map<string, { 
    resolve: (data: any) => void;
    reject: (error: Error) => void;
  }>;
};

/**
 * Creates and sets up an iframe with optional import maps
 * @param importMapHtml Raw HTML string for the import map. 
 * ⚠️ SECURITY WARNING: This HTML is inserted directly into the iframe.
 * DO NOT pass user-generated content or unvalidated data to this parameter.
 * Example safe usage:
 * ```ts
 * const importMapHtml = `
 *   <script type="importmap">
 *   {
 *     "imports": {
 *       "three": "https://unpkg.com/three@0.160.0/build/three.module.js"
 *     }
 *   }
 *   </script>
 * `;
 * ```
 */
export function setupIframe(
  importMapHtml?: string
): Promise<IframeState> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('sandbox', 'allow-scripts');
    
    const state: IframeState = {
      iframe,
      isLoaded: false,
      resolvers: new Map()
    };

    // Create message handler
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'iframeLoaded') {
          state.isLoaded = true;
          resolve(state);
        } else if (event.data.type === 'result') {
          const resolver = state.resolvers.get(event.data.requestId);
          if (resolver) {
            resolver.resolve(event.data.result);
            state.resolvers.delete(event.data.requestId);
          }
        } else if (event.data.type === 'error') {
          const resolver = state.resolvers.get(event.data.requestId);
          if (resolver) {
            resolver.reject(new Error(event.data.error));
            state.resolvers.delete(event.data.requestId);
          }
        } else if (event.data.type === 'console') {
          if (event.data.isError) {
            console.error('Iframe console:', ...event.data.args);
          } else {
            console.log('Iframe console:', ...event.data.args);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    const iframeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          ${importMapHtml || ''}
        </head>
        <body>
          <script type="module">
            
            // Setup console logging with safe stringification
            const console = {
              log: (...args) => {
                const logMessage = args.map(arg => {
                  try {
                    return JSON.stringify(arg);
                  } catch {
                    return String(arg);
                  }
                }).join(' ');
                window.parent.postMessage({ 
                  type: 'console', 
                  args: [logMessage]
                }, '*');
              },
              error: (...args) => {
                const logMessage = args.map(arg => {
                  try {
                    return JSON.stringify(arg);
                  } catch {
                    return String(arg);
                  }
                }).join(' ');
                window.parent.postMessage({ 
                  type: 'console', 
                  args: [logMessage],
                  isError: true 
                }, '*');
              },
            };

            // Listen for code execution requests
            window.addEventListener('message', async (event) => {
              if (event.data.type === 'execute') {
                const { modulePath, requestId } = event.data;
                
                try {
                  const module = await import(modulePath);
                  const result = module.stl;
                  
                  // Validate result is a string
                  if (typeof result !== 'string') {
                    throw new Error('Result must be a string, got: ' + typeof result);
                  }

                  window.parent.postMessage({ 
                    type: 'result',
                    result: result,
                    requestId
                  }, '*');
                } catch (error) {
                  window.parent.postMessage({ 
                    type: 'error',
                    error: error.message,
                    requestId
                  }, '*');
                }
              }
            });

            // Signal that iframe is ready
            window.parent.postMessage({ type: 'iframeLoaded' }, '*');
          </script>
        </body>
      </html>
    `;

    iframe.srcdoc = iframeContent;
    document.body.appendChild(iframe);

    // Cleanup on error
    iframe.onerror = () => {
      window.removeEventListener('message', handleMessage);
      reject(new Error('Failed to load iframe'));
    };
  });
}

/**
 * Runs code within an iframe by importing it as a module
 */
export async function runInIframe(
  iframeState: IframeState,
  code: string,
  args: any[] = []
): Promise<any> {
    if (!iframeState.isLoaded) {
    throw new Error('Iframe not loaded');
  }

  // Convert to base64 data URL
  const base64 = btoa(code);
  const modulePath = `data:text/javascript;base64,${base64}`;

  return new Promise((resolve, reject) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    iframeState.resolvers.set(requestId, { resolve, reject });

    // Send execution request
    iframeState.iframe.contentWindow?.postMessage({
      type: 'execute',
      modulePath,
      args,
      requestId
    }, '*');
  });
}

/**
 * Removes an iframe and cleans up associated resources
 */
export function removeIframe(iframeState: IframeState): void {
  // Reject any pending promises
  iframeState.resolvers.forEach(resolver => {
    resolver.reject(new Error('Iframe was removed'));
  });
  iframeState.resolvers.clear();
  
  // Remove the iframe
  if (iframeState.iframe.parentNode) {
    iframeState.iframe.parentNode.removeChild(iframeState.iframe);
  }
} 