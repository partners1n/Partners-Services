import { Env, ChatMessage } from "./types";
import flexTemplate from "./flex.json";

// ==========================================
// CONFIGURATIONS
// ==========================================
const MODEL_ID = "@cf/meta/llama-3.1-8b-instruct-fp8";
const VISION_MODEL_ID = "@cf/meta/llama-3.2-11b-vision-instruct";
const SYSTEM_PROMPT = "คุณคือเพื่อนคุยชื่อ 'ลูกรัก' เป็นผู้หญิงนิสัยน่ารัก เป็นกันเอง ร่าเริงและเอาใจใส่ ให้ตอบคำถามหรือพูดคุยด้วยข้อความที่สั้น กระชับ เป็นธรรมชาติเหมือนวัยรุ่นแชทคุยกับเพื่อน ไม่ตอบยาวเหยียด ไม่เป็นทางการเกินไป และมักจะมีหางเสียง (ค่ะ/จ้า) หรืออีโมจิน่ารักๆ บ้าง ห้ามตอบว่าชื่ออื่นเด็ดขาด";

const FLEX_ITEMS: Record<string, any> = {
	ราคาทองคำวันนี้: { name: "ราคาทองคำ", desc: "ราคาทองคำแท่งและรูปพรรณวันนี้", color: "#14F195", link: "https://liff.line.me/1654427780-E8BrD551" },
	eth: { name: "วิเคราะห์ราคาทอง (ล่าสุด)", desc: "ปัจจัยที่ทำให้ราคาขึ้น-ลง", color: "#14F195", link: "https://liff.line.me/1654427780-20g1klly" },
	sol: { name: "Solana (SOL)", desc: "เน้นความเร็วสูงและค่าธรรมเนียมถูกมาก", color: "#14F195", link: "https://liff.line.me/1654427780-5MEOYrrm" },
	hbar: { name: "Hedera (HBAR)", desc: "เทคโนโลยี Hashgraph ระดับองค์กร", color: "#14F195", link: "https://liff.line.me/1654427780-5jk71ZZ0" },
	สมมุติว่าลงทุน: { name: "Bitcoin (BTC)", desc: "ทองคำดิจิทัล มีจำกัด 21 ล้านเหรียญ", color: "#14F195", link: "https://liff.line.me/1654427780-0X7NPmm8" }
};

// ==========================================
// WORKER ENTRY POINT
// ==========================================
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/" || !url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
		
		if (url.pathname === "/api/chat" && request.method === "POST") return handleChatRequest(request, env);
		if (url.pathname === "/api/webhook" && request.method === "POST") return handleLineWebhook(request, env, ctx);
		if (url.pathname === "/api/cctv" && request.method === "POST") return handleCctvWebhook(request);
		if (url.pathname === "/api/ocr-view" && request.method === "GET") return handleOcrView(request, env);
		
		return new Response("Not found", { status: 404 });
	},

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		try {
			const list = await env.KV.list();
			const now = Date.now();
			const ONE_HOUR = 60 * 60 * 1000;

			for (const key of list.keys) {
                // ข้าม Key ที่เป็นประวัติการแชทและ OCR cache
                if (key.name.startsWith("history_") || key.name.startsWith("ocr_")) continue;

				const userId = key.name;
				const lastActiveStr = await env.KV.get(userId);
				if (!lastActiveStr) continue;

				const lastActive = parseInt(lastActiveStr, 10);

				if (now - lastActive >= ONE_HOUR && now - lastActive < ONE_HOUR * 2) {
					const message = "แวะมาทักทายค่ะ หายไป 1 ชั่วโมงแล้ว มีอะไรให้ช่วยเพิ่มบอกได้เลยนะคะ 😊";
					await fetch("https://api.line.me/v2/bot/message/push", {
						method: "POST",
						headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`},
						body: JSON.stringify({ to: userId, messages: [{ type: "text", text: message }] })
					});
					await env.KV.delete(userId);
				}
			}
		} catch (error) {
			console.error("Scheduled Task Error:", error);
		}
	}
} satisfies ExportedHandler<Env>;

// ==========================================
// API ROUTE HANDLERS
// ==========================================
async function handleCctvWebhook(request: Request): Promise<Response> {
	try {
		const body = await request.json() as { subject?: string, sender?: string, message?: string };
		const groupId = "C8417941ef26ab8d71a37e6248888ac97";

		let templateStr = JSON.stringify(flexTemplate.cctvAlertTemplate);
		templateStr = templateStr.replace(/\{subject\}/g, safeEscape(body.subject || "ไม่มีหัวข้อแจ้งเตือน"))
		                         .replace(/\{sender\}/g, safeEscape(body.sender || "ไม่ทราบระบบต้นทาง"))
		                         .replace(/\{message\}/g, safeEscape(body.message || "ไม่มีรายละเอียดเพิ่มเติม"));

		const flexMessage = JSON.parse(templateStr);

		await fetch("https://api.line.me/v2/bot/message/push", {
			method: "POST",
			headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
			body: JSON.stringify({ to: groupId, messages: [{ type: "flex", altText: "⚠️ แจ้งเตือนความปลอดภัยจาก XVR", contents: flexMessage }] })
		});
		return new Response("OK", { status: 200 });
	} catch (error) {
		return new Response("Error", { status: 500 });
	}
}

async function handleChatRequest(request: Request, env: Env): Promise<Response> {
	const { messages = [] } = (await request.json()) as { messages: ChatMessage[] };
	const stream = await env.AI.run(MODEL_ID, { messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages], max_tokens: 1024, stream: true });
	return new Response(stream, { headers: { "content-type": "text/event-stream; charset=utf-8" } });
}

async function handleLineWebhook(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	try {
		const body = await request.json() as any;
		const events = body.events || [];
		const baseUrl = new URL(request.url).origin;

		for (const event of events) {
			const replyToken = event.replyToken;
			const userId = event.source?.userId;
			
			if (!replyToken || replyToken === "00000000000000000000000000000000") continue;

			if (userId) ctx.waitUntil(env.KV.put(userId, Date.now().toString()));

			if (event.type === "message" && event.message.type === "image") {
				if (userId) ctx.waitUntil(processImage(event.message.id, userId, env, baseUrl));
				continue;
			}

			if (event.type === "message" && event.message.type === "text") {
				await processTextMessage(event.message.text, replyToken, userId || "", env, ctx);
			}
		}
	} catch (e) { 
		console.error("[Fatal Webhook Error]:", e); 
	}
	return new Response("OK", { status: 200 });
}

// ==========================================
// CORE LOGIC: TEXT PROCESSING
// ==========================================
async function processTextMessage(userMessage: string, replyToken: string, userId: string, env: Env, ctx: ExecutionContext) {
	const userMessageLower = userMessage.toLowerCase().trim();

	if (userMessageLower === "agree") {
		try {
			await env.AI.run(VISION_MODEL_ID, { prompt: "agree" } as any);
			await sendLineText(replyToken, "✅ ปลดล็อกระบบอ่านภาพ (Llama Vision) สำเร็จ พร้อมใช้งานค่ะ!", env);
		} catch (e) {
			await sendLineText(replyToken, "ระบบได้รับคำสั่ง agree เรียบร้อยแล้วค่ะ ลองส่งรูปดูนะคะ", env);
		}
		return;
	}

	if (userMessage.includes("[FORM_DATA]")) {
		const aiRes: any = await env.AI.run(MODEL_ID, {
			messages: [{ role: "system", content: "คุณคือที่ปรึกษาการลงทุน AI วิเคราะห์ข้อมูลและวางแผนพอร์ตคริปโตให้ลูกค้าอย่างมืออาชีพ" }, { role: "user", content: userMessage }],
			max_tokens: 1000,
		});
		await sendLineText(replyToken, extractAIResponse(aiRes, "บันทึกข้อมูลเรียบร้อยค่ะ", env));
		return;
	}

	const mentionedCoin = Object.keys(FLEX_ITEMS).find(key => userMessageLower.includes(key));
	if (mentionedCoin) {
		await sendTextAndCarousel(replyToken);
		return;
	}

    // --- ส่วนที่เพิ่มเข้ามา: จัดการ History ให้จำแค่ 3-4 แชทล่าสุดใน LINE ---
    let chatHistory: ChatMessage[] = [];
    
    // ดึงประวัติเก่ามาจาก KV
    if (userId) {
        const historyStr = await env.KV.get(`history_${userId}`);
        if (historyStr) {
            try { chatHistory = JSON.parse(historyStr); } catch (e) { }
        }
    }

    // เพิ่มข้อความล่าสุดของผู้ใช้
    chatHistory.push({ role: "user", content: userMessage });

    // จำกัดให้จำแค่ 8 ข้อความ (4 คู่สนทนาล่าสุด)
    const MAX_HISTORY_LENGTH = 8;
    if (chatHistory.length > MAX_HISTORY_LENGTH) {
        chatHistory = chatHistory.slice(chatHistory.length - MAX_HISTORY_LENGTH);
    }

    // ประมวลผลโดยส่ง History แนบไปให้ AI ด้วย
	const aiRes: any = await env.AI.run(MODEL_ID, {
		messages: [{ role: "system", content: SYSTEM_PROMPT }, ...chatHistory],
		max_tokens: 512,
	});

    const replyText = extractAIResponse(aiRes, "ระบบประมวลผลขัดข้องชั่วคราวค่ะ");
	await sendLineText(replyToken, replyText, env);

    // เซฟประวัติแชทกลับลงไปที่ KV (โดยใช้ ctx.waitUntil เพื่อไม่ให้หน่วงการตอบกลับของบอท)
    // ตั้งเวลาหมดอายุ (expirationTtl) ไว้ที่ 1 วัน (86400 วินาที) หากไม่คุยต่อ แชทจะรีเซ็ต
    if (userId) {
        chatHistory.push({ role: "assistant", content: replyText });
        ctx.waitUntil(env.KV.put(`history_${userId}`, JSON.stringify(chatHistory), { expirationTtl: 86400 }));
    }
}

// ==========================================
// CORE LOGIC: IMAGE & OCR PROCESSING
// ==========================================
async function processImage(messageId: string, userId: string, env: Env, baseUrl: string) {
	try {
		const imageRes = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
			headers: { "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` }
		});
		if (!imageRes.ok) throw new Error("ไม่สามารถดาวน์โหลดรูปภาพจากระบบ LINE ได้");

		const imageBuffer = await imageRes.arrayBuffer();
		const imageArray = Array.from(new Uint8Array(imageBuffer));

		const ocrPrompt = `Extract all text and numbers from this image. Arrange them neatly and orderly so it is easy to read. Keep all information intact. Use Thai as the main language but keep any English text exactly as it is. Output ONLY the clean extracted text. DO NOT add any conversational words or markdown.`;

		const ocrRes: any = await env.AI.run(VISION_MODEL_ID, { prompt: ocrPrompt, image: imageArray, max_tokens: 1024 } as any);
		const rawText = extractAIResponse(ocrRes, "").trim();

		if (!rawText) {
			await pushLineText(userId, "ไม่พบข้อความในภาพค่ะ ลองส่งภาพที่ชัดเจนขึ้นอีกครั้งนะคะ 🔍", env);
			return;
		}

		// แปลง markdown syntax ให้เป็นข้อความสะอาดก่อนแสดงผล
		const cleanText = stripMarkdown(rawText);

		// บันทึก text ลง KV พร้อม short ID สำหรับ link ดาวน์โหลด PDF (หมดอายุ 24 ชม.)
		const shortId = generateShortId();
		await env.KV.put(`ocr_${shortId}`, cleanText, { expirationTtl: 86400 });
		const viewUrl = `${baseUrl}/api/ocr-view?id=${shortId}`;

		await pushDocumentFlexMessage(userId, cleanText, viewUrl);

	} catch (error: any) {
		console.error("[OCR Process Error]:", error);
		await pushLineText(userId, `❌ ขออภัยค่ะ ระบบอ่านภาพมีปัญหา\n(${error.message})`, env);
	}
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function extractAIResponse(aiRes: any, fallbackStr: string): string {
	if (!aiRes) return fallbackStr;
	if (typeof aiRes === 'string') return aiRes;
	if (typeof aiRes.response === 'string') return aiRes.response;
	try { return JSON.stringify(aiRes); } catch { return fallbackStr; }
}

function extractCleanJSON(rawText: string): any | null {
	try { return JSON.parse(rawText); } 
	catch (e) {
		const startIndex = rawText.indexOf('{');
		const endIndex = rawText.lastIndexOf('}');
		if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
			const potentialJSON = rawText.substring(startIndex, endIndex + 1);
			try { return JSON.parse(potentialJSON); } catch (parseError) { return null; }
		}
		return null;
	}
}

function safeEscape(str: string): string {
	return (str || "-").toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * สร้างลิงก์ "แชร์ข้อความ" ตามรูปแบบ LINE URL Scheme (เปิดหน้าจอเลือกแชทเพื่อส่งต่อ)
 * LINE จำกัดความยาว uri ของปุ่มใน Flex Message ไว้ไม่เกิน 1000 ตัวอักษร
 * จึงต้องตัดข้อความให้พอดีกับขีดจำกัดหลัง encode แล้ว
 */
function buildLineShareUri(rawText: string): string {
	const prefix = "https://line.me/R/share?text=";
	const maxTotalLength = 990; // เผื่อพื้นที่ไว้ใต้ลิมิต 1000 ตัวอักษรของ LINE
	const header = "📄 ข้อความจากภาพ:\n";
	let body = rawText.trim();
	let full = header + body;

	while (prefix.length + encodeURIComponent(full).length > maxTotalLength && body.length > 0) {
		body = body.slice(0, -1);
		full = header + body + "…";
	}

	return prefix + encodeURIComponent(full);
}

/** คืนค่าวันที่-เวลาปัจจุบัน โซนเวลากรุงเทพฯ ในรูปแบบอ่านง่าย */
function getBangkokDateTimeStr(): string {
	const now = new Date();
	const datePart = now.toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "2-digit", month: "short", year: "numeric" });
	const timePart = now.toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false });
	return `${datePart} · ${timePart} น.`;
}

/**
 * แปลง Markdown syntax ให้เป็นข้อความธรรมดาสำหรับแสดงใน LINE Flex Message
 * AI vision model มักส่งกลับมาเป็น **bold**, # Heading, - list เป็นต้น
 */
function stripMarkdown(text: string): string {
	return text
		// Code blocks (```...```) → ดึงเฉพาะเนื้อหา
		.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => code.trim())
		// Headings (#, ##, ### ...) → ลบ # นำหน้าออก
		.replace(/^#{1,6}\s+/gm, '')
		// Bold (**text** หรือ __text__)
		.replace(/\*\*(.+?)\*\*/g, '$1')
		.replace(/__(.+?)__/g, '$1')
		// Italic (*text* หรือ _text_) — ระวัง single * ที่ไม่ใช่ list
		.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '$1')
		.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '$1')
		// Inline code (`code`)
		.replace(/`([^`]+)`/g, '$1')
		// Blockquote (> text)
		.replace(/^>\s*/gm, '')
		// Unordered list markers (- / * / + นำหน้า) → ใช้ • แทน
		.replace(/^[-*+]\s+/gm, '• ')
		// Horizontal rules (--- / *** / ___) → ลบออก
		.replace(/^[-*_]{3,}\s*$/gm, '')
		// ลด blank lines ซ้ำ
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/** สร้าง short ID แบบ hex 16 ตัว สำหรับ KV key */
function generateShortId(): string {
	const arr = new Uint8Array(8);
	crypto.getRandomValues(arr);
	return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==========================================
// LINE API SENDER FUNCTIONS
// ==========================================
async function sendTextAndCarousel(replyToken: string) {
	const bubbles = Object.values(FLEX_ITEMS).map(item => {
		let templateStr = JSON.stringify(flexTemplate.bubbleTemplate);
		templateStr = templateStr.replace(/\{color\}/g, safeEscape(item.color))
		                         .replace(/\{name\}/g, safeEscape(item.name))
		                         .replace(/\{desc\}/g, safeEscape(item.desc))
		                         .replace(/\{link\}/g, safeEscape(item.link));
		return JSON.parse(templateStr);
	});

	await fetch("https://api.line.me/v2/bot/message/reply", {
		method: "POST",
		headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
		body: JSON.stringify({ replyToken, messages: [{ type: "text", text: "จัดให้ค่ะ ✨" }, { type: "flex", altText: "ข้อมูลสินทรัพย์", contents: { type: "carousel", contents: bubbles } }] })
	});
}

/**
 * ส่ง Flex Message รูปแบบ "เอกสารมืออาชีพ" แสดงข้อความที่ OCR ได้จากภาพ
 * มี 2 ปุ่ม: บันทึกเป็น PDF (เปิดหน้าเว็บ print-ready) + แชร์ข้อความในไลน์
 */
async function pushDocumentFlexMessage(userId: string, cleanText: string, viewUrl: string) {
	if (!userId) return;

	const MAX_DISPLAY_CHARS = 2000;
	const isTruncated = cleanText.length > MAX_DISPLAY_CHARS;
	const displayText = isTruncated ? cleanText.slice(0, MAX_DISPLAY_CHARS) + "…" : cleanText;
	const shareUri = buildLineShareUri(cleanText);

	const bodyContents: any[] = [
		{
			type: "box",
			layout: "vertical",
			backgroundColor: "#f8fafc",
			cornerRadius: "md",
			paddingAll: "16px",
			borderWidth: "1px",
			borderColor: "#e2e8f0",
			contents: [
				{ type: "text", text: displayText, wrap: true, size: "sm", color: "#1e293b", lineSpacing: "8px" }
			]
		}
	];

	if (isTruncated) {
		bodyContents.push({ type: "text", text: "* แสดงเฉพาะบางส่วน กดปุ่มดูเอกสารเต็มได้ด้านล่าง", size: "xxs", color: "#9ca3af", margin: "sm" });
	}

	bodyContents.push({ type: "separator", margin: "lg", color: "#e5e7eb" });
	bodyContents.push({
		type: "box",
		layout: "horizontal",
		margin: "lg",
		contents: [
			{ type: "text", text: "🔎 ตรวจพบข้อความ", size: "xs", color: "#9ca3af", flex: 1 },
			{ type: "text", text: `${cleanText.length.toLocaleString("th-TH")} ตัวอักษร`, size: "xs", color: "#6b7280", align: "end", weight: "bold" }
		]
	});

	const documentBubble = {
		type: "bubble",
		size: "mega",
		header: {
			type: "box",
			layout: "vertical",
			backgroundColor: "#0f172a",
			paddingAll: "20px",
			contents: [
				{ type: "text", text: "DOCUMENT SCAN", size: "xs", weight: "bold", color: "#38bdf8" },
				{ type: "text", text: "ผลการอ่านข้อความจากภาพ", weight: "bold", size: "xl", color: "#ffffff", margin: "sm", wrap: true },
				{
					type: "box",
					layout: "baseline",
					margin: "md",
					spacing: "xs",
					contents: [
						{ type: "text", text: "🕒", size: "xs", flex: 0 },
						{ type: "text", text: getBangkokDateTimeStr(), size: "xs", color: "#94a3b8", flex: 0 }
					]
				}
			]
		},
		body: {
			type: "box",
			layout: "vertical",
			paddingAll: "20px",
			backgroundColor: "#ffffff",
			contents: bodyContents
		},
		footer: {
			type: "box",
			layout: "vertical",
			paddingAll: "20px",
			spacing: "sm",
			contents: [
				{
					type: "button",
					style: "primary",
					height: "md",
					color: "#0f172a",
					action: { type: "uri", label: "💾 บันทึกเป็น PDF", uri: viewUrl }
				},
				{
					type: "button",
					style: "secondary",
					height: "md",
					action: { type: "uri", label: "📤 แชร์ข้อความนี้", uri: shareUri }
				},
				{ type: "text", text: "ลิงก์ดูเอกสารหมดอายุใน 24 ชม.", size: "xxs", color: "#9ca3af", align: "center", margin: "sm" }
			]
		}
	};

	await fetch("https://api.line.me/v2/bot/message/push", {
		method: "POST",
		headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
		body: JSON.stringify({
			to: userId,
			messages: [{ type: "flex", altText: "📄 ผลการอ่านข้อความจากภาพ", contents: documentBubble }]
		})
	});
}

/**
 * แสดงหน้าเอกสาร HTML แบบ print-ready สำหรับ export เป็น PDF
 * ดึง text จาก KV ด้วย short ID ที่แนบมาใน query string ?id=xxx
 */
async function handleOcrView(request: Request, env: Env): Promise<Response> {
	const id = new URL(request.url).searchParams.get('id');
	if (!id) return new Response('<p>ไม่พบ ID เอกสาร</p>', { status: 400, headers: { 'content-type': 'text/html;charset=utf-8' } });

	const text = await env.KV.get(`ocr_${id}`);
	if (!text) {
		return new Response(`<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>หมดอายุ</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0f4f8;margin:0}.card{background:white;padding:40px;border-radius:16px;text-align:center;color:#64748b}h2{color:#1e293b}</style></head><body><div class="card"><h2>⏰ เอกสารหมดอายุแล้ว</h2><p>ลิงก์นี้ใช้ได้ 24 ชั่วโมงเท่านั้น<br>กรุณาส่งรูปภาพมาใหม่อีกครั้งค่ะ</p></div></body></html>`,
			{ status: 410, headers: { 'content-type': 'text/html;charset=utf-8' } });
	}

	const timestamp = getBangkokDateTimeStr();
	// escape HTML entities เพื่อป้องกัน XSS และแปลง newline → <br>
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\n/g, '<br>');

	const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ผลการอ่านข้อความจากภาพ</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Sarabun', sans-serif; background: #f0f4f8; color: #1e293b; min-height: 100vh; }

  .page { max-width: 820px; margin: 0 auto; padding: 24px 16px 40px; }

  /* Header */
  .doc-header { background: #0f172a; color: #fff; border-radius: 12px 12px 0 0; padding: 28px 32px; }
  .doc-header .badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 2.5px; color: #38bdf8; text-transform: uppercase; margin-bottom: 8px; }
  .doc-header h1 { font-size: 22px; font-weight: 700; line-height: 1.3; }
  .doc-header .meta { margin-top: 10px; font-size: 13px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }

  /* Body */
  .doc-body { background: #fff; border: 1px solid #e2e8f0; border-top: none; padding: 36px 40px; line-height: 2; font-size: 15px; min-height: 300px; }

  /* Footer toolbar */
  .toolbar { background: #fff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;
    padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .char-info { font-size: 12px; color: #9ca3af; }
  .btn-pdf { background: #0f172a; color: #fff; border: none; padding: 11px 28px; border-radius: 8px;
    font-family: 'Sarabun', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px; transition: background .15s; }
  .btn-pdf:hover { background: #1e3a5f; }

  /* Print styles */
  @media print {
    body { background: #fff; }
    .page { padding: 0; max-width: 100%; }
    .doc-header { border-radius: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .doc-body { border-left: none; border-right: none; padding: 28px 0; }
    .toolbar { display: none !important; }
  }

  @media (max-width: 600px) {
    .doc-header { padding: 20px; border-radius: 8px 8px 0 0; }
    .doc-header h1 { font-size: 18px; }
    .doc-body { padding: 20px; font-size: 14px; }
    .toolbar { padding: 14px 20px; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="doc-header">
    <div class="badge">Document Scan</div>
    <h1>ผลการอ่านข้อความจากภาพ</h1>
    <div class="meta">🕒 ${timestamp}</div>
  </div>
  <div class="doc-body">${escaped}</div>
  <div class="toolbar">
    <span class="char-info">🔎 ${text.length.toLocaleString('th-TH')} ตัวอักษร</span>
    <button class="btn-pdf" onclick="window.print()">💾 บันทึกเป็น PDF</button>
  </div>
</div>
</body>
</html>`;

	return new Response(html, { headers: { 'content-type': 'text/html;charset=utf-8' } });
}

async function sendLineText(replyToken: string, text: string, env: Env) {
	if (!text) return;
	await fetch("https://api.line.me/v2/bot/message/reply", {
		method: "POST",
		headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
		body: JSON.stringify({ replyToken, messages: [{ type: "text", text: text.toString() }] })
	});
}
async function pushLineText(userId: string, text: string, env: Env) {
	if (!userId || !text) return;
	await fetch("https://api.line.me/v2/bot/message/push", {
		method: "POST",
		headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
		body: JSON.stringify({ to: userId, messages: [{ type: "text", text: text.toString() }] })
	});
}
