# To add a new network tool (e.g., DNS Lookup Tool):

## 1. Create the component file:
src/renderer/components/tools/DNSLookupTool.tsx

## 2. Register it in App.tsx:
```javascript
if (!registry.getTool('dns-lookup')) {
  registry.register('dns-lookup', {
    name: 'DNS Lookup',
    description: 'Perform DNS lookups and queries',
    icon: '🔍',
    category: 'networking'
  })
}
```

## 3. Add backend handler in network-tools.js:
```javascript
ipcMain.handle('network-dns-lookup', async (event, hostname) => {
  // Implementation
})
```

## 4. Update the preload.js and global.d.ts if needed for new APIs
