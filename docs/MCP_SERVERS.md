# MCP Server Setup for Warp

This repository includes MCP (Model Context Protocol) server configuration to enhance AI agent capabilities when working with this codebase.

## What are MCP Servers?

MCP servers provide AI agents with access to specialized tools and context:

- **NX MCP Server**: Provides accurate, up-to-date information about NX commands, configuration, and best practices
- **ShadCN MCP Server**: Helps discover, add, and work with ShadCN UI components

## Setup Instructions

### Prerequisites

- [Warp Terminal](https://www.warp.dev/) installed
- Node.js and npm installed (for running MCP servers)

### Configuration

This repository includes MCP server configuration in `.mcp/servers.json`. Warp should automatically detect and use this configuration when you're working in this directory.

### Verifying MCP Servers are Working

1. **Open Warp** in this repository directory
2. **Start Agent Mode** (Cmd+Shift+P or use the AI agent feature)
3. **Test the connection** by asking: "What NX commands are available?"

If the MCP servers are working correctly, the AI agent will use the NX MCP tools to provide accurate information.

### Troubleshooting

#### MCP Servers Not Loading

1. **Check Warp is using the config**:

   - Warp should automatically detect `.mcp/servers.json` in the repository root
   - You may need to restart Warp after cloning the repository

2. **Manually verify the configuration**:

   ```bash
   cat .mcp/servers.json
   ```

   Should show:

   ```json
   {
     "mcpServers": {
       "nx": {
         "command": "npx",
         "args": ["-y", "@nx/mcp-server"]
       },
       "shadcn": {
         "command": "npx",
         "args": ["-y", "@shadcn/mcp-server"]
       }
     }
   }
   ```

3. **Test MCP servers manually**:

   ```bash
   # Test NX MCP server
   npx -y @nx/mcp-server

   # Test ShadCN MCP server
   npx -y @shadcn/mcp-server
   ```

4. **Check Node.js version**:
   ```bash
   node --version
   ```
   Ensure you're running a recent version of Node.js (v18+)

#### Agent Says "MCP Server is Down"

If the AI agent reports that MCP servers are unavailable:

1. **Restart Warp** to reload the configuration
2. **Verify you're in the correct directory** (the repository root)
3. **Check for npm/npx issues**:
   ```bash
   which npx
   npm --version
   ```
4. **Try running the MCP servers directly** (see step 3 above)

### Alternative: Global MCP Configuration

If you prefer to configure MCP servers globally for all projects:

1. Create or edit `~/.warp/mcp.json`
2. Add the same configuration as shown in `.mcp/servers.json`
3. Restart Warp

**Note**: Repository-specific configuration (`.mcp/servers.json`) takes precedence over global configuration.

## Updating MCP Servers

To update the MCP server packages:

```bash
# Clear npx cache to get latest versions
npx clear-npx-cache

# Or manually clear specific packages
rm -rf ~/.npm/_npx
```

The `-y` flag in the configuration ensures npx always uses the latest version.

## For More Information

- [Warp MCP Documentation](https://docs.warp.dev/features/ai/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [NX Documentation](https://nx.dev/)
- [ShadCN Documentation](https://ui.shadcn.com/)
