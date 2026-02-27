import fs from "node:fs";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

type PRRecord = {
	id: number;
	date: string;
	lift: "卧推" | "深蹲" | "硬拉" | string;
	weight: number;
	reps: number;
	freq: string;
	recovery: string;
};

type Review = {
	id: number;
	name: string;
	type: "补剂" | "工具" | string;
	score: number;
	note: string;
};

type Database = {
	prs: PRRecord[];
	reviews: Review[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../..");
const dbPath = path.join(root, "server", "data", "db.json");

function sendJson(res: ServerResponse, code: number, data: unknown): void {
	res.writeHead(code, {
		"Content-Type": "application/json; charset=utf-8",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	});
	res.end(JSON.stringify(data));
}

function readDb(): Database {
	return JSON.parse(fs.readFileSync(dbPath, "utf8")) as Database;
}

function serveFile(req: IncomingMessage, res: ServerResponse): void {
	const reqPath = req.url === "/" ? "/index.html" : (req.url ?? "/index.html");
	const safe = path.normalize(reqPath).replace(/^\.+/, "");
	const filePath = path.join(root, safe);

	if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
		res.writeHead(404);
		res.end("Not found");
		return;
	}

	const ext = path.extname(filePath);
	const typeMap: Record<string, string> = {
		".html": "text/html",
		".css": "text/css",
		".js": "application/javascript",
		".jsx": "application/javascript",
		".json": "application/json",
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".png": "image/png",
		".webp": "image/webp",
	};

	const type = typeMap[ext] || "text/plain";
	const value =
		type.startsWith("text/") ||
		type === "application/javascript" ||
		type === "application/json"
			? `${type}; charset=utf-8`
			: type;

	res.writeHead(200, { "Content-Type": value });
	res.end(fs.readFileSync(filePath));
}

const server = http.createServer(
	(req: { method: string; url: string }, res: any) => {
		if (req.method === "OPTIONS") {
			sendJson(res, 200, { ok: true });
			return;
		}

		if (req.url === "/api/health" && req.method === "GET")
			return sendJson(res, 200, { ok: true });
		if (req.url === "/api/prs" && req.method === "GET")
			return sendJson(res, 200, readDb().prs);
		if (req.url === "/api/reviews" && req.method === "GET")
			return sendJson(res, 200, readDb().reviews);

		if (req.url && !req.url.startsWith("/api")) {
			serveFile(req, res);
			return;
		}

		sendJson(res, 404, { error: "not found" });
	},
);

server.listen(4000, () => {
	console.log("TypeScript API server running: http://localhost:4000");
});
