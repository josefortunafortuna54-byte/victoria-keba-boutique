import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDir = join(__dirname, "dist/client");
const mimeTypes = {".js":"application/javascript",".mjs":"application/javascript",".css":"text/css",".html":"text/html",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".gif":"image/gif",".svg":"image/svg+xml",".ico":"image/x-icon",".woff":"font/woff",".woff2":"font/woff2"};
const { default: ssrHandler } = await import("./dist/server/index.mjs");
const PORT = process.env.PORT || 3000;
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const staticPath = join(clientDir, url.pathname);
  if (existsSync(staticPath) && extname(staticPath)) {
    try { const content = await readFile(staticPath); res.setHeader("Content-Type", mimeTypes[extname(staticPath)] || "application/octet-stream"); res.setHeader("Cache-Control","public,max-age=31536000"); res.end(content); return; } catch {}
  }
  try {
    const headers = {};
    for (const [k,v] of Object.entries(req.headers)) { if(v) headers[k]=Array.isArray(v)?v.join(", "):v; }
    const body = await new Promise(r=>{const c=[];req.on("data",d=>c.push(d));req.on("end",()=>r(c.length?Buffer.concat(c):undefined));});
    const request = new Request(`http://localhost:${PORT}${req.url}`,{method:req.method,headers,body:body&&body.length?body:undefined});
    const response = await ssrHandler.fetch(request,{},{});
    res.statusCode = response.status;
    response.headers.forEach((v,k)=>res.setHeader(k,v));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch(err) { console.error(err); res.statusCode=500; res.end("Internal Server Error"); }
});
server.listen(PORT, ()=>console.log(`Server on port ${PORT}`));
