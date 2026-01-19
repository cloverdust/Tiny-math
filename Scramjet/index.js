import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";
import express from "express";
import http from "http";

const app = express()

app.use("/baremux", express.static(baremuxPath))
app.use("/epoxy", express.static(epoxyPath))
app.use("/scram", express.static(scramjetPath))
app.use(express.static("public"))

const server = http.createServer(app)

server.on("upgrade", (req, socket, head) => {
    if (req.url?.endsWith("/wisp/")) {
        wisp.routeRequest(req, socket, head);
    } else {
        socket.destroy();
    }
});

server.listen(80, "0.0.0.0")